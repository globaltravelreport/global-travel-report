'use client'

import { Story } from '../lib/stories'
import StoryCard from './StoryCard'
import Pagination from './Pagination'
import Search from './Search'
import { Suspense } from 'react'

interface StoryListProps {
  stories: Story[]
  currentPage: number
  totalPages: number
  basePath: string
  title: string
  showSearch?: boolean
}

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
)

export default function StoryList({
  stories,
  currentPage,
  totalPages,
  basePath,
  title,
  showSearch = true
}: StoryListProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {title}
          </h1>
          {showSearch && (
            <div className="w-full md:w-64">
              <Search />
            </div>
          )}
        </div>
        
        <Suspense fallback={<LoadingSkeleton />}>
          {stories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No stories found. Try adjusting your search or check back later for new content!
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map(story => (
                  <StoryCard key={story.slug} story={story} />
                ))}
              </div>
              <Pagination 
                totalPages={totalPages} 
                currentPage={currentPage} 
                basePath={basePath} 
              />
            </>
          )}
        </Suspense>
      </div>
    </div>
  )
} 