'use client';

import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { type Story } from '@/lib/stories'
import Image from 'next/image'

interface StoryCardProps {
  story: Story
  className?: string
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, className }) => {
  const [imgSrc, setImgSrc] = React.useState(story.imageUrl || '/images/placeholder.svg');
  return (
    <Card 
      className={cn('transition-all hover:shadow-lg', 
        story.featured && 'border-primary',
        story.editorsPick && 'border-secondary',
        className
      )}
    >
      <Link href={`/stories/${story.slug}`} className="block">
        <CardHeader>
          <div className="relative h-48">
            <Image
              src={imgSrc}
              alt={story.title}
              fill
              className="object-cover rounded-t-lg"
              onError={() => setImgSrc('/images/placeholder.svg')}
            />
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {story.featured && (
              <Badge variant="default">Featured</Badge>
            )}
            {story.editorsPick && (
              <Badge variant="secondary">Editor's Pick</Badge>
            )}
            {story.category && (
              <Badge variant="secondary">{story.category}</Badge>
            )}
            {story.country && (
              <Badge variant="outline">{story.country}</Badge>
            )}
          </div>
          <CardTitle className="text-2xl hover:text-primary transition-colors">
            {story.title}
          </CardTitle>
          <CardDescription>
            {format(new Date(story.publishedAt), 'MMMM dd, yyyy')} • By {story.author}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4 line-clamp-2">{story.excerpt}</p>
        </CardContent>
        <CardFooter>
          <div className="flex flex-wrap gap-2">
            {story.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
} 