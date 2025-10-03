import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'
import { Document } from '@langchain/core/documents'
import { summariseCode, generateEmbedding } from './gemini'
import { db } from '@/server/db'
import { Octokit } from 'octokit'

const getFileCount = async (
  octokit: Octokit,
  githubOwner: string,
  githubRepo: string,
  branch: string = 'main'
): Promise<number> => {
  const { data: branchData } = await octokit.rest.repos.getBranch({
    owner: githubOwner,
    repo: githubRepo,
    branch
  });

  const treeSha = branchData.commit.commit.tree.sha;

  const { data: treeData } = await octokit.rest.git.getTree({
    owner: githubOwner,
    repo: githubRepo,
    tree_sha: treeSha,
    recursive: 'true'
  });

  if (treeData.truncated) {
    throw new Error('Repo tree too large, consider downloading the archive.');
  }

  return treeData.tree.filter(item => item.type === 'blob').length;
};

export const checkCredits = async (
  githubUrl: string,
  githubToken?: string
): Promise<number> => {
  const octokit = new Octokit({
    auth: githubToken || process.env.GITHUB_TOKEN
  });

  const parts = githubUrl.split('/');
  const githubOwner = parts[3];
  const githubRepo = parts[4];

  if (!githubOwner || !githubRepo) {
    return 0; // invalid URL
  }

  const fileCount = await getFileCount(octokit, githubOwner, githubRepo);

  return fileCount;
};

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || '',
    branch: 'main',
    ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.json', 'bun.lock'],
    recursive: true,
    unknown: 'warn',
    maxConcurrency: 5
  });
  const docs = await loader.load();
  return docs;
};

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  const allEmbeddings = await generateEmbeddings(docs);

  await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
    console.log(`processing ${index} of ${allEmbeddings.length}`);
    if (!embedding) return;

    const sourceCodeEmbedding = await db.sourceCodeEmbeddings.create({
      data: {
        sourceCode: embedding.sourceCode,
        summary: embedding.summary ?? '',
        fileName: embedding.fileName,
        projectId
      }
    });

    const embeddings = embedding.embedding;
    if (!embeddings || embeddings.length === 0) {
      return;
    }

    const VectorEmbedding = embeddings[0].values;
    const vector = `[${VectorEmbedding.join(',')}];`;

    await db.$executeRaw`UPDATE "SourceCodeEmbeddings" SET "summaryEmbedding" = ${vector}::vector WHERE "id" = ${sourceCodeEmbedding.id}`;
  }));
};

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(docs.map(async (doc) => {
    const summary = await summariseCode(doc);
    const embedding = await generateEmbedding(summary!);
    return {
      summary,
      embedding,
      sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
      fileName: doc.metadata.source
    };
  }));
};
