'use client';

import React, { useEffect, useState } from 'react';
import { AffiliateProduct, AffiliateService } from '@/src/services/affiliateService';
import { AffiliateCard } from './AffiliateCard';
import { AffiliateBanner } from './AffiliateBanner';
import { Story } from '@/types/Story';
import { cn } from '@/lib/utils';

interface ContextualAffiliateRecommendationsProps {
  story: Story;
  className?: string;
  variant?: 'inline' | 'sidebar' | 'banner';
  title?: string;
  limit?: number;
}

/**
 * ContextualAffiliateRecommendations component for displaying affiliate products
 * that are contextually relevant to the current story
 */
export function ContextualAffiliateRecommendations({
  story,
  className,
  variant = 'inline',
  title = 'Travel Recommendations',
  limit = 2
}: ContextualAffiliateRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<AffiliateProduct[]>([]);
  const affiliateService = AffiliateService.getInstance();

  useEffect(() => {
    // Get relevant tags from the story
    const relevantTags: string[] = [];
    
    // Add story category
    if (story.category) {
      relevantTags.push(story.category);
    }
    
    // Add story country if not "Global"
    if (story.country && story.country !== 'Global') {
      relevantTags.push(story.country);
    }
    
    // Add story tags
    if (story.tags && Array.isArray(story.tags)) {
      relevantTags.push(...story.tags);
    }
    
    // Get recommendations based on tags
    const tagRecommendations = affiliateService.getProductsByTags(relevantTags);
    
    // If we don't have enough recommendations, add some featured products
    if (tagRecommendations.length < limit) {
      const featuredProducts = affiliateService.getFeaturedProducts(limit - tagRecommendations.length);
      
      // Combine and deduplicate
      const allRecommendations = [...tagRecommendations];
      
      for (const product of featuredProducts) {
        if (!allRecommendations.some(p => p.id === product.id)) {
          allRecommendations.push(product);
        }
      }
      
      setRecommendations(allRecommendations.slice(0, limit));
    } else {
      setRecommendations(tagRecommendations.slice(0, limit));
    }
  }, [story, limit]);

  // If no recommendations, don't render anything
  if (recommendations.length === 0) {
    return null;
  }

  // Render based on variant
  if (variant === 'banner' && recommendations.length > 0) {
    return (
      <div className={cn('my-8', className)}>
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <AffiliateBanner 
          product={recommendations[0]} 
          source={`contextual-${story.category?.toLowerCase()}`}
          variant="horizontal"
        />
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn('space-y-4', className)}>
        <h3 className="text-lg font-semibold">{title}</h3>
        {recommendations.map((product) => (
          <AffiliateCard
            key={product.id}
            product={product}
            source={`contextual-sidebar-${story.category?.toLowerCase()}`}
            variant="compact"
            showDescription={false}
            showRating={false}
          />
        ))}
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={cn('my-8', className)}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((product) => (
          <AffiliateCard
            key={product.id}
            product={product}
            source={`contextual-inline-${story.category?.toLowerCase()}`}
            variant="default"
          />
        ))}
      </div>
    </div>
  );
}

export default ContextualAffiliateRecommendations;
