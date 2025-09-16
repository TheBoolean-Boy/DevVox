import { db } from '@/server/db'
import { Octokit } from 'octokit'
import axios from "axios"
import { aiSummariseCommit } from './gemini'

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

// const githubUrl = 'https://github.com/docker/genai-stack'

type Response = {
  commitHash: string
  commitMessage: string
  commitAuthorName: string
  commitAuthorAvatar: string
  commitDate: string
}

export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {

  const [owner, repo] = githubUrl.split("/").slice(-2)

  if(!owner || !repo){
    throw new Error("Invalid github url")
  }

  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  })

  // console.log({data})

  const sortedCommits = data.sort((a: any, b: any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()) as any[]

  return sortedCommits.slice(0, 10).map((commit: any) => {
    return {
      commitHash: commit.sha as string,
      commitMessage: commit.commit.message ?? "",
      commitAuthorName: commit.commit?.author?.name ?? "",
      commitAuthorAvatar: commit?.author?.avatar_url ?? "",
      commitDate: commit.commit?.author?.date ?? ""
    }
  })
}

export const pollCommits = async (projectId: string) => {
  const {project, githubUrl} = await fetchProjectGithubUrl(projectId)
  const commitHashes = await getCommitHashes(githubUrl)
  const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes)
  // console.log(unprocessedCommits)
  const summaryReponses = await Promise.allSettled(unprocessedCommits.map(commit => {
    return summariseCommit(githubUrl, commit.commitHash)
  }))

  // So here actually summaryResponses 
  return unprocessedCommits;
}

async function summariseCommit(githubUrl:string, commitHash: string) {
  const {data} = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers:{
      Accept: 'application/vnd.github.v3.diff'
    }
  })

  console.log(typeof data)

  return await aiSummariseCommit(data) || "Couldn't get summarises for commits"
}

async function fetchProjectGithubUrl(projectId:string) {
  const project = await db.project.findUnique({
    where:{
      id: projectId
    },
    select:{
      githubUrl: true
    }
  })
  if(!project?.githubUrl){
    throw new Error("Project has no Gitub URL")
  }
  return {project, githubUrl: project?.githubUrl}
}

async function filterUnprocessedCommits(projectId:string, commitHashes: Response[]) {
  const processedCommits = await db.commit.findMany({
    where:{
      projectId: projectId
    }
  })

  const unprocessedCommits = commitHashes.filter( (commit) => !processedCommits.some((processedCommits) => processedCommits.commitHash === commit.commitHash))

  return unprocessedCommits
}

await pollCommits('cmfkzaqaq0000kliwvmgpso4g')