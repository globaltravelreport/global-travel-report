import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { formatDate, formatReadingTime, generateMetadata as generatePageMetadata } from '@/app/lib/utils'
import { getStoryBySlug, getAllStories } from '../../lib/stories'
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

// Main page component
export default async function StoryPage({ params }: StoryPageProps) {
  const story = await getStoryBySlug(params.slug)
  if (!story) return notFound()

  // Get all stories for related stories component
  const allStories = await getAllStories()

  return (
    <article className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative w-full h-[600px]">
        {story.imageUrl && (
          <>
            <Image
              src={story.imageUrl}
              alt={story.imageAlt || story.title}
              fill
              priority
              className="object-cover brightness-110"
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
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
          </>
        )}
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
        {story.source?.includes('Unsplash') && (
          <div className="mt-8 text-sm text-gray-500">
            <p>
              Photo from{' '}
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