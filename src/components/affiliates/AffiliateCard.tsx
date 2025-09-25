'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AffiliateProduct, AffiliateService } from '@/src/services/affiliateService';
import { cn } from '@/lib/utils';

interface AffiliateCardProps {
  product: AffiliateProduct;
  source?: string;
  className?: string;
  showDescription?: boolean;
  showPrice?: boolean;
  showDiscount?: boolean;
  showRating?: boolean;
  showTags?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  buttonText?: string;
}

/**
 * AffiliateCard component for displaying affiliate products
 */
export function AffiliateCard({
  product,
  source = 'card',
  className,
  showDescription = true,
  showPrice = true,
  showDiscount = true,
  showRating = true,
  showTags = true,
  variant = 'default',
  buttonText = 'View Deal'
}: AffiliateCardProps) {
  const affiliateService = AffiliateService.getInstance();
  const affiliateLink = affiliateService.generateAffiliateLink(product, source);
  const provider = affiliateService.getProvider(product.provider);

  // Handle click tracking
  const handleClick = () => {
    affiliateService.trackClick(product, source);
  };

  // Determine if this is a compact card
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

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
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Discount Badge */}
        {showDiscount && product.discountPercentage && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            Save {product.discountPercentage}%
          </div>
        )}

        {/* Provider Logo */}
        {provider && (
          <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded-md px-2 py-1">
            <div className="text-xs font-semibold text-gray-700">{provider.name}</div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <CardContent className={cn(
        "p-4",
        isCompact && "p-3"
      )}>
        {/* Category */}
        <div className="text-sm font-medium text-blue-600 mb-1">{product.category}</div>
        
        {/* Title */}
        <h3 className={cn(
          "font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors",
          isCompact ? "text-base line-clamp-1" : "text-lg line-clamp-2"
        )}>
          {product.name}
        </h3>
        
        {/* Description */}
        {showDescription && (
          <p className={cn(
            "text-gray-600 mb-3",
            isCompact ? "text-xs line-clamp-1" : "text-sm line-clamp-2"
          )}>
            {product.description}
          </p>
        )}

        {/* Price and Discount */}
        {showPrice && (
          <div className="flex items-center mb-3">
            {product.discountPrice ? (
              <>
                <span className="text-lg font-bold text-blue-600 mr-2">
                  {product.discountPrice}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {product.price}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-blue-600">
                {product.price}
              </span>
            )}
          </div>
        )}

        {/* Rating */}
        {showRating && product.rating && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={cn(
                    "w-4 h-4",
                    star <= Math.round(product.rating || 0)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300 fill-current"
                  )}
                  viewBox="0 0 20 20"
<<<<<<< HEAD
                  xmlns="https://www.w3.org/2000/svg"
=======
                  xmlns="http://www.w3.org/2000/svg"
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-1">{product.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Tags */}
        {showTags && product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.tags.slice(0, isCompact ? 2 : 3).map((tag) => (
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
        <Link 
          href={affiliateLink} 
          target="_blank" 
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="w-full"
        >
          <Button 
            className={cn(
              "w-full",
              isFeatured && "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {buttonText}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default AffiliateCard;
