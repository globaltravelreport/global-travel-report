'use client';

import React, { useEffect, useState } from 'react';
import { TuneOffer, TuneAffiliateService } from '@/src/services/tuneAffiliateService';
import { TuneOfferCard, TuneOfferCardSkeleton } from './TuneOfferCard';
import { Story } from '@/types/Story';
import { cn } from '@/lib/utils';

interface ContextualTuneOffersProps {
  story: Story;
  className?: string;
  variant?: 'inline' | 'sidebar' | 'banner';
  title?: string;
  limit?: number;
}

/**
 * ContextualTuneOffers component for displaying TUNE affiliate offers
 * that are contextually relevant to the current story
 */
export function ContextualTuneOffers({
  story,
  className,
  variant = 'inline',
  title = 'Travel Offers',
  limit = 2
}: ContextualTuneOffersProps) {
  const [offers, setOffers] = useState<TuneOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const tuneService = TuneAffiliateService.getInstance();
        
        if (!tuneService.isConfigured()) {
          setError('TUNE Affiliate service is not properly configured');
          setIsLoading(false);
          return;
        }
        
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
        
        // Fetch all offers
        const allOffers = await tuneService.getAllOffers();
        
        // Filter offers based on relevance to the story
        const relevantOffers = allOffers.filter(offer => {
          // Check if offer category matches story category
          if (offer.category && story.category && 
              offer.category.toLowerCase() === story.category.toLowerCase()) {
            return true;
          }
          
          // Check if offer tags match any story tags
          if (offer.tags && offer.tags.length > 0 && relevantTags.length > 0) {
            return offer.tags.some(tag => 
              relevantTags.some(storyTag => 
                tag.toLowerCase().includes(storyTag.toLowerCase()) || 
                storyTag.toLowerCase().includes(tag.toLowerCase())
              )
            );
          }
          
          // Check if offer countries include story country
          if (offer.countries && offer.countries.length > 0 && 
              story.country && story.country !== 'Global') {
            return offer.countries.some(country => 
              country.toLowerCase() === story.country.toLowerCase()
            );
          }
          
          return false;
        });
        
        // If we don't have enough relevant offers, add some featured offers
        if (relevantOffers.length < limit) {
          const featuredOffers = allOffers.filter(offer => 
            offer.featured && !relevantOffers.some(o => o.id === offer.id)
          );
          
          // Combine and limit
          const combinedOffers = [...relevantOffers, ...featuredOffers].slice(0, limit);
          setOffers(combinedOffers);
        } else {
          setOffers(relevantOffers.slice(0, limit));
        }
      } catch (err) {
        console.error('Error fetching contextual TUNE offers:', err);
        setError('Failed to load offers');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOffers();
  }, [story, limit]);

  // If no offers and not loading, don't render anything
  if (offers.length === 0 && !isLoading) {
    return null;
  }

  // Render based on variant
  if (variant === 'sidebar') {
    return (
      <div className={cn('space-y-4', className)}>
        <h3 className="text-lg font-semibold">{title}</h3>
        
        {isLoading ? (
          <>
            <TuneOfferCardSkeleton variant="compact" />
            {limit > 1 && <TuneOfferCardSkeleton variant="compact" />}
          </>
        ) : (
          <>
            {offers.map((offer) => (
              <TuneOfferCard
                key={offer.id}
                offer={offer}
                source={`contextual-sidebar-${story.category?.toLowerCase()}`}
                variant="compact"
                showDescription={false}
              />
            ))}
          </>
        )}
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={cn('my-8', className)}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TuneOfferCardSkeleton />
          {limit > 1 && <TuneOfferCardSkeleton />}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((offer) => (
            <TuneOfferCard
              key={offer.id}
              offer={offer}
              source={`contextual-inline-${story.category?.toLowerCase()}`}
              variant="default"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ContextualTuneOffers;
