'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Story } from '../lib/stories'
import { formatDate } from '../lib/utils'
import { useState } from 'react'

interface StoryCardProps {
  story: Story
}

export default function StoryCard({ story }: StoryCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/stories/${story.slug}`}>
        <div className="relative h-48 w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
          {story.imageUrl && !imageError && (
            <div className={`absolute inset-0 transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}>
              <Image
                src={story.imageUrl}
                alt={story.imageAlt || story.title}
                fill
                className="object-cover rounded-t-lg"
                onLoad={() => setImageLoading(false)}
                onError={() => setImageError(true)}
              />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            <div className="relative z-10 bg-black/30 p-3 rounded backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">{story.title}</h3>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {story.type}
            </span>
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              {story.country}
            </span>
          </div>
          <h2 className="text-xl font-semibold mb-2 line-clamp-2">{story.title}</h2>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{story.summary}</p>
          <div className="flex items-center justify-end text-sm text-gray-500">
            <span>{formatDate(story.date)}</span>
          </div>
        </div>
      </Link>
    </article>
  )
} 