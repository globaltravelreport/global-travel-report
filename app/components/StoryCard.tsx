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

  // Construct UTM-tagged URLs for attribution
  const photographerUrl = story.imagePhotographer 
    ? `https://unsplash.com/@${story.imagePhotographer.username}?utm_source=global_travel_report&utm_medium=referral`
    : null
  const unsplashUrl = 'https://unsplash.com?utm_source=global_travel_report&utm_medium=referral'

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/stories/${story.slug}`}>
        <div className="relative h-48 w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
          {story.imageUrl && !imageError && (
            <div className={`absolute inset-0 transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}>
              <Image
                src={story.imageUrl}
                alt={story.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={story.featured}
                loading={story.featured ? 'eager' : 'lazy'}
                onLoadingComplete={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true)
                  setImageLoading(false)
                }}
              />
              {story.imagePhotographer && (
                <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs px-2 py-1 rounded-tl">
                  Photo by{' '}
                  <Link
                    href={photographerUrl!}
                    className="underline hover:text-gray-200"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {story.imagePhotographer.name}
                  </Link>
                  {' '}on{' '}
                  <Link
                    href={unsplashUrl}
                    className="underline hover:text-gray-200"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Unsplash
                  </Link>
                </div>
              )}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            <div className="relative z-10 bg-black/30 p-3 rounded backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">{story.title}</h3>
            </div>
          </div>
          {story.isSponsored && (
            <span className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded z-20">
              Sponsored
            </span>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {story.category}
            </span>
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              {story.country}
            </span>
          </div>
          <h2 className="text-xl font-semibold mb-2 line-clamp-2">{story.title}</h2>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{story.excerpt}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{story.author}</span>
            <span>{formatDate(story.timestamp)}</span>
          </div>
          
          {story.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {story.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  )
} 