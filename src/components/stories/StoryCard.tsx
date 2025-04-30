"use client";

import React from 'react';
import Link from 'next/link';
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
    <div
      className={`transition-all hover:shadow-lg border rounded-lg ${
        story.featured ? 'border-primary' : ''
      } ${
        story.editorsPick ? 'border-secondary' : ''
      } ${
        className || ''
      }`}
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
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {story.featured && (
              <span className="inline-flex items-center rounded-md bg-primary px-2 py-1 text-xs font-medium text-white">Featured</span>
            )}
            {story.editorsPick && (
              <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-white">Editor's Pick</span>
            )}
            {story.category && (
              <Link href={getCategoryUrl(story.category)}>
                <span className="inline-flex items-center rounded-md border border-gray-200 px-2 py-1 text-xs font-medium">{story.category}</span>
              </Link>
            )}
            {story.country && (
              <Link href={getCountryUrl(story.country)}>
                <span className="inline-flex items-center rounded-md border border-gray-200 px-2 py-1 text-xs font-medium">{story.country}</span>
              </Link>
            )}
          </div>
          <h3 className="text-2xl font-semibold leading-none tracking-tight hover:text-primary transition-colors">
            {story.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {formattedDate} • By {story.author}
          </p>
        </div>
        <div className="px-4 pb-4">
          <p className="text-gray-600 mb-4 line-clamp-2">{story.excerpt}</p>
        </div>
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {story.tags && story.tags.slice(0, 3).map((tag) => (
              <Link key={tag} href={getTagUrl(tag)}>
                <span className="inline-flex items-center rounded-md border border-gray-200 px-2 py-1 text-xs font-medium hover:bg-gray-100 transition-colors">
                  {tag}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
};

// Fallback UI for when the StoryCard errors
const StoryCardFallback = () => (
  <div className="transition-all border border-gray-200 rounded-lg">
    <div className="p-4">
      <div className="h-48 bg-gray-200 rounded-t-lg animate-pulse"></div>
      <div className="mt-4 h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      <div className="mt-2 h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      <div className="mt-4 h-16 bg-gray-200 rounded animate-pulse"></div>
    </div>
  </div>
);

// Export the StoryCard with error boundary
export const StoryCard = withErrorBoundary(StoryCardComponent, {
  fallback: <StoryCardFallback />,
  componentName: 'StoryCard'
});