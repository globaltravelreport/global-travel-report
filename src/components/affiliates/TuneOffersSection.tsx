'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TuneOfferCard, TuneOfferCardSkeleton } from './TuneOfferCard';
import { TuneOffer, TuneAffiliateService } from '@/src/services/tuneAffiliateService';
import { cn } from '@/lib/utils';

interface TuneOffersSectionProps {
  title?: string;
  description?: string;
  source?: string;
  className?: string;
  layout?: 'grid' | 'carousel' | 'featured';
  showViewAll?: boolean;
  viewAllLink?: string;
  viewAllText?: string;
  limit?: number;
  category?: string;
  tag?: string;
  featuredOnly?: boolean;
}

/**
 * TuneOffersSection component for displaying multiple TUNE affiliate offers
 */
export function TuneOffersSection({
  title = 'Recommended Travel Offers',
  description,
  source = 'section',
  className,
  layout = 'grid',
  showViewAll = false,
  viewAllLink = '/offers',
  viewAllText = 'View All Offers',
  limit = 3,
  category,
  tag,
  featuredOnly = false
}: TuneOffersSectionProps) {
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
        
        let fetchedOffers: TuneOffer[] = [];
        
        // Fetch offers based on the provided filters
        if (category) {
          fetchedOffers = await tuneService.getOffersByCategory(category);
        } else if (tag) {
          fetchedOffers = await tuneService.getOffersByTag(tag);
        } else if (featuredOnly) {
          fetchedOffers = await tuneService.getFeaturedOffers(limit);
        } else {
          fetchedOffers = await tuneService.getAllOffers();
        }
        
        // Apply featured filter if needed
        if (featuredOnly && !category && !tag) {
          fetchedOffers = fetchedOffers.filter(offer => offer.featured);
        }
        
        // Limit the number of offers
        setOffers(fetchedOffers.slice(0, limit));
      } catch (err) {
        console.error('Error fetching TUNE offers:', err);
        setError('Failed to load offers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOffers();
  }, [category, tag, featuredOnly, limit]);
  
  // If loading, show skeleton cards
  if (isLoading) {
    return (
      <section className={cn(
        'my-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl',
        className
      )}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(limit).fill(0).map((_, index) => (
            <TuneOfferCardSkeleton key={index} variant={layout === 'featured' ? 'featured' : 'default'} />
          ))}
        </div>
      </section>
    );
  }
  
  // If error, show error message
  if (error) {
    return (
      <section className={cn(
        'my-8 p-6 bg-red-50 rounded-xl',
        className
      )}>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-red-600">{error}</p>
      </section>
    );
  }
  
  // If no offers, don't render anything
  if (offers.length === 0) {
    return null;
  }
  
  // Featured layout shows the first offer as featured and the rest as regular cards
  const isFeatured = layout === 'featured';
  
  return (
    <section className={cn(
      'my-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl',
      className
    )}>
      {/* Section Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>
        
        {showViewAll && (
          <Link 
            href={viewAllLink}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            {viewAllText}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        )}
      </div>

      {/* Featured Layout */}
      {isFeatured && offers.length > 0 && (
        <div className="space-y-6">
          {/* Featured Offer */}
          <TuneOfferCard 
            offer={offers[0]} 
            source={`${source}-featured`}
            variant="featured"
          />
          
          {/* Additional Offers */}
          {offers.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {offers.slice(1).map((offer) => (
                <TuneOfferCard
                  key={offer.id}
                  offer={offer}
                  source={`${source}-card`}
                  variant="compact"
                  showDescription={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid Layout */}
      {!isFeatured && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <TuneOfferCard
              key={offer.id}
              offer={offer}
              source={`${source}-card`}
              variant={offer.featured ? 'featured' : 'default'}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default TuneOffersSection;
