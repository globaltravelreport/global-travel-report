'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Story } from '@/types/Story';
import { RecommendationService } from '@/src/services/recommendationService';
import { getAllStories } from '@/src/utils/stories';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">You Might Also Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
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
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">You Might Also Like</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedStories.map((story) => (
          <Link key={story.id} href={`/stories/${story.slug}`} className="group">
            <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
              <div className="relative h-48 w-full overflow-hidden">
                {story.imageUrl ? (
                  <Image
                    src={story.imageUrl}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-blue-600 mb-1">{story.category}</div>
                <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {story.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">{story.excerpt}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
