'use client'

import Link from 'next/link'
import { Story } from '../lib/stories'
import StoryCard from './StoryCard'

interface StoryListProps {
  stories: Story[]
  currentPage: number
  totalPages: number
  basePath: string
  showTags?: boolean
  totalCount?: number
  isLoading?: boolean
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-48 w-full bg-gray-200 animate-pulse" />
          <div className="p-6">
            <div className="flex gap-2 mb-2">
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="flex justify-end">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
      <p className="text-gray-500">
        Try adjusting your filters or check back later for new stories.
      </p>
    </div>
  )
}

export default function StoryList({ 
  stories, 
  currentPage, 
  totalPages, 
  basePath,
  showTags = true,
  totalCount,
  isLoading = false
}: StoryListProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!stories || stories.length === 0) {
    return <EmptyState />
  }

  const showingCount = stories.length
  const hasCount = typeof totalCount === 'number'

  return (
    <div className="space-y-8">
      {hasCount && (
        <p className="text-sm text-gray-600">
          Showing {showingCount} of {totalCount} stories
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <StoryCard key={story.slug} story={story} showTags={showTags} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-8">
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