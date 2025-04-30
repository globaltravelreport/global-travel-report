"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { cn } from '@/src/lib/utils';
import { withErrorBoundary } from '@/src/components/ui/ErrorBoundary';
import { formatDisplayDate } from '@/src/utils/date-utils';
import { StoryCoverImage } from '@/src/components/ui/OptimizedImage';
import { getStoryUrl, getCategoryUrl, getCountryUrl, getTagUrl } from '@/src/utils/url';
import type { Story } from '@/types/Story';

interface StoryCardProps {
  story: Story;
  className?: string;
}

const StoryCardComponent = ({ story, className }: StoryCardProps) => {
  const [imgSrc, setImgSrc] = React.useState(story.imageUrl || '/images/placeholder.svg');

  // Handle date formatting with our utility
  const formattedDate = React.useMemo(() => {
    try {
      return formatDisplayDate(story.publishedAt);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  }, [story.publishedAt]);

  return (
    <Card
      className={cn('transition-all hover:shadow-lg',
        story.featured && 'border-primary',
        story.editorsPick && 'border-secondary',
        className
      )}
    >
      <Link href={getStoryUrl(story.slug)} className="block">
        <div className="relative w-full h-48">
          <StoryCoverImage
            src={imgSrc}
            alt={story.title}
            priority={story.featured}
            className="rounded-t-lg"
            photographer={story.photographer}
            showAttribution={true}
          />
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
              <Link href={getCategoryUrl(story.category)}>
                <Badge variant="outline">{story.category}</Badge>
              </Link>
            )}
            {story.country && (
              <Link href={getCountryUrl(story.country)}>
                <Badge variant="outline">{story.country}</Badge>
              </Link>
            )}
          </div>
          <CardTitle className="text-2xl hover:text-primary transition-colors">
            {story.title}
          </CardTitle>
          <CardDescription>
            {formattedDate} • By {story.author}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4 line-clamp-2">{story.excerpt}</p>
        </CardContent>
        <CardFooter>
          <div className="flex flex-wrap gap-2">
            {story.tags && story.tags.slice(0, 3).map((tag) => (
              <Link key={tag} href={getTagUrl(tag)}>
                <Badge variant="outline" className="text-xs hover:bg-primary/10 transition-colors">
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

// Fallback UI for when the StoryCard errors
const StoryCardFallback = () => (
  <Card className="transition-all border-gray-200">
    <div className="p-4">
      <div className="h-48 bg-gray-200 rounded-t-lg animate-pulse"></div>
      <div className="mt-4 h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      <div className="mt-2 h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      <div className="mt-4 h-16 bg-gray-200 rounded animate-pulse"></div>
    </div>
  </Card>
);

// Export the StoryCard with error boundary
export const StoryCard = withErrorBoundary(StoryCardComponent, {
  fallback: <StoryCardFallback />,
  componentName: 'StoryCard'
});