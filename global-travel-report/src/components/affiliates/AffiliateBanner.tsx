'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AffiliateProduct, AffiliateService } from '@/src/services/affiliateService';
import { cn } from '@/lib/utils';

interface AffiliateBannerProps {
  product: AffiliateProduct;
  source?: string;
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'full-width';
  buttonText?: string;
  title?: string;
  description?: string;
  showBadge?: boolean;
  badgeText?: string;
}

/**
 * AffiliateBanner component for displaying prominent affiliate promotions
 */
export function AffiliateBanner({
  product,
  source = 'banner',
  className,
  variant = 'horizontal',
  buttonText = 'Get This Deal',
  title,
  description,
  showBadge = true,
  badgeText = 'Sponsored'
}: AffiliateBannerProps) {
  const affiliateService = AffiliateService.getInstance();
  const affiliateLink = affiliateService.generateAffiliateLink(product, source);
  const provider = affiliateService.getProvider(product.provider);

  // Handle click tracking
  const handleClick = () => {
    affiliateService.trackClick(product, source);
  };

  // Determine layout based on variant
  const isVertical = variant === 'vertical';
  const isFullWidth = variant === 'full-width';

  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md',
        isVertical ? 'flex flex-col' : 'flex flex-col md:flex-row',
        isFullWidth && 'w-full',
        className
      )}
    >
      {/* Sponsored Badge */}
      {showBadge && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="secondary" className="bg-gray-800 text-white text-xs">
            {badgeText}
          </Badge>
        </div>
      )}

      {/* Image Section */}
      <div className={cn(
        'relative overflow-hidden',
        isVertical ? 'w-full h-48' : 'w-full md:w-2/5 h-48 md:h-auto'
      )}>
        <Image
          src={product.imageUrl}
          alt={title || product.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes={isVertical ? '100vw' : '(max-width: 768px) 100vw, 40vw'}
        />
        
        {/* Discount Badge */}
        {product.discountPercentage && (
          <div className="absolute bottom-2 left-2 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">
            Save {product.discountPercentage}%
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={cn(
        'flex flex-col p-4',
        isVertical ? 'w-full' : 'w-full md:w-3/5'
      )}>
        {/* Provider Logo/Name */}
        {provider && (
          <div className="flex items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">{provider.name}</span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {title || product.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-4 flex-grow">
          {description || product.description}
        </p>

        {/* Price and CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-auto">
          {/* Price */}
          <div className="mb-3 sm:mb-0">
            {product.discountPrice ? (
              <div className="flex items-center">
                <span className="text-2xl font-bold text-blue-600 mr-2">
                  {product.discountPrice}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {product.price}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {product.price || 'Check Price'}
              </span>
            )}
          </div>

          {/* CTA Button */}
          <Link 
            href={affiliateLink} 
            target="_blank" 
            rel="noopener noreferrer sponsored"
            onClick={handleClick}
          >
            <Button size="lg" className="whitespace-nowrap">
              {buttonText}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AffiliateBanner;
