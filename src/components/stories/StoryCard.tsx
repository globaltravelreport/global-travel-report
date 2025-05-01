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
  // We only need imgSrc state, not the setter
  const [imgSrc] = React.useState(story.imageUrl || '/images/placeholder.svg');

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
      className={`transition-all duration-300 hover:shadow-xl border rounded-lg overflow-hidden group ${
        story.featured ? 'border-primary' : ''
      } ${
        story.editorsPick ? 'border-secondary' : ''
      } ${
        className || ''
      } hover:translate-y-[-4px]`}
    >
      <Link href={getStoryUrl(story.slug)} className="block">
        <div className="relative w-full h-52 overflow-hidden">
          <StoryCoverImage
            src={imgSrc}
            alt={story.title}
            priority={story.featured}
            className="rounded-t-lg transition-transform duration-700 group-hover:scale-110"
            photographer={story.photographer}
            showAttribution={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2 mb-3">
            {story.featured && (
              <span className="inline-flex items-center rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-white shadow-sm">Featured</span>
            )}
            {story.editorsPick && (
              <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-white shadow-sm">Editor's Pick</span>
            )}
            {story.category && (
              <Link href={getCategoryUrl(story.category)}>
                <span className="inline-flex items-center rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium group-hover:border-primary group-hover:text-primary transition-colors">{story.category}</span>
              </Link>
            )}
            {story.country && (
              <Link href={getCountryUrl(story.country)}>
                <span className="inline-flex items-center rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium group-hover:border-primary group-hover:text-primary transition-colors">{story.country}</span>
              </Link>
            )}
          </div>
          <h3 className="text-2xl font-semibold leading-tight tracking-tight group-hover:text-primary transition-colors mb-2">
            {story.title}
          </h3>
          <p className="text-sm text-gray-500 mt-2 mb-3">
            {formattedDate} • By Global Travel Report Editorial Team
          </p>
          <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{story.excerpt}</p>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {story.tags && story.tags.slice(0, 3).map((tag) => (
              <Link key={tag} href={getTagUrl(tag)}>
                <span className="inline-flex items-center rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium hover:bg-gray-50 hover:text-primary hover:border-primary transition-all">
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