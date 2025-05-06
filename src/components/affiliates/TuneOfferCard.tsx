'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TuneOffer, TuneAffiliateService } from '@/src/services/tuneAffiliateService';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface TuneOfferCardProps {
  offer: TuneOffer;
  source?: string;
  className?: string;
  showDescription?: boolean;
  showPayout?: boolean;
  showTags?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  buttonText?: string;
}

/**
 * TuneOfferCard component for displaying TUNE affiliate offers
 */
export function TuneOfferCard({
  offer,
  source = 'card',
  className,
  showDescription = true,
  showPayout = true,
  showTags = true,
  variant = 'default',
  buttonText = 'View Offer'
}: TuneOfferCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [trackingLink, setTrackingLink] = useState<string | null>(null);
  const tuneService = TuneAffiliateService.getInstance();

  // Determine if this is a compact card
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  // Handle click to generate tracking link
  const handleClick = async () => {
    setIsLoading(true);
    tuneService.trackClick(offer.id, source);

    try {
      // If we already have a tracking link, use it
      if (trackingLink) {
        window.open(trackingLink, '_blank');
        return;
      }

      // Otherwise, generate a new tracking link
      const link = await tuneService.generateTrackingLink(offer.id, {
        source: 'globaltravelreport',
        utm_source: 'globaltravelreport',
        utm_medium: 'affiliate',
        utm_campaign: source
      });

      if (link && link.tracking_url) {
        setTrackingLink(link.tiny_url || link.tracking_url);
        window.open(link.tiny_url || link.tracking_url, '_blank');
      } else {
        // If we couldn't generate a tracking link, fall back to the preview URL
        window.open(offer.preview_url, '_blank');
      }
    } catch (error) {
      console.error('Error generating tracking link:', error);
      // Fall back to the preview URL
      window.open(offer.preview_url, '_blank');
    } finally {
      setIsLoading(false);
    }
  };

  // Default image if none is provided
  const imageUrl = offer.thumbnail_url || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000';

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-300 hover:shadow-lg',
        isFeatured && 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50',
        className
      )}
    >
      {/* Card Header with Image */}
      <div className="relative">
        {/* Product Image */}
        <div className={cn(
          "relative w-full overflow-hidden",
          isCompact ? "h-32" : "h-48"
        )}>
          <Image
            src={imageUrl}
            alt={offer.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Featured Badge */}
        {offer.featured && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            Featured
          </div>
        )}

        {/* Provider Logo */}
        <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded-md px-2 py-1">
          <div className="text-xs font-semibold text-gray-700">TUNE</div>
        </div>
      </div>

      {/* Card Content */}
      <CardContent className={cn(
        "p-4",
        isCompact && "p-3"
      )}>
        {/* Category */}
        {offer.category && (
          <div className="text-sm font-medium text-blue-600 mb-1">{offer.category}</div>
        )}
        
        {/* Title */}
        <h3 className={cn(
          "font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors",
          isCompact ? "text-base line-clamp-1" : "text-lg line-clamp-2"
        )}>
          {offer.name}
        </h3>
        
        {/* Description */}
        {showDescription && offer.description && (
          <p className={cn(
            "text-gray-600 mb-3",
            isCompact ? "text-xs line-clamp-1" : "text-sm line-clamp-2"
          )}>
            {offer.description}
          </p>
        )}

        {/* Payout */}
        {showPayout && offer.default_payout && (
          <div className="flex items-center mb-3">
            <span className="text-lg font-bold text-blue-600 mr-2">
              {offer.default_payout} {offer.currency}
            </span>
            <span className="text-sm text-gray-500">
              {offer.payout_type === 'cpa_flat' ? 'per action' : 
               offer.payout_type === 'cpc' ? 'per click' : 
               offer.payout_type === 'cpm' ? 'per 1000 impressions' : 
               offer.payout_type === 'cpa_percentage' ? '% of sale' : ''}
            </span>
          </div>
        )}

        {/* Countries */}
        {offer.countries && offer.countries.length > 0 && (
          <div className="mb-3">
            <span className="text-sm text-gray-600">Available in: </span>
            <span className="text-sm font-medium text-gray-800">
              {offer.countries.slice(0, 3).join(', ')}
              {offer.countries.length > 3 && ' and more'}
            </span>
          </div>
        )}

        {/* Tags */}
        {showTags && offer.tags && offer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {offer.tags.slice(0, isCompact ? 2 : 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs bg-gray-100">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      {/* Card Footer with CTA Button */}
      <CardFooter className={cn(
        "p-4 pt-0",
        isCompact && "p-3 pt-0"
      )}>
        <Button 
          className={cn(
            "w-full",
            isFeatured && "bg-blue-600 hover:bg-blue-700"
          )}
          onClick={handleClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          ) : buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * TuneOfferCardSkeleton component for displaying a loading state
 */
export function TuneOfferCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'featured' }) {
  const isCompact = variant === 'compact';
  
  return (
    <Card className="overflow-hidden">
      {/* Image Skeleton */}
      <Skeleton className={cn(
        "w-full",
        isCompact ? "h-32" : "h-48"
      )} />
      
      {/* Content Skeleton */}
      <div className="p-4">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );
}

export default TuneOfferCard;
