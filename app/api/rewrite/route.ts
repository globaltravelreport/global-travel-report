import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import OpenAI from 'openai'
import * as cheerio from 'cheerio'
import { safeLogError } from '../../utils/safeLogger'
import { logger } from '@/app/utils/logger'

// === Config & Constants ===
const OPENAI_MODEL = 'gpt-4'
const MAX_CONTENT_LENGTH = 4000
const MIN_CONTENT_LENGTH = 100
const RETRY_DELAY_MS = 2000
const MAX_RETRIES = 3

// === Runtime Config ===
export const runtime = 'edge'
export const maxDuration = 60 // 60 seconds timeout

// === Types ===
interface RewriteResult {
  title: string
  summary: string
  content: string
  keywords: string[]
}

interface ApiError extends Error {
  status?: number
}

// === OpenAI Client ===
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30_000,
})

// === Helpers ===
function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && 'status' in error
}

function isRewriteResult(obj: unknown): obj is RewriteResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'title' in obj &&
    'summary' in obj &&
    'content' in obj &&
    'keywords' in obj &&
    typeof (obj as RewriteResult).title === 'string' &&
    typeof (obj as RewriteResult).summary === 'string' &&
    typeof (obj as RewriteResult).content === 'string' &&
    Array.isArray((obj as RewriteResult).keywords)
  )
}

const rewritePrompt = `Rewrite this story as if you're a professional human editor with years of experience in travel journalism. The writing should be natural, thoughtful, and conversational — with varied sentence lengths, subtle emotional tone, and occasional human touches like brief asides or soft opinions. Avoid AI-sounding language, repetition, or perfection. The result should feel like an authentic, polished piece crafted by an expert travel writer — not a machine.

Original content:
[CONTENT]

Format your response exactly as follows, using the separator "---" between sections:

[SEO-optimized title without any numbers or prefixes]
---
[Meta description]
---
[Keywords as a comma-separated list without numbers]
---
[Rewritten article in plain text without any markdown, numbers, or special formatting]
---
[Brief summary in 2-3 sentences highlighting key takeaways for Australian travelers]
---
[Primary destination country]
---
[Type of travel (e.g., Adventure, Luxury, Budget, Family, Culture, Food & Wine) without numbers or special characters]`

async function rewriteContent(content: string, retries = MAX_RETRIES): Promise<RewriteResult> {
  const truncated = content.length > MAX_CONTENT_LENGTH
    ? content.slice(0, MAX_CONTENT_LENGTH) + '...'
    : content

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.7,
      max_tokens: 2000,
      messages: [
        {
          role: 'system',
          content: rewritePrompt
        },
        {
          role: 'user',
          content: truncated
        }
      ]
    })

    const raw = response.choices[0]?.message?.content?.trim()
    if (!raw) {
      throw new Error('No response from OpenAI')
    }

    // Try to extract JSON if response contains extra text
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : raw

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonStr)
    } catch (e) {
      // Try to clean the response and parse again
      const cleaned = jsonStr
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      
      try {
        parsed = JSON.parse(cleaned)
      } catch (e2) {
        safeLogError('Failed to parse OpenAI response as JSON', e2, { raw, jsonStr, cleaned })
        throw new Error('OpenAI response was not valid JSON')
      }
    }

    if (!isRewriteResult(parsed)) {
      throw new Error('Missing required fields in OpenAI response')
    }

    return parsed
  } catch (error) {
    safeLogError('rewriteContent error', error)
    
    if (isApiError(error) && error.status === 429 && retries > 0) {
      await new Promise(res => setTimeout(res, RETRY_DELAY_MS))
      return rewriteContent(content, retries - 1)
    }

    if (retries > 0) {
      await new Promise(res => setTimeout(res, RETRY_DELAY_MS))
      return rewriteContent(content, retries - 1)
    }

    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

async function extractFromURL(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GlobalTravelReport/1.0; +https://www.globaltravelreport.com)'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL. Status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    
    // Remove non-content elements
    $('script, style, iframe, noscript, nav, footer, header, aside, .ads, .comments, .sidebar').remove()

    const title = $('h1').first().text().trim() || $('title').text().trim()
    const content = $('p, h2, h3, h4, li')
      .map((_i, el) => {
        const text = $(el).text().trim()
        return text.length > 30 ? text : null
      })
      .get()
      .filter(Boolean)
      .join('\n\n')

    return `${title}\n\n${content}`
  } catch (error) {
    logger.error('Error extracting content:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to extract content from URL')
  }
}

// === API Handler ===
export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers })
  }

  try {
    const body = await request.json()
    const { url, content } = body

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not set' }, { status: 500, headers })
    }

    let articleContent = content?.trim()
    if (url) {
      try {
        articleContent = await extractFromURL(url)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Could not extract content from URL'
        return NextResponse.json({ error: errorMessage }, { status: 400, headers })
      }
    }

    if (!articleContent || articleContent.length < MIN_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: 'Please provide valid content to rewrite' },
        { status: 400, headers }
      )
    }

    const result = await rewriteContent(articleContent)
    return NextResponse.json(result, { headers })
  } catch (_e) {
    logger.error('Failed to rewrite content:', _e)
    const message = _e instanceof Error ? _e.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500, headers })
  }
} 