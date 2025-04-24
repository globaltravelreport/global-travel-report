'use client'

import Link from 'next/link'
import { Story } from '../lib/stories'
import { formatDate } from '../lib/utils'

interface StoryListProps {
  stories: Story[]
  currentPage: number
  totalPages: number
  basePath: string
  showTags?: boolean
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-6">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  )
}

export default function StoryList({ stories, currentPage, totalPages, basePath, showTags = false }: StoryListProps) {
  if (!stories || stories.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-900">No stories found</h3>
        <p className="mt-2 text-gray-500">Try adjusting your filters or check back later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {stories.map(story => (
        <article key={story.slug} className="bg-white rounded-lg shadow-md p-6">
          <Link href={`/stories/${story.slug}`}>
            <h2 className="text-2xl font-bold text-gray-900 hover:text-blue-600 mb-2">
              {story.title}
            </h2>
          </Link>
          
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <time dateTime={story.date}>{formatDate(story.date)}</time>
            <span className="mx-2">·</span>
            <Link 
              href={`/countries/${encodeURIComponent(story.country)}`}
              className="hover:text-blue-600"
            >
              {story.country}
            </Link>
            <span className="mx-2">·</span>
            <Link 
              href={`/type/${encodeURIComponent(story.type)}`}
              className="hover:text-blue-600"
            >
              {story.type}
            </Link>
          </div>

          <p className="text-gray-600 mb-4">{story.summary}</p>

          {showTags && story.keywords && story.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {story.keywords.map(tag => (
                <Link
                  key={tag}
                  href={`/filtered?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </article>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-8">
          {currentPage > 1 && (
            <Link
              href={`${basePath}${basePath.includes('?') ? '&' : '?'}page=${currentPage - 1}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          {currentPage < totalPages && (
            <Link
              href={`${basePath}${basePath.includes('?') ? '&' : '?'}page=${currentPage + 1}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
} 