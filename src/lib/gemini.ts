import { GoogleGenAI } from '@google/genai'
import { Document } from '@langchain/core/documents'

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

export const aiSummariseCommit = async (diff: string) => {
  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert programmer, and you are trying to summarize a git diff.
                Reminders about the git diff format:
                ...`
    })
    return response.text
  } catch (error) {
    console.error('Error summarizing commit:', error)
    return ''
  }
}

export async function summariseCode(doc: Document) {
  try {
    const code = doc.pageContent.slice(0, 10000)
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects...
                ${code}`
    })
    return response.text
  } catch (error) {
    console.error('Error summarizing code:', error)
    return ''
  }
}

export async function generateEmbedding(summary: string) {
  try {
    const response = await genAI.models.embedContent({
      model: 'gemini-embedding-001',
      contents: summary,
      config: {
        outputDimensionality: 768
      }
    })
    return response.embeddings
  } catch (error) {
    console.error('Error generating embedding:', error)
    return null
  }
}