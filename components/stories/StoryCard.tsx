import Image from 'next/image'
import Link from 'next/link'
import { Story } from '../../types/Story'
import { formatDate } from '../../utils/date'

interface StoryCardProps {
  story: Story
  priority?: boolean
}

export default function StoryCard({ story, priority = false }: StoryCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-[1.02]">
      <Link href={`/stories/${story.slug}`} className="group relative">
        <div className="aspect-[16/9] w-full bg-gray-200">
          {story.coverImage && (
            <Image
              src={story.coverImage.url}
              alt={story.coverImage.alt || story.title}
              fill
              className="object-cover"
              sizes="(min-width: 1280px) 384px, (min-width: 1024px) 288px, (min-width: 768px) 342px, calc(100vw - 32px)"
              priority={priority}
            />
          )}
        </div>
        <div className="p-6">
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
          <h2 className="mt-4 text-xl font-semibold text-gray-900 group-hover:text-blue-600">
            {story.title}
          </h2>
          <p className="mt-3 text-base text-gray-500 line-clamp-3">
            {story.excerpt}
          </p>
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
        </div>
      </Link>
    </article>
  )
} 