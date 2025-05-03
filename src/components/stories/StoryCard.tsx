"use client";

import React from 'react';
import Link from 'next/link';
import { withErrorBoundary } from '@/src/components/ui/ErrorBoundary';
import { formatDisplayDate } from '@/src/utils/date-utils';
import { StoryCoverImage } from '@/src/components/ui/OptimizedImage';
import { ResponsiveImage } from '@/src/components/ui/ResponsiveImage';
import { getStoryUrl, getCategoryUrl, getCountryUrl, getTagUrl } from '@/src/utils/url';
import { cn } from '@/src/utils/cn';
import type { Story } from '@/types/Story';

interface StoryCardProps {
  story: Story;
  className?: string;
}

const StoryCardComponent = ({ story, className }: StoryCardProps) => {
  // Generate a unique image based on story category and title if no image is provided
  const getUniqueImage = React.useCallback(() => {
    if (story.imageUrl && story.imageUrl.startsWith('http')) {
      return story.imageUrl;
    }

    // Category-specific default images
    const defaultImages = {
      'Travel': [
        'https://images.unsplash.com/photo-1488085061387-422e29b40080',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
        'https://images.unsplash.com/photo-1503220317375-aaad61436b1b'
      ],
      'Cruise': [
        'https://images.unsplash.com/photo-1548574505-5e239809ee19',
        'https://images.unsplash.com/photo-1599640842225-85d111c60e6b',
        'https://images.unsplash.com/photo-1548690312-e3b507d8c110'
      ],
      'Culture': [
        'https://images.unsplash.com/photo-1493707553966-283afac8c358',
        'https://images.unsplash.com/photo-1577083552431-6e5fd01988a5',
        'https://images.unsplash.com/photo-1566438480900-0609be27a4be'
      ],
      'Food & Wine': [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        'https://images.unsplash.com/photo-1543352634-99a5d50ae78e',
        'https://images.unsplash.com/photo-1533777324565-a040eb52facd'
      ],
      'Adventure': [
        'https://images.unsplash.com/photo-1551632811-561732d1e306',
        'https://images.unsplash.com/photo-1527631746610-bca00a040d60',
        'https://images.unsplash.com/photo-1516939884455-1445c8652f83'
      ]
    };

    // Get the category or use 'Travel' as default
    const category = story.category.split(',')[0].trim();
    const imageArray = defaultImages[category] || defaultImages['Travel'];

    // Use the story title to deterministically select an image from the array
    const titleHash = story.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = titleHash % imageArray.length;

    return imageArray[index];
  }, [story.imageUrl, story.category, story.title]);

  // Set the image source
  const [imgSrc] = React.useState(getUniqueImage());

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
      className={cn(
        "transition-all duration-300 hover:shadow-xl border rounded-lg overflow-hidden group hover:translate-y-[-4px]",
        story.featured && "border-primary",
        story.editorsPick && "border-secondary",
        className
      )}
    >
      <Link href={getStoryUrl(story.slug)} className="block">
        <div className="relative w-full overflow-hidden">
          <ResponsiveImage
            src={imgSrc}
            alt={story.title}
            priority={story.featured}
            className="rounded-t-lg transition-transform duration-700 group-hover:scale-110"
            aspectRatio="16/9"
            sizes={{
              sm: '100vw',
              md: '50vw',
              lg: '33vw'
            }}
            lazyLoad={!story.featured}
            containerClassName="relative"
            quality={85}
          />
          {story.photographer && (
            <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs p-2 rounded-tl z-10">
              Photo by{" "}
              {story.photographer.url ? (
                <a
                  href={story.photographer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline hover:text-gray-200"
                >
                  {story.photographer.name}
                </a>
              ) : (
                <span className="font-bold">{story.photographer.name}</span>
              )}
              {" "}on{" "}
              <a
                href="https://unsplash.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline hover:text-gray-200"
              >
                Unsplash
              </a>
            </div>
          )}
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
  <div className={cn(
    "transition-all border border-gray-200 rounded-lg overflow-hidden"
  )}>
    <div className="w-full" style={{ aspectRatio: '16/9' }}>
      <div className="w-full h-full bg-gray-200 rounded-t-lg animate-pulse"></div>
    </div>
    <div className="p-5">
      <div className="flex gap-2 mb-3">
        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>
      <div className="h-7 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse mb-3"></div>
      <div className="h-16 bg-gray-200 rounded animate-pulse mb-4"></div>
      <div className="pt-2 border-t border-gray-100 flex gap-2">
        <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Export the StoryCard with error boundary
export const StoryCard = withErrorBoundary(StoryCardComponent, {
  fallback: <StoryCardFallback />,
  componentName: 'StoryCard'
});