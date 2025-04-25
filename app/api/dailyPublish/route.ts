import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from '@/app/utils/logger'

const execAsync = promisify(exec)

// Constants
const MAX_DAILY_STORIES = 8

// Types
interface Article {
  title: string
  originalTitle: string
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
}

interface Story {
  title?: string
  url?: string
}

// Helper functions
async function getStoriesForProcessing(): Promise<Story[]> {
  // TODO: Implement story fetching logic
  return []
}

async function extractContent(_url: string): Promise<string> {
  // TODO: Implement content extraction logic
  return ''
}

async function rewriteArticle(_content: string, _title: string) {
  // TODO: Implement article rewriting logic
  return {
    rewrittenContent: '',
    summary: '',
    country: '',
    type: '',
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    rewrittenTitle: ''
  }
}

async function fetchUnsplashImage(_query: string, _country: string) {
  // TODO: Implement image fetching logic
  return {
    url: '',
    alt: '',
    photographer: '',
    link: ''
  }
}

async function saveArticle(_article: Article) {
  // TODO: Implement article saving logic
}

async function generateSEOReview(_stories: Story[]): Promise<string | null> {
  // TODO: Implement SEO review generation logic
  return null
}

// Verify the request is authorized
function isAuthorized(): boolean {
  const headersList = headers()
  const authToken = headersList.get('authorization')?.split(' ')[1]
  
  if (!process.env.PUBLISH_SECRET_TOKEN) {
    logger.error('PUBLISH_SECRET_TOKEN is not set in environment variables');
    return false;
  }
  
  return authToken === process.env.PUBLISH_SECRET_TOKEN
}

export async function POST(_request: Request) {
  try {
    // Check authorization
    if (!isAuthorized()) {
      logger.warn('Unauthorized publish attempt');
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Execute the publishing script
    const scriptPath = 'scripts/publish.sh'
    
    // Verify script exists
    try {
      await execAsync(`test -f ${scriptPath}`)
    } catch (error) {
      logger.error('Publishing script not found', { scriptPath });
      return NextResponse.json({
        success: false,
        error: 'Publishing script not found',
      }, { status: 500 })
    }

    // Execute script
    const { stdout, stderr } = await execAsync(`bash ${scriptPath}`)

    // Log the output
    if (stdout) logger.info('Publishing script output', { stdout });
    if (stderr) logger.warn('Publishing script warnings', { stderr });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Publishing process completed successfully',
      details: {
        stdout,
        stderr: stderr || null,
      }
    })

  } catch (_error) {
    logger.error('Error in publishing process', _error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to execute publishing process',
      details: _error instanceof Error ? _error.message : 'Unknown error'
    }, { status: 500 })
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
    logger.info('Starting daily publish job')
    
    // Get all stories that need to be processed
    const stories = await getStoriesForProcessing()
    
    // Limit to first 8 stories
    const storiesToProcess = stories.slice(0, MAX_DAILY_STORIES)
    
    if (stories.length > MAX_DAILY_STORIES) {
      logger.info(`Limiting processing to ${MAX_DAILY_STORIES} stories. ${stories.length - MAX_DAILY_STORIES} stories will be processed in future runs.`)
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
      } catch (_error) {
        logger.error(`Error processing article: ${story.title}`, _error)
        results.errors++
      }
    }

    // Generate SEO review if articles were processed
    if (storiesToProcess.length > 0) {
      results.seoReview = await generateSEOReview(storiesToProcess)
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `Processed ${results.processed} articles with ${results.errors} errors. SEO review ${results.seoReview ? 'generated' : 'failed'}.`
    })
  } catch (_error) {
    logger.error('Error in daily publishing job:', _error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process articles',
      details: _error instanceof Error ? _error.message : 'Unknown error'
    }, { status: 500 })
  }
} 