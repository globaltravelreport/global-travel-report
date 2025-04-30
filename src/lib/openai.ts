import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export class OpenAIError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message)
    this.name = 'OpenAIError'
  }
}

/* eslint-disable no-console */
export async function rewriteArticle(content: string, style: 'casual' | 'formal' | 'professional' = 'professional'): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a professional travel writer. Rewrite the given article in a ${style} style while maintaining the key information and improving readability. Focus on making the content engaging and informative for travel enthusiasts.`
        },
        {
          role: 'user',
          content: content
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    return completion.choices[0]?.message?.content || content
  } catch (error) {
    throw new OpenAIError('Failed to rewrite article', error)
  }
}

export async function generateArticleExcerpt(content: string, maxLength: number = 160): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `Generate a compelling excerpt for this travel article. The excerpt should be engaging, informative, and no longer than ${maxLength} characters.`
        },
        {
          role: 'user',
          content: content
        }
      ],
      temperature: 0.7,
      max_tokens: 100,
    })

    return completion.choices[0]?.message?.content || content.slice(0, maxLength)
  } catch (error) {
    throw new OpenAIError('Failed to generate excerpt', error)
  }
}

export async function suggestTags(content: string): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Generate relevant travel-related tags for this article. Return only the tags as a comma-separated list.'
        },
        {
          role: 'user',
          content: content
        }
      ],
      temperature: 0.5,
      max_tokens: 100,
    })

    const tags = completion.choices[0]?.message?.content?.split(',').map(tag => tag.trim()) || []
    return tags.filter(tag => tag.length > 0)
  } catch (error) {
    throw new OpenAIError('Failed to suggest tags', error)
  }
} 