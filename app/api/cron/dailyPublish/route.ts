import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import axios from 'axios'
import * as cheerio from 'cheerio'
import OpenAI from 'openai'
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { logger } from '@/app/utils/logger'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Initialize RSS parser
const parser = new Parser()

// Constants
const MAX_DAILY_STORIES = 8
const SEO_REVIEW_DIR = 'content/seo/daily'

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
    const systemPrompt = `You are a professional travel writer and destination expert for the Global Travel Report, specializing in Australian travel perspectives.

Your role is to create engaging, informative travel content that follows these guidelines:

1. Content Structure:
   - Create an SEO-optimized title (50-60 characters)
   - Write a compelling meta description (150-160 characters)
   - Include a location-specific country tag
   - Generate 5-8 relevant keywords for SEO
   - Organize content with clear headings and subheadings
   - Maintain natural paragraph flow with proper transitions

2. Australian Travel Perspective:
   - Include flight routes and connections from major Australian cities
   - Convert prices to AUD with current exchange rates
   - Mention visa requirements for Australian passport holders
   - Address travel insurance considerations
   - Provide relevant health and safety information

3. Destination Coverage:
   - Highlight unique attractions and experiences
   - Include practical transportation and accommodation details
   - Share cultural insights and local customs
   - Recommend best times to visit
   - Feature seasonal events and festivals
   - Suggest itinerary options

4. Writing Style:
   - Maintain a professional, authoritative tone
   - Use clear, concise language
   - Incorporate destination-specific details
   - Focus on actionable travel advice
   - Naturally integrate keywords
   - Avoid generic descriptions

5. SEO Best Practices:
   - Use proper heading hierarchy
   - Include location-specific terms
   - Optimize for featured snippets
   - Create scannable content with bullet points
   - Maintain optimal paragraph length (2-3 sentences)
   - Include relevant internal linking opportunities

Format your response exactly as follows, using the separator "---" between sections:

[SEO-optimized title]
---
[Meta description]
---
[Keywords as a comma-separated list]
---
[Rewritten article]
---
[Brief summary for Australian travelers]
---
[Primary destination country]
---
[Content type (e.g., Destination Guide, Travel Tips, Accommodation Review)]`

    const prompt = `
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
      [Type of travel (e.g., Adventure, Luxury, Budget, Family, Culture, Food & Wine) without numbers or special characters]
    `

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

async function fetchUnsplashImage(query: string, country: string): Promise<{
  url: string
  alt: string
  photographer: string
  photographerUsername: string
  link: string
  downloadLocation: string
} | null> {
  try {
    // Construct a more specific search query
    const searchQuery = `${country} ${query} travel photo landscape destination`;
    
    const response = await axios.get(
      `https://api.unsplash.com/search/photos`,
      {
        params: {
          query: searchQuery,
          orientation: 'landscape',
          per_page: 30, // Get more results to filter through
          content_filter: 'high'
        },
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (response.data.results.length === 0) {
      return null;
    }

    // Filter and sort results
    const filteredResults = response.data.results
      .filter((image: any) => {
        // Ensure landscape orientation
        const aspectRatio = image.width / image.height;
        return aspectRatio >= 1.5;
      })
      .filter((image: any) => {
        // Filter out generic nature shots unless they match the destination
        const description = (image.description || '').toLowerCase();
        const altDescription = (image.alt_description || '').toLowerCase();
        const countryLower = country.toLowerCase();
        
        const isDestinationSpecific = 
          description.includes(countryLower) ||
          altDescription.includes(countryLower) ||
          description.includes('travel') ||
          altDescription.includes('travel');

        return isDestinationSpecific;
      });

    if (filteredResults.length === 0) {
      return null;
    }

    // Select the best match
    const bestMatch = filteredResults[0];
    
    return {
      url: bestMatch.urls.regular,
      alt: bestMatch.alt_description || `Travel photo of ${country}`,
      photographer: bestMatch.user.name,
      photographerUsername: bestMatch.user.username,
      link: bestMatch.links.html,
      downloadLocation: bestMatch.links.download_location
    };
  } catch (error) {
    logger.error('Error fetching Unsplash image:', error);
    return null;
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
    // Fetch RSS feed with expanded international travel focus
    const feed = await parser.parseURL(
      'https://news.google.com/rss/search?q=travel+OR+cruise+OR+resorts+OR+airlines+OR+vacation+deals+OR+hotels+OR+tourism+OR+destinations+OR+flights&hl=en-AU&gl=AU&ceid=AU:en'
    );

    // Filter and map relevant articles
    return feed.items
      .filter(item => {
        const title = item.title?.toLowerCase() || '';
        const description = item.contentSnippet?.toLowerCase() || '';
        const fullText = `${title} ${description}`;

        // Priority destinations for Australian travelers
        const priorityDestinations = [
          'bali', 'indonesia', 'thailand', 'japan', 'singapore',
          'vietnam', 'malaysia', 'philippines', 'fiji', 'new zealand',
          'hawaii', 'usa', 'europe', 'uk', 'france', 'italy', 'greece',
          'spain', 'dubai', 'maldives'
        ];

        // Travel-related terms
        const travelTerms = [
          'international', 'overseas', 'abroad', 'foreign',
          'passport', 'visa', 'flights', 'airways', 'airlines',
          'resort', 'hotel', 'accommodation', 'cruise',
          'holiday', 'vacation', 'travel', 'tour', 'adventure'
        ];

        const hasDestination = priorityDestinations.some(dest => fullText.includes(dest));
        const hasTravelTerm = travelTerms.some(term => fullText.includes(term));
        const isDomesticOnly = fullText.includes('australia') && 
          !fullText.includes('international') && 
          !fullText.includes('overseas');

        return (hasDestination || hasTravelTerm) && !isDomesticOnly;
      })
      .map(item => {
        const title = item.title || '';
        return {
          title,
          originalTitle: title,
          metaTitle: title,
          metaDescription: item.contentSnippet || '',
          url: item.link || '',
          slug: '',  // Will be generated during processing
          content: item.contentSnippet || '',
          summary: '',  // Will be generated during rewrite
          country: '',  // Will be determined during rewrite
          type: '',     // Will be determined during rewrite
          date: new Date(item.pubDate || new Date()).toISOString(),
          timestamp: new Date(item.pubDate || new Date()).getTime(),
          lastModified: Date.now(),
          keywords: [],  // Will be generated during rewrite
          tags: [],     // Will be generated during rewrite
          categories: [], // Will be determined during rewrite
          source: item.source?.name || 'Unknown',
          sourceUrl: item.link || '',
          published: false,
          featured: false,
          editorsPick: false
        } as Article;
      });
  } catch (error) {
    logger.error('Error fetching stories for processing:', error);
    return [];
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