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
  // Generate a unique image based on story category, title, and ID if no image is provided
  const getUniqueImage = React.useCallback(() => {
    // Always use our deterministic image selection algorithm
    // This ensures each story gets a unique image regardless of what's in the database

    // Expanded category-specific default images with more options
    const defaultImages = {
      'Travel': [
        'https://images.unsplash.com/photo-1488085061387-422e29b40080',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
        'https://images.unsplash.com/photo-1503220317375-aaad61436b1b',
        'https://images.unsplash.com/photo-1530521954074-e64f6810b32d',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
        'https://images.unsplash.com/photo-1530789253388-582c481c54b0',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
        'https://images.unsplash.com/photo-1508672019048-805c876b67e2',
        'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a'
      ],
      'Cruise': [
        'https://images.unsplash.com/photo-1548574505-5e239809ee19',
        'https://images.unsplash.com/photo-1599640842225-85d111c60e6b',
        'https://images.unsplash.com/photo-1548690312-e3b507d8c110',
        'https://images.unsplash.com/photo-1548690396-1fae5d6a3f8a',
        'https://images.unsplash.com/photo-1548574169-47bca74f9515',
        'https://images.unsplash.com/photo-1580541631950-7282082b03fe',
        'https://images.unsplash.com/photo-1566375638485-8c4d8780ae10',
        'https://images.unsplash.com/photo-1505118380757-91f5f5632de0',
        'https://images.unsplash.com/photo-1559599746-8823b38544c6'
      ],
      'Culture': [
        'https://images.unsplash.com/photo-1493707553966-283afac8c358',
        'https://images.unsplash.com/photo-1577083552431-6e5fd01988a5',
        'https://images.unsplash.com/photo-1566438480900-0609be27a4be',
        'https://images.unsplash.com/photo-1551913902-c92207136625',
        'https://images.unsplash.com/photo-1552084117-56a987666449',
        'https://images.unsplash.com/photo-1551966775-a4ddc8df052b',
        'https://images.unsplash.com/photo-1518998053901-5348d3961a04',
        'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0',
        'https://images.unsplash.com/photo-1581872151274-8ede2e3f7d12'
      ],
      'Food & Wine': [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        'https://images.unsplash.com/photo-1543352634-99a5d50ae78e',
        'https://images.unsplash.com/photo-1533777324565-a040eb52facd',
        'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
        'https://images.unsplash.com/photo-1481931098730-318b6f776db0',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
        'https://images.unsplash.com/photo-1515778767554-195d641642a7',
        'https://images.unsplash.com/photo-1482275548304-a58859dc31b7'
      ],
      'Adventure': [
        'https://images.unsplash.com/photo-1551632811-561732d1e306',
        'https://images.unsplash.com/photo-1527631746610-bca00a040d60',
        'https://images.unsplash.com/photo-1516939884455-1445c8652f83',
        'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd',
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4',
        'https://images.unsplash.com/photo-1533130061792-64b345e4a833',
        'https://images.unsplash.com/photo-1496080174650-637e3f22fa03',
        'https://images.unsplash.com/photo-1501555088652-021faa106b9b',
        'https://images.unsplash.com/photo-1473773508845-188df298d2d1',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
        'https://images.unsplash.com/photo-1439853949127-fa647821eba0',
        'https://images.unsplash.com/photo-1455156218388-5e61b526818b'
      ],
      'General': [
        'https://images.unsplash.com/photo-1488085061387-422e29b40080',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
        'https://images.unsplash.com/photo-1503220317375-aaad61436b1b',
        'https://images.unsplash.com/photo-1530521954074-e64f6810b32d',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
        'https://images.unsplash.com/photo-1530789253388-582c481c54b0',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
        'https://images.unsplash.com/photo-1508672019048-805c876b67e2',
        'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a'
      ]
    };

    // Get the category or use 'General' as default
    const category = story.category.split(',')[0].trim();
    const imageArray = defaultImages[category] || defaultImages['General'];

    // Create a more unique hash using story ID, slug, and title
    // This ensures that even stories with similar titles get different images
    const uniqueString = `${story.id || ''}-${story.slug || ''}-${story.title || ''}`;
    const uniqueHash = uniqueString.split('').reduce((acc, char, index) => {
      // Use character position to create more variation
      return acc + (char.charCodeAt(0) * (index + 1));
    }, 0);

    // Use the hash to select an image from the array
    const index = Math.abs(uniqueHash) % imageArray.length;

    return imageArray[index];
  }, [story.category, story.title, story.id, story.slug]);

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