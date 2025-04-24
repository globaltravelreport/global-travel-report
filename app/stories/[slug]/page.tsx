import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { formatDate } from '@/app/lib/utils'
import { getStoryBySlug, getStories, Story } from '../../lib/stories'
import ShareButtons from '../../components/ShareButtons'
import Reactions from '../../components/Reactions'
import EmailSignup from '../../components/EmailSignup'

// Types
interface StoryPageProps {
  params: {
    slug: string
  }
}

interface StoryData {
  title: string
  summary: string
  content: string
  date: string
  country: string
  type: string
  keywords: string[]
  imageUrl?: string
  imageAlt?: string
  imageCredit?: string
  imageLink?: string
}

// Helper function to find the markdown file by slug
async function findMarkdownFileBySlug(slug: string): Promise<string | null> {
  const articlesDir = path.join(process.cwd(), 'content', 'articles')
  const files = fs.readdirSync(articlesDir)
  const markdownFile = files.find(file => file.endsWith(`${slug}.md`))
  return markdownFile ? path.join(articlesDir, markdownFile) : null
}

// Generate metadata for the page
export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const story = await getStoryBySlug(params.slug)
  
  if (!story) {
    return {
      title: 'Story Not Found - Global Travel Report',
      description: 'The requested story could not be found.'
    }
  }

  return {
    title: `${story.title} - Global Travel Report`,
    description: story.summary,
    openGraph: {
      title: story.title,
      description: story.summary,
      type: 'article',
      url: `https://globaltravelreport.com/stories/${story.slug}`,
      siteName: 'Global Travel Report',
      images: story.imageUrl ? [{ url: story.imageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: story.title,
      description: story.summary,
      images: story.imageUrl ? [story.imageUrl] : undefined,
    }
  }
}

async function getRelatedStories(currentStory: Story) {
  const allStories = await getStories()
  
  // Remove current story from the pool
  const otherStories = allStories.filter(s => s.slug !== currentStory.slug)
  
  // Score each story based on metadata matches
  const scoredStories = otherStories.map(story => {
    let score = 0

    // Priority 1: Shared keywords (3 points each)
    if (currentStory.keywords && story.keywords) {
      const sharedKeywords = currentStory.keywords.filter((k: string) => 
        story.keywords?.includes(k)
      )
      score += sharedKeywords.length * 3
    }

    // Priority 2: Same type (2 points)
    if (story.type === currentStory.type) {
      score += 2
    }

    // Priority 3: Same country (1 point)
    if (story.country === currentStory.country) {
      score += 1
    }

    return { story, score }
  })

  // Sort by score (descending) and then by date
  return scoredStories
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return new Date(b.story.date).getTime() - new Date(a.story.date).getTime()
    })
    .slice(0, 3) // Get top 3
    .map(({ story }) => story)
}

// Main page component
export default async function StoryPage({ params }: StoryPageProps) {
  const filePath = await findMarkdownFileBySlug(params.slug)
  if (!filePath) notFound()

  const fileContent = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContent)
  const story = data as StoryData
  
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Link */}
      <Link 
        href="/" 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
      >
        ← Back to Latest Stories
      </Link>

      {/* Hero Image */}
      {story.imageUrl && (
        <div className="relative aspect-video w-full mb-8 rounded-lg overflow-hidden">
          <Image
            src={story.imageUrl}
            alt={story.imageAlt || story.title}
            fill
            className="object-cover"
            priority
          />
          {story.imageCredit && (
            <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
              Photo by{' '}
              <a
                href={story.imageLink}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-200"
              >
                {story.imageCredit}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Article Header */}
      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
            {story.type}
          </span>
          <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
            {story.country}
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-4">{story.title}</h1>
        <div className="text-gray-600">
          <time dateTime={story.date}>{formatDate(story.date)}</time>
        </div>
      </header>

      {/* Reactions */}
      <Reactions slug={params.slug} />

      {/* Article Content */}
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>

      {/* Keywords */}
      {story.keywords && story.keywords.length > 0 && (
        <div className="mt-8 pt-8 border-t">
          <h2 className="text-lg font-semibold mb-4">Related Topics</h2>
          <div className="flex flex-wrap gap-2">
            {story.keywords.map(keyword => (
              <span
                key={keyword}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Share Buttons */}
      <ShareButtons title={story.title} url={`https://globaltravelreport.com/stories/${params.slug}`} />

      {/* Email Signup */}
      <EmailSignup />
    </article>
  )
} 