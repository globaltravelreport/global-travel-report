import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import axios from 'axios'
import * as cheerio from 'cheerio'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url, content } = body

    console.log('Received request:', { url, content: content ? 'Content provided' : 'No content' })

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured')
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    let articleContent = content

    // If URL is provided, fetch and extract content
    if (url) {
      try {
        console.log('Fetching content from URL:', url)
        const response = await axios.get(url)
        const $ = cheerio.load(response.data)
        
        // Remove unwanted elements
        $('script, style, iframe, noscript').remove()
        
        // Extract main content
        const title = $('h1').first().text().trim()
        const paragraphs = $('p')
          .map((_index: number, el: any) => $(el).text().trim())
          .get()
          .filter((text: string) => text.length > 50) // Filter out short paragraphs
        
        articleContent = `${title}\n\n${paragraphs.join('\n\n')}`
        console.log('Extracted content length:', articleContent.length)
      } catch (error) {
        console.error('Error fetching URL:', error)
        return NextResponse.json(
          { error: 'Failed to fetch content from URL' },
          { status: 400 }
        )
      }
    }

    if (!articleContent) {
      console.error('No content provided')
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      )
    }

    console.log('Sending content to OpenAI')
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert travel journalist rewriting this article to sound original, engaging, and informative. 
          Remove fluff, avoid repetition, preserve facts, and rewrite in a tone suitable for Global Travel Report. 
          Include:
          - Rewritten title
          - Article summary
          - Main content (optimised for clarity and flow)
          - 8–10 relevant keywords for SEO
          Return as structured JSON: { title, summary, content, keywords }`
        },
        {
          role: 'user',
          content: articleContent
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const result = completion.choices[0].message.content
    if (!result) {
      throw new Error('No response from OpenAI')
    }

    console.log('Received response from OpenAI')
    return NextResponse.json(JSON.parse(result))
  } catch (error) {
    console.error('Error in rewrite route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to rewrite content' },
      { status: 500 }
    )
  }
} 