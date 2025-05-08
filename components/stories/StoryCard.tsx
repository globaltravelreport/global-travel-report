'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Story } from '@/types/Story';

interface StoryCardProps {
  story: Story;
  className?: string;
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
        <div className="relative w-full">
          <div className="aspect-[16/9]">
            <Image
              src={imgSrc}
              alt={story.title}
              fill
              className="object-cover rounded-t-lg"
              onError={() => setImgSrc('/images/placeholder.svg')}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={story.featured}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy02LjY2OjY2Njo2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Njb/2wBDARUXFyAeIB4gHh4gIB4lICAgICUmJSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICb/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              loading={story.featured ? 'eager' : 'lazy'}
              quality={85}
            />
          </div>
        </div>
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            {story.featured && (
              <Badge variant="default">Featured</Badge>
            )}
            {story.editorsPick && (
              <Badge variant="secondary">Editor's Pick</Badge>
            )}
            {story.category && (
              <Badge variant="outline">{story.category}</Badge>
            )}
            {story.country && (
              <Badge variant="outline">{story.country}</Badge>
            )}
          </div>
          <CardTitle className="text-2xl hover:text-primary transition-colors">
            {story.title}
          </CardTitle>
          <CardDescription>
            {format(new Date(story.publishedAt), 'MMMM dd, yyyy')} • By Global Travel Report Editorial Team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4 line-clamp-2">{story.excerpt}</p>
        </CardContent>
        <CardFooter>
          <div className="flex flex-wrap gap-2">
            {story.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};