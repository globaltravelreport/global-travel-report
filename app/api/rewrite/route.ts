import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs/promises'
import path from 'path'

// Validate OpenAI API key before initializing client
const openaiApiKey = process.env.OPENAI_API_KEY
if (!openaiApiKey) {
  console.error('Error: OPENAI_API_KEY is not set in environment variables')
  throw new Error('OpenAI API key is not configured')
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openaiApiKey,
})

const ARTICLES_FILE = path.join(process.cwd(), 'app/data/articles.json')

async function saveArticle(article: any) {
  try {
    let articles = []
    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(ARTICLES_FILE), { recursive: true })
      
      try {
        const fileContent = await fs.readFile(ARTICLES_FILE, 'utf-8')
        articles = JSON.parse(fileContent)
      } catch (error) {
        // File doesn't exist or is empty, create it with an empty array
        await fs.writeFile(ARTICLES_FILE, '[]', 'utf-8')
      }
    } catch (error) {
      console.error('Error reading/creating articles file:', error)
    }

    // Add new article with timestamp
    const newArticle = {
      ...article,
      createdAt: new Date().toISOString(),
      slug: article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      image: article.image || '/images/articles/default.jpg'
    }

    articles.unshift(newArticle) // Add to beginning of array
    await fs.writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2))
    return newArticle
  } catch (error) {
    console.error('Error saving article:', error)
    throw new Error('Failed to save article')
  }
}

export async function POST(request: Request) {
  try {
    const { content, sourceUrl, guidelines } = await request.json()

    if (!content && !sourceUrl) {
      return NextResponse.json(
        { error: 'Either content or sourceUrl must be provided' },
        { status: 400 }
      )
    }

    // Create system prompt based on guidelines
    const systemPrompt = `You are a professional travel content writer for ${guidelines.platform}.
    Rewrite the provided content to be ${guidelines.tone} while maintaining the core message.
    The content should be ${guidelines.length} and follow these requirements:
    ${guidelines.requirements.join('\n')}
    
    Return the content in the following JSON format:
    {
      "title": "A compelling title for the article",
      "summary": "A one-sentence summary of the article",
      "content": "The rewritten article content",
      "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
      "image": "URL to a relevant travel image"
    }`

    // If sourceUrl is provided, fetch the content
    let contentToRewrite = content
    if (sourceUrl) {
      try {
        console.log('Fetching content from URL:', sourceUrl)
        const response = await fetch(sourceUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.google.com'
          }
        })
        
        if (response.status === 403) {
          throw new Error('Access to this URL is forbidden. Please try a different URL or paste the content directly.')
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch content: ${response.statusText}`)
        }

        const html = await response.text()
        
        // Extract main content and clean HTML
        let cleanContent = html
          // Remove scripts and style tags
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          // Remove HTML comments
          .replace(/<!--[\s\S]*?-->/g, '')
          // Convert breaks to spaces
          .replace(/<br\s*\/?>/gi, ' ')
          // Remove all HTML tags
          .replace(/<[^>]*>/g, ' ')
          // Clean up whitespace
          .replace(/\s+/g, ' ')
          .trim()

        // Truncate content to approximately 2000 tokens (roughly 8000 characters)
        // This is a safer limit for GPT-3.5-turbo to handle both input and output
        const maxLength = 8000
        if (cleanContent.length > maxLength) {
          console.log('Content too large, truncating to first 8000 characters...')
          cleanContent = cleanContent.substring(0, maxLength) + '...'
        }
        
        // Extract only the main article content by looking for common patterns
        const contentMatches = cleanContent.match(/article|main|content/i)
        if (contentMatches) {
          const startIndex = contentMatches.index || 0
          cleanContent = cleanContent.slice(startIndex)
        }
        
        contentToRewrite = cleanContent

        if (!contentToRewrite) {
          throw new Error('No content could be extracted from the URL')
        }

        console.log('Successfully fetched and processed content from URL')
        console.log('Content length:', contentToRewrite.length, 'characters')
      } catch (error) {
        console.error('Error fetching URL content:', error)
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Failed to fetch content from URL. Please try pasting the content directly.' },
          { status: 400 }
        )
      }
    }

    console.log('Calling OpenAI API...')
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: contentToRewrite }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    })

    const rewrittenContent = JSON.parse(completion.choices[0]?.message?.content || '{}')

    if (!rewrittenContent.title || !rewrittenContent.content) {
      console.error('Invalid response format from OpenAI')
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      )
    }

    // Save the article
    const savedArticle = await saveArticle(rewrittenContent)

    console.log('Successfully rewrote and saved content')
    return NextResponse.json(savedArticle)

  } catch (error) {
    console.error('Error in rewrite API:', error)
    
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your OpenAI API key configuration.' },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 