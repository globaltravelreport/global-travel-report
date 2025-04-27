import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getStoryBySlug } from '../../../lib/stories'
import { formatDate } from '../../../utils/date'

interface StoryPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const story = await getStoryBySlug(params.slug)
  
  if (!story) {
    return {}
  }

  return {
    title: story.seo?.title || story.title,
    description: story.seo?.description || story.excerpt,
    openGraph: {
      title: story.seo?.title || story.title,
      description: story.seo?.description || story.excerpt,
      type: 'article',
      publishedTime: story.publishedAt,
      modifiedTime: story.updatedAt,
      authors: story.author ? [story.author.name] : undefined,
      images: story.seo?.ogImage ? [story.seo.ogImage] : story.coverImage ? [story.coverImage.url] : [],
    },
  }
}

export default async function StoryPage({ params }: StoryPageProps) {
  const story = await getStoryBySlug(params.slug)

  if (!story) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <div className="py-12 sm:py-16">
        {/* Header */}
        <header>
          {story.categories && story.categories.length > 0 && (
            <div className="flex gap-2">
              {story.categories.map(category => (
                <span
                  key={category}
                  className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            {story.title}
          </h1>
          <div className="mt-6 flex items-center">
            {story.author?.avatar && (
              <div className="relative h-10 w-10 flex-shrink-0">
                <Image
                  src={story.author.avatar}
                  alt={story.author.name}
                  className="rounded-full"
                  fill
                />
              </div>
            )}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {story.author?.name}
              </p>
              <div className="flex space-x-1 text-sm text-gray-500">
                <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>
                <span aria-hidden="true">&middot;</span>
                <span>{story.readingTime} min read</span>
              </div>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {story.coverImage && (
          <div className="relative aspect-[16/9] mt-10 w-full overflow-hidden rounded-lg">
            <Image
              src={story.coverImage.url}
              alt={story.coverImage.alt || story.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg mt-10 max-w-none prose-blue">
          {story.content}
        </div>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="mt-10">
            <h2 className="text-sm font-medium text-gray-500">Tags</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {story.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
} 