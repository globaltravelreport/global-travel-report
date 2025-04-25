'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Story } from '../lib/stories'
import { formatDate, formatReadingTime, getTagColor } from '../lib/utils'
import { useState } from 'react'

interface StoryCardProps {
  story: Story
  showTags?: boolean
}

export default function StoryCard({ story, showTags = true }: StoryCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Get categories to display (fallback to single category if categories array is empty)
  const displayCategories = story.categories?.length 
    ? story.categories.slice(0, 2) 
    : story.category 
    ? [story.category]
    : []

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/stories/${story.slug}`}>
        <div className="relative h-48 w-full">
          {story.imageUrl && !imageError && (
            <div className={`absolute inset-0 transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}>
              <Image
                src={story.imageUrl}
                alt={story.imageAlt || story.title}
                fill
                className="object-cover rounded-t-lg brightness-105"
                onLoad={() => setImageLoading(false)}
                onError={() => setImageError(true)}
                quality={85}
              />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            <div className="relative z-10 bg-black/20 p-3 rounded backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">{story.title}</h3>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              {story.country}
            </span>
            {displayCategories.map((category) => (
              <span 
                key={category} 
                className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
              >
                {category}
              </span>
            ))}
            {story.isSponsored && (
              <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                Sponsored
              </span>
            )}
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full ml-auto">
              {formatReadingTime(story.content)}
            </span>
          </div>
          <h2 className="text-xl font-semibold mb-2 line-clamp-2">{story.title}</h2>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{story.summary}</p>
          
          {showTags && story.keywords && story.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {story.keywords.slice(0, 3).map((tag: string) => {
                const { bg, text } = getTagColor(tag)
                return (
                  <Link
                    key={tag}
                    href={`/filtered?tag=${encodeURIComponent(tag)}`}
                    className={`px-2 py-1 text-xs font-medium rounded-full ${bg} ${text} hover:opacity-80 transition-opacity`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {tag}
                  </Link>
                )
              })}
              {story.keywords.length > 3 && (
                <span className="text-xs text-gray-500">+{story.keywords.length - 3} more</span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-end text-sm text-gray-500">
            <span>{formatDate(story.date)}</span>
          </div>
        </div>
      </Link>
    </article>
  )
} 