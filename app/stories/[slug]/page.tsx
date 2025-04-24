import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { formatDate, formatReadingTime, generateMetadata as generatePageMetadata } from '@/app/lib/utils'
import { getStoryBySlug, getAllStories, Story } from '../../lib/stories'
import ShareButtons from '../../components/ShareButtons'
import Reactions from '../../components/Reactions'
import EmailSignup from '../../components/EmailSignup'
import RelatedStories from '../../components/RelatedStories'

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
  if (!story) return notFound()

  return generatePageMetadata({
    title: story.title,
    description: story.summary,
    imageUrl: story.imageUrl,
    path: `/stories/${story.slug}`,
    type: 'article'
  })
}

async function getRelatedStories(currentStory: Story) {
  const allStories = await getAllStories()
  
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
  const story = await getStoryBySlug(params.slug)
  if (!story) return notFound()

  // Get all stories for related stories component
  const allStories = await getAllStories()

  return (
    <article className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative h-[60vh] min-h-[400px] bg-gray-900">
        {story.imageUrl && (
          <>
            <Image
              src={story.imageUrl}
              alt={story.imageAlt || story.title}
              fill
              className="object-cover opacity-70"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40" />
          </>
        )}
        <div className="relative h-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16">
          <div className="flex flex-wrap gap-3 mb-4">
            <Link
              href={`/filtered?type=${encodeURIComponent(story.type)}`}
              className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition"
            >
              {story.type}
            </Link>
            <Link
              href={`/filtered?country=${encodeURIComponent(story.country)}`}
              className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition"
            >
              {story.country}
            </Link>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            {story.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-300 text-sm">
            <time dateTime={story.date}>{formatDate(story.date)}</time>
            <span>·</span>
            <span>{formatReadingTime(story.content)}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Summary */}
        <div className="prose prose-lg prose-blue mx-auto mb-8">
          <p className="lead">{story.summary}</p>
        </div>

        {/* Main Content */}
        <div className="prose prose-lg prose-blue mx-auto">
          {story.content}
        </div>

        {/* Tags */}
        {story.keywords && story.keywords.length > 0 && (
          <div className="mt-12 pt-6 border-t border-gray-200">
            <h2 className="text-sm font-medium text-gray-500 mb-4">Tagged with</h2>
            <div className="flex flex-wrap gap-2">
              {story.keywords.map(tag => (
                <Link
                  key={tag}
                  href={`/filtered?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Image Credit */}
        {story.imagePhotographer && (
          <div className="mt-8 text-sm text-gray-500">
            <p>
              Photo by{' '}
              <a
                href={`https://unsplash.com/@${story.imagePhotographer.username}?utm_source=global_travel_report&utm_medium=referral`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {story.imagePhotographer.name}
              </a>
              {' '}on{' '}
              <a
                href="https://unsplash.com/?utm_source=global_travel_report&utm_medium=referral"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Unsplash
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Related Stories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RelatedStories currentStory={story} stories={allStories} />
      </div>

      {/* Reactions */}
      <Reactions slug={params.slug} />

      {/* Share Buttons */}
      <ShareButtons title={story.title} url={`https://globaltravelreport.com/stories/${params.slug}`} />

      {/* Email Signup */}
      <EmailSignup />
    </article>
  )
} 