'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Story } from '@/types/Story';
import { RecommendationService } from '@/src/services/recommendationService';
import { getAllStories } from '@/src/utils/stories';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { LazyLoad } from '@/components/ui/LazyLoad';
import { cn } from '@/src/utils/cn';

interface RelatedStoriesProps {
  currentStory: Story;
  limit?: number;
}

/**
 * Component for displaying related stories
 * @param props - Component props
 * @returns The related stories component
 */
export function RelatedStories({ currentStory, limit = 4 }: RelatedStoriesProps) {
  const [relatedStories, setRelatedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedStories = async () => {
      try {
        setLoading(true);

        // Get all stories
        const allStories = await getAllStories();

        // Get related stories
        const recommendationService = RecommendationService.getInstance();
        const related = recommendationService.getRelatedStories(currentStory, allStories, limit);

        setRelatedStories(related);
      } catch (error) {
        console.error('Error fetching related stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedStories();
  }, [currentStory, limit]);

  if (loading) {
    return (
      <div className="mt-12 pt-8 border-t">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">You Might Also Like</h2>
          <div className="w-24 h-5">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, index) => (
            <Card key={index} className="overflow-hidden h-full">
              <Skeleton className="w-full" style={{ aspectRatio: '16/9' }} />
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <div className="pt-2 border-t border-gray-100 flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (relatedStories.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">You Might Also Like</h2>
        <Link
          href="/destinations"
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
        >
          View all destinations
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedStories.map((story) => (
          <Link key={story.id} href={`/stories/${story.slug}`} className="group">
            <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
              <div className="relative w-full overflow-hidden">
                {story.imageUrl ? (
                  <ResponsiveImage
                    src={story.imageUrl}
                    alt={story.title}
                    className="transition-transform duration-300 group-hover:scale-105"
                    aspectRatio="16/9"
                    sizes={{
                      sm: '100vw',
                      md: '50vw',
                      lg: '25vw'
                    }}
                    objectFit="cover"
                    lazyLoad={true}
                    lazyLoadThreshold={0.2}
                  />
                ) : (
                  <div className="aspect-[16/9] w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm font-medium text-blue-600">{story.category}</div>
                  {story.country && (
                    <div className="text-xs text-gray-500">{story.country}</div>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {story.title.replace(/^Title:\s*/i, '')}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">{story.excerpt}</p>

                {/* Tags */}
                {story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-gray-100">
                    {story.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {story.tags.length > 2 && (
                      <span className="inline-block text-xs text-gray-400">
                        +{story.tags.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
