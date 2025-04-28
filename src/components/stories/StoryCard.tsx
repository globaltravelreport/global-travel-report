import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { type Story } from '@/lib/stories'
import { formatDate } from '@/lib/stories'
import { Story as StoryType } from '@/types/story'

interface StoryCardProps {
  story: StoryType
  featured?: boolean
  className?: string
}

export function StoryCard({ story, featured = false, className }: StoryCardProps) {
  return (
    <article className={`bg-white rounded-lg shadow-md overflow-hidden ${featured ? 'md:col-span-2' : ''}`}>
      <Link href={`/stories/${story.slug}`} className="block">
        <div className="relative h-48 md:h-64">
          <Image
            src={story.imageUrl || '/images/story-placeholder.jpg'}
            alt={story.title}
            fill
            className="object-cover"
          />
          {story.editorsPick && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded text-sm font-medium">
              Editor's Pick
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <span>{formatDate(story.publishedAt)}</span>
            <span className="mx-2">•</span>
            <span>{story.category}</span>
            <span className="mx-2">•</span>
            <span>{story.country}</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {story.title}
          </h2>
          <p className="text-gray-600 mb-4 line-clamp-3">
            {story.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-gray-500">By {story.author}</span>
            </div>
            <div className="flex space-x-2">
              {story.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
} 