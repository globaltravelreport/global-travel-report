import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import axios from 'axios'
import * as cheerio from 'cheerio'
import OpenAI from 'openai'
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { logger } from '@/app/utils/logger'
import { fetchUnsplashImage } from '@/app/lib/unsplash'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Initialize RSS parser
const parser = new Parser()

// Constants
const MAX_DAILY_STORIES = 8
const SEO_REVIEW_DIR = 'content/seo/daily'

// Sensitive topics filter
const SENSITIVE_TOPICS = [
  'black travelers',
  'african-american',
  'latino travelers',
  'lgbt',
  'lgbtq',
  'bipoc',
  'indigenous',
  'queer travelers',
  'asian-american',
  'muslim travelers',
  'hispanic travelers'
]

interface Article {
  title: string
  url: string
  content: string
  summary: string
  country: string
  type: string
  imageUrl?: string
  imageAlt?: string
  imageCredit?: string
  imageLink?: string
  date: string
  slug: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  originalTitle: string
}

function containsSensitiveTopics(text: string): boolean {
  const normalizedText = text.toLowerCase()
  return SENSITIVE_TOPICS.some(topic => normalizedText.includes(topic.toLowerCase()))
}

async function extractContent(url: string): Promise<string> {
  try {
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)
    
    // Remove unwanted elements
    $('script, style, nav, header, footer, iframe, .ads').remove()
    
    // Get the main content
    const article = $('article').first()
    const mainContent = article.length ? article : $('main')
    const content = mainContent.length ? mainContent : $('body')
    
    return content.text().trim()
  } catch (error) {
    logger.error(`Error extracting content from ${url}:`, error)
    throw error
  }
}

async function rewriteArticle(content: string, originalTitle: string): Promise<{
  rewrittenContent: string
  summary: string
  country: string
  type: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  rewrittenTitle: string
}> {
  try {
    const systemPrompt = `You are a professional travel writer and destination expert for the Global Travel Report, specializing in Australian travel perspectives.`

    const prompt = `Rewrite this story as if you're a professional human editor with years of experience in travel journalism. The writing should be natural, thoughtful, and conversational — with varied sentence lengths, subtle emotional tone, and occasional human touches like brief asides or soft opinions. Avoid AI-sounding language, repetition, or perfection. The result should feel like an authentic, polished piece crafted by an expert travel writer — not a machine.

Original title: ${originalTitle}
      
Original content:
${content}
      
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }],
      temperature: 0.7
    })

    const response = completion.choices[0].message.content || ''
    const parts = response.split('---')

    return {
      metaTitle: parts[0]?.trim() || originalTitle,
      metaDescription: parts[1]?.trim() || '',
      keywords: parts[2]?.trim().split(',').map(k => k.trim()),
      rewrittenContent: parts[3]?.trim(),
      summary: parts[4]?.trim() || '',
      country: parts[5]?.trim() || 'Unknown',
      type: parts[6]?.trim() || 'General',
      rewrittenTitle: parts[0]?.trim() || originalTitle
    }
  } catch (error) {
    logger.error('Error rewriting article:', error)
    throw error
  }
}

async function saveArticle(article: Article): Promise<void> {
  try {
    const articlesDir = path.join(process.cwd(), 'content/articles')
    const fileName = `${article.slug}.md`
    const filePath = path.join(articlesDir, fileName)

    // Prepare frontmatter
    const frontmatter = {
      title: article.title,
      summary: article.summary,
      date: article.date,
      country: article.country,
      type: article.type,
      imageUrl: article.imageUrl,
      imageAlt: article.imageAlt,
      imageCredit: article.imageCredit,
      imageLink: article.imageLink,
      slug: article.slug,
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      keywords: article.keywords,
      originalTitle: article.originalTitle
    }

    // Create markdown with frontmatter
    const markdown = matter.stringify(article.content, frontmatter)

    // Ensure directory exists
    await fs.mkdir(articlesDir, { recursive: true })

    // Write file
    await fs.writeFile(filePath, markdown)
    logger.info(`Saved article: ${fileName}`)
  } catch (error) {
    logger.error('Error saving article:', error)
    throw error
  }
}

async function generateSEOReview(articles: Article[]) {
  try {
    const articlesData = articles.map(article => ({
      title: article.title,
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      keywords: article.keywords.join(', '),
      summary: article.summary
    })).join('\n\n');

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a professional SEO expert specializing in travel content. Review today's published articles and provide actionable insights.
          
Focus on:
- Headline effectiveness and click-through potential
- Keyword usage and placement
- Meta descriptions and their appeal
- Content relevance for Australian travelers
- Search ranking potential
- Areas for improvement

Format your response in markdown with clear sections.`
        },
        {
          role: "user",
          content: `Review these ${articles.length} articles published today:\n\n${articlesData}`
        }
      ],
      temperature: 0.7
    });

    const review = response.choices[0].message.content || '';
    const date = new Date().toISOString().split('T')[0];
    
    // Ensure directory exists
    await fs.mkdir(SEO_REVIEW_DIR, { recursive: true });
    
    // Save review
    const reviewPath = path.join(SEO_REVIEW_DIR, `${date}.md`);
    await fs.writeFile(reviewPath, `---
date: ${date}
articles_reviewed: ${articles.length}
---

${review}`);

    return review;
  } catch (error) {
    logger.error('Error generating SEO review:', error);
    return null;
  }
}

async function getStoriesForProcessing(): Promise<Article[]> {
  try {
    const feed = await parser.parseURL('https://example.com/feed')
    const articles: Article[] = []

    for (const item of feed.items) {
      // Skip articles with sensitive topics in title or description
      if (containsSensitiveTopics(item.title || '') || containsSensitiveTopics(item.contentSnippet || '')) {
        logger.info(`Skipping article with sensitive topics: ${item.title}`)
        continue
      }

      // Rest of the existing processing logic...
      const content = await extractContent(item.link || '')
      const article: Article = {
        title: item.title || '',
        url: item.link || '',
        content,
        summary: item.contentSnippet || '',
        date: item.pubDate || new Date().toISOString(),
        slug: '', // Will be generated
        country: '', // Will be extracted
        type: '', // Will be determined
        metaTitle: '', // Will be generated
        metaDescription: '', // Will be generated
        keywords: [], // Will be generated
        originalTitle: item.title || ''
      }
      articles.push(article)
    }

    return articles.slice(0, MAX_DAILY_STORIES)
  } catch (error) {
    logger.error('Error getting stories for processing:', error)
    throw error
  }
}

export async function GET(_request: Request) {
  const results = {
    processed: 0,
    errors: 0,
    articles: [] as string[],
    seoReview: null as string | null
  }

  try {
    logger.info('Starting daily publish job');
    
    // Get all stories that need to be processed
    const stories = await getStoriesForProcessing();
    
    // Limit to first 8 stories
    const storiesToProcess = stories.slice(0, MAX_DAILY_STORIES);
    
    if (stories.length > MAX_DAILY_STORIES) {
      logger.info(`Limiting processing to ${MAX_DAILY_STORIES} stories. ${stories.length - MAX_DAILY_STORIES} stories will be processed in future runs.`);
    }

    // Process each story
    for (const story of storiesToProcess) {
      try {
        logger.info(`Processing article: ${story.title}`)

        // Extract content
        const content = await extractContent(story.url || '')

        // Rewrite article with SEO optimization
        const { 
          rewrittenContent, 
          summary, 
          country, 
          type,
          metaTitle,
          metaDescription,
          keywords,
          rewrittenTitle
        } = await rewriteArticle(content, story.title || '')

        // Fetch image
        const image = await fetchUnsplashImage(`${type}`, country)

        // Generate slug from rewritten title
        const slug = rewrittenTitle
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 60) || Date.now().toString()

        // Create article object
        const article: Article = {
          title: rewrittenTitle,
          originalTitle: story.title || '',
          url: story.url || '',
          content: rewrittenContent,
          summary,
          country,
          type,
          imageUrl: image?.url,
          imageAlt: image?.alt,
          imageCredit: image?.photographer,
          imageLink: image?.link,
          date: new Date().toISOString(),
          slug,
          metaTitle,
          metaDescription,
          keywords
        }

        // Save article
        await saveArticle(article)
        results.processed++
        results.articles.push(rewrittenTitle)
      } catch (error) {
        logger.error(`Error processing article: ${story.title}`, error)
        results.errors++
      }
    }

    // Generate SEO review if articles were processed
    if (storiesToProcess.length > 0) {
      results.seoReview = await generateSEOReview(storiesToProcess);
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `Processed ${results.processed} articles with ${results.errors} errors. SEO review ${results.seoReview ? 'generated' : 'failed'}.`
    })
  } catch (error) {
    logger.error('Error in daily publishing job:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process articles',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 