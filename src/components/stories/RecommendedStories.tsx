"use client";

import React, { useEffect, useState } from 'react';
import { Story } from '@/types/Story';
import { StoryCard } from '@/src/components/stories/StoryCard';
import { personalizationService } from '@/src/services/personalization-service';
import { useGlobalError } from '@/src/components/ui/GlobalErrorHandler';
import { Skeleton } from '@/src/components/ui/skeleton';

interface RecommendedStoriesProps {
  /**
   * User ID for personalization
   */
  userId?: string;
  
  /**
   * Current story ID (to exclude from recommendations)
   */
  currentStoryId?: string;
  
  /**
   * All available stories
   */
  allStories: Story[];
  
  /**
   * Maximum number of recommendations
   */
  limit?: number;
  
  /**
   * Title for the recommendations section
   */
  title?: string;
  
  /**
   * Whether to show similar stories instead of personalized recommendations
   */
  showSimilar?: boolean;
  
  /**
   * Whether to show trending stories instead of personalized recommendations
   */
  showTrending?: boolean;
  
  /**
   * CSS class for the container
   */
  className?: string;
}

/**
 * Component for displaying personalized story recommendations
 */
export function RecommendedStories({
  userId = 'anonymous',
  currentStoryId,
  allStories,
  limit = 3,
  title,
  showSimilar = false,
  showTrending = false,
  className,
}: RecommendedStoriesProps) {
  const [recommendations, setRecommendations] = useState<Story[]>([]);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const { showError } = useGlobalError();
  
  useEffect(() => {
    // Skip if no stories are available
    if (allStories.length === 0) {
      setLoading(false);
      return;
    }
    
    try {
      // Filter out current story if provided
      const availableStories = currentStoryId
        ? allStories.filter(story => story.id !== currentStoryId)
        : allStories;
      
      // Get recommendations based on the selected mode
      let recommendedStories: Story[] = [];
      let recommendationReason = '';
      
      if (showSimilar && currentStoryId) {
        // Get similar stories
        recommendedStories = personalizationService.getSimilarStories(
          currentStoryId,
          availableStories,
          limit
        );
        recommendationReason = 'Similar stories';
      } else if (showTrending) {
        // Get trending stories
        recommendedStories = personalizationService.getTrendingStories(
          availableStories,
          limit
        );
        recommendationReason = 'Trending stories';
      } else {
        // Get personalized recommendations
        const result = personalizationService.getRecommendations(
          userId,
          availableStories,
          limit
        );
        recommendedStories = result.stories;
        recommendationReason = result.reason;
      }
      
      setRecommendations(recommendedStories);
      setReason(recommendationReason);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      showError('Failed to load recommendations');
      
      // Fallback to random stories
      const randomStories = allStories
        .filter(story => story.id !== currentStoryId)
        .sort(() => 0.5 - Math.random())
        .slice(0, limit);
      
      setRecommendations(randomStories);
      setReason('You might also like');
    } finally {
      setLoading(false);
    }
  }, [allStories, currentStoryId, limit, showSimilar, showTrending, userId, showError]);
  
  // Custom title based on mode
  const sectionTitle = title || (
    showSimilar ? 'Similar Stories' :
    showTrending ? 'Trending Stories' :
    reason
  );
  
  // If no recommendations, don't render anything
  if (!loading && recommendations.length === 0) {
    return null;
  }
  
  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-4">{sectionTitle}</h2>
      
      {loading ? (
        // Loading skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        // Recommendations
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map(story => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}
