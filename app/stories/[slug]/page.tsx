import { getStoryBySlug } from '../../lib/stories'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '../../lib/utils'

interface StoryPageProps {
  params: {
    slug: string
  }
}

export default async function StoryPage({ params }: StoryPageProps) {
  const story = await getStoryBySlug(params.slug)
  
  if (!story) {
    notFound()
  }

  // Construct UTM-tagged URLs for attribution
  const photographerUrl = story.imagePhotographer 
    ? `https://unsplash.com/@${story.imagePhotographer.username}?utm_source=global_travel_report&utm_medium=referral`
    : null
  const unsplashUrl = 'https://unsplash.com?utm_source=global_travel_report&utm_medium=referral'

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {story.isSponsored && (
        <div className="mb-4">
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
            Sponsored
          </span>
        </div>
      )}

      <div className="relative mb-8 h-[32rem] w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
        {story.imageUrl && (
          <>
            <Image
              src={story.imageUrl}
              alt={story.title}
              fill
              className="object-cover rounded-lg"
              priority
              sizes="(max-width: 1536px) 100vw, 1536px"
            />
            {story.imagePhotographer && (
              <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs px-2 py-1 rounded-tl">
                Photo by{' '}
                <Link
                  href={photographerUrl!}
                  className="underline hover:text-gray-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {story.imagePhotographer.name}
                </Link>
                {' '}on{' '}
                <Link
                  href={unsplashUrl}
                  className="underline hover:text-gray-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Unsplash
                </Link>
              </div>
            )}
          </>
        )}
      </div>
      
      <h1 className="text-4xl font-bold mb-4">{story.title}</h1>
      
      <div className="flex items-center gap-4 text-gray-600 mb-8">
        <span className="font-medium">By {story.author}</span>
        <span>•</span>
        <span>{formatDate(story.timestamp)}</span>
        <span>•</span>
        <span>{story.readTime} min read</span>
      </div>
      
      <div className="flex items-center text-gray-600 mb-8">
        <span>By {story.author}</span>
        <span className="mx-2">·</span>
        <time dateTime={story.timestamp}>
          {formatDate(story.timestamp)}
        </time>
        {story.readTime && (
          <>
            <span className="mx-2">·</span>
            <span>{story.readTime} min read</span>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <Link
          href={`/countries/${story.country}`}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
        >
          {story.country}
        </Link>
        <Link
          href={`/categories/${story.category}`}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200"
        >
          {story.category}
        </Link>
      </div>
      
      {story.tags && story.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {story.tags.map((tag: string) => (
            <span 
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="prose prose-lg max-w-none">
        {story.body}
      </div>
    </article>
  )
} 