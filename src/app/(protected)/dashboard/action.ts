"use server"
import { createStreamableValue } from '@ai-sdk/rsc'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateEmbedding } from '@/lib/gemini'
import { db } from '@/server/db'
import { streamText } from 'ai'
import { toast } from 'sonner'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

export async function askQuestion(question: string, projectId?: string) {
  const stream = createStreamableValue()

  // console.log("A QUESTION WAS ASKED")

  const embeddings = await generateEmbedding(question)
  if (!embeddings || embeddings.length === 0) {
    toast.error("Failed to get embeddings")
    throw new Error("Failed to get embeddings")
  }
  const queryVector = embeddings[0]?.values
  // console.log(JSON.stringify(queryVector, null, 2))
  // console.log("Here is the question embedding ->  ", queryVector)



  const vectorQuery = `[${queryVector?.join(',')}]`
  // console.log("Here is the Vector Query we got from queryVector  ->  ", vectorQuery) 


  const result = await db.$queryRaw`
  SELECT "fileName", "sourceCode", "summary",
         1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
  FROM "SourceCodeEmbeddings"
  WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > .5
    AND "projectId" = ${projectId}
  ORDER BY similarity DESC
  LIMIT 10
` as { fileName: string; sourceCode: string; summary: string }[]

  // console.log("here are relevant file ->  ", JSON.stringify(result, null, 2))

  let context = ''

  for (const doc of result) {
    context += `source: ${doc.fileName} \n code content: ${doc.sourceCode} \n summary of file: ${doc.summary}\n\n`
    // console.log("Forging the context now ")
  }

  (async () => {
    const { textStream } = await streamText({
      model: google('gemini-2.5-flash'),
      
      prompt:
        `You are a ai code assistant who answers questions about the codebase. Your target audience is a technical intern who is looking to   understand the codebase
         AI assistant is a brand new, powerful, human-like artificial intelligence.
         The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
         AI is a well-behaved and well-mannered individual.
         AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
         AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in
         If the question is asking about code or a specific file, AI will provide the detailed answer, giving step by step instr
         START CONTEXT BLOCK
         ${context}
         END OF CONTEXT BLOCK

         START QUESTION
         ${question}
         END OF QUESTION
         AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
         If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answ
         AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
         AI assistant will not invent anything that is not drawn directly from the context.
         Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering, make sure there is`

    })

    for await (const delta of textStream) {
      stream.update(delta)
      // console.log("Updating text to stream ")
    }

    stream.done()
  })()


  return {
    output: stream.value,
    fileReferences: result
  }
}

// await askQuestion("Hi This is a question")