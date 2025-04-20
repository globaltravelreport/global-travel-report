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
        const response = await axios.get(url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; GlobalTravelReport/1.0; +https://www.globaltravelreport.com)'
          }
        })
        const $ = cheerio.load(response.data)
        
        // Remove unwanted elements
        $('script, style, iframe, noscript, nav, footer, header').remove()
        
        // Extract main content
        const title = $('h1').first().text().trim() || $('title').text().trim()
        const paragraphs = $('p, h2, h3')
          .map((_index: number, el: any) => {
            const text = $(el).text().trim()
            return text.length > 30 ? text : null // Filter out very short paragraphs
          })
          .get()
          .filter(Boolean)
        
        articleContent = `${title}\n\n${paragraphs.join('\n\n')}`
        console.log('Extracted content length:', articleContent.length)
      } catch (error) {
        console.error('Error fetching URL:', error)
        return NextResponse.json(
          { error: 'Failed to fetch content from URL. Please check the URL and try again.' },
          { status: 400 }
        )
      }
    }

    if (!articleContent) {
      console.error('No content provided')
      return NextResponse.json(
        { error: 'Please provide either a URL or content to rewrite' },
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
          Follow these guidelines:
          1. Create a compelling title that captures attention
          2. Write a concise summary (2-3 sentences)
          3. Rewrite the content to be:
             - Original and unique
             - Well-structured with clear sections
             - Engaging and informative
             - Free of fluff and repetition
          4. Include 8-10 relevant SEO keywords
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