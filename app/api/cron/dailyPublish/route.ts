import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import axios from 'axios'
import * as cheerio from 'cheerio'
import OpenAI from 'openai'
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Initialize RSS parser
const parser = new Parser()

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
    console.error(`Error extracting content from ${url}:`, error)
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
    const prompt = `
      You are a travel journalist and SEO expert writing for an Australian audience about international destinations.
      Rewrite the following article and its title in a clear, engaging style that resonates with Australian travelers.
      
      Original title: ${originalTitle}
      
      Key aspects to focus on:
      - Flight routes and connections from major Australian cities
      - Price comparisons in AUD
      - Best times to visit considering Australian seasons
      - Visa requirements for Australian passport holders
      - Cultural differences and travel tips specific to Australians
      - Practical travel information (currency, local transport, accommodation)
      
      SEO Requirements:
      - Create an SEO-optimized title (max 60 characters)
      - Write a compelling meta description (max 155 characters)
      - Include relevant keywords for Australian travelers
      
      Original content:
      ${content}
      
      Please provide your response in the following format:
      1. SEO-optimized title
      2. ---
      3. Meta description
      4. ---
      5. Keywords (comma-separated)
      6. ---
      7. Rewritten article (in markdown) - focus on what Australian travelers need to know
      8. ---
      9. Brief summary (2-3 sentences highlighting key takeaways for Australian travelers)
      10. ---
      11. Primary destination country
      12. ---
      13. Type of travel (e.g., Adventure, Luxury, Budget, Family, Culture, Food & Wine)
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
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
    console.error('Error rewriting article:', error)
    throw error
  }
}

async function fetchUnsplashImage(query: string): Promise<{
  url: string
  alt: string
  photographer: string
  link: string
} | null> {
  try {
    const response = await axios.get(
      `https://api.unsplash.com/search/photos`,
      {
        params: {
          query: `${query} travel landscape`,
          orientation: 'landscape',
          per_page: 1
        },
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
        }
      }
    )

    if (response.data.results.length === 0) {
      return null
    }

    const image = response.data.results[0]
    return {
      url: image.urls.regular,
      alt: image.alt_description || query,
      photographer: image.user.name,
      link: image.links.html
    }
  } catch (error) {
    console.error('Error fetching Unsplash image:', error)
    return null
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
    console.log(`Saved article: ${fileName}`)
  } catch (error) {
    console.error('Error saving article:', error)
    throw error
  }
}

export async function GET() {
  const results = {
    processed: 0,
    errors: 0,
    articles: [] as string[]
  }

  try {
    // Fetch RSS feed with expanded international travel focus
    const feed = await parser.parseURL(
      'https://news.google.com/rss/search?q=travel+OR+cruise+OR+resorts+OR+airlines+OR+vacation+deals+OR+hotels+OR+tourism+OR+destinations+OR+flights&hl=en-AU&gl=AU&ceid=AU:en'
    )

    // Filter out articles that might not be relevant
    const relevantArticles = feed.items.filter(item => {
      const title = item.title?.toLowerCase() || ''
      const description = item.contentSnippet?.toLowerCase() || ''
      const fullText = `${title} ${description}`

      // Priority destinations for Australian travelers
      const priorityDestinations = [
        'bali', 'indonesia', 'thailand', 'japan', 'singapore',
        'vietnam', 'malaysia', 'philippines', 'fiji', 'new zealand',
        'hawaii', 'usa', 'europe', 'uk', 'france', 'italy', 'greece',
        'spain', 'dubai', 'maldives'
      ]

      // Travel-related terms
      const travelTerms = [
        'international', 'overseas', 'abroad', 'foreign',
        'passport', 'visa', 'flights', 'airways', 'airlines',
        'resort', 'hotel', 'accommodation', 'cruise',
        'holiday', 'vacation', 'travel', 'tour', 'adventure'
      ]

      // Check if the article mentions priority destinations
      const hasDestination = priorityDestinations.some(dest => fullText.includes(dest))
      
      // Check if it contains travel-related terms
      const hasTravelTerm = travelTerms.some(term => fullText.includes(term))
      
      // Exclude primarily domestic Australian stories unless they're about international connections
      const isDomesticOnly = fullText.includes('australia') && 
        !fullText.includes('international') && 
        !fullText.includes('overseas')

      return (hasDestination || hasTravelTerm) && !isDomesticOnly
    })

    // Process up to 8 most relevant articles
    const articles = relevantArticles.slice(0, 8)

    for (const item of articles) {
      try {
        console.log(`Processing article: ${item.title}`)

        // Extract content
        const content = await extractContent(item.link || '')

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
        } = await rewriteArticle(content, item.title || '')

        // Fetch image
        const image = await fetchUnsplashImage(`${country} ${type}`)

        // Generate slug from rewritten title
        const slug = rewrittenTitle
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 60) || Date.now().toString()

        // Save article
        const article: Article = {
          title: rewrittenTitle,
          originalTitle: item.title || '',
          url: item.link || '',
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

        await saveArticle(article)

        results.processed++
        results.articles.push(rewrittenTitle)
      } catch (error) {
        console.error(`Error processing article: ${item.title}`, error)
        results.errors++
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `Processed ${results.processed} articles with ${results.errors} errors`
    })
  } catch (error) {
    console.error('Error in daily publishing job:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process articles',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 