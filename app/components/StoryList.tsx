'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Story } from '../types/story'
import { getFlagEmoji } from '../utils/countryHelpers'

interface StoryListProps {
  stories: Story[]
  currentPage: number
  totalPages: number
  basePath: string
  showTags?: boolean
}

export default function StoryList({ stories, currentPage, totalPages, basePath, showTags = false }: StoryListProps) {
  return (
    <section className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {stories.map(story => (
          <article key={story.slug} className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
            <Link href={`/stories/${story.slug}`} className="relative block aspect-video">
              <Image
                src={story.imageUrl || '/images/placeholder.jpg'}
                alt={story.imageAlt || `Travel story about ${story.title}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </Link>
            
            <div className="flex-1 p-6">
              <header>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <time dateTime={new Date(story.timestamp).toISOString()}>
                    {new Date(story.timestamp).toLocaleDateString()}
                  </time>
                  <span>•</span>
                  <Link 
                    href={`/countries/${story.country.toLowerCase().replace(/\s+/g, '-')}`}
                    className="hover:text-sky-600"
                  >
                    {getFlagEmoji(story.country)} {story.country}
                  </Link>
                </div>
                <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                  <Link href={`/stories/${story.slug}`} className="hover:text-sky-600">
                    {story.title}
                  </Link>
                </h2>
              </header>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{story.summary}</p>
              
              {showTags && story.tags && story.tags.length > 0 && (
                <footer className="flex flex-wrap gap-2">
                  {story.tags.map(tag => (
                    <Link
                      key={tag}
                      href={`/tags/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-sky-600 hover:text-sky-800 bg-sky-50 px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </Link>
                  ))}
                </footer>
              )}
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <nav role="navigation" aria-label="Pagination" className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Link
              key={page}
              href={`${basePath}${page === 1 ? '' : `?page=${page}`}`}
              className={`px-4 py-2 rounded ${
                page === currentPage
                  ? 'bg-sky-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-sky-50'
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Link>
          ))}
        </nav>
      )}
    </section>
  )
} 