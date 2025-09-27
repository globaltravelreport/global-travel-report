'use client';

import React from 'react';
import Link from 'next/link';
import { AffiliateCard } from './AffiliateCard';
import { AffiliateBanner } from './AffiliateBanner';
import { AffiliateProduct, AffiliateService } from '@/src/services/affiliateService';
import { cn } from '@/lib/utils';

interface AffiliateSectionProps {
  title?: string;
  description?: string;
  products: AffiliateProduct[];
  source?: string;
  className?: string;
  layout?: 'grid' | 'carousel' | 'featured';
  showViewAll?: boolean;
  viewAllLink?: string;
  viewAllText?: string;
  limit?: number;
  showTitle?: boolean;
}

/**
 * AffiliateSection component for displaying multiple affiliate products
 */
export function AffiliateSection({
  title = 'Recommended Travel Deals',
  description,
  products,
  source = 'section',
  className,
  layout = 'grid',
  showViewAll = false,
  viewAllLink = '/deals',
  viewAllText = 'View All Deals',
  limit = 3,
  showTitle = true
}: AffiliateSectionProps) {
  // Limit the number of products to display
  const displayProducts = products.slice(0, limit);

  // If no products, don't render anything
  if (displayProducts.length === 0) {
    return null;
  }

  // Featured layout shows the first product as a banner and the rest as cards
  const isFeatured = layout === 'featured';

  return (
    <section className={cn(
      'my-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl',
      className
    )}>
      {/* Section Header */}
      {showTitle && (
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"> b700c9036c47c406994d24ce88e371e4e905cffe
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
        </div>
      )}

      {/* Featured Layout */}
      {isFeatured && displayProducts.length > 0 && (
        <div className="space-y-6">
          {/* Featured Banner */}
          <AffiliateBanner
            product={displayProducts[0]}
            source={`${source}-featured`}
            variant="horizontal"
          />

          {/* Additional Products */}
          {displayProducts.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {displayProducts.slice(1).map((product) => (
                <AffiliateCard
                  key={product.id}
                  product={product}
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
          {displayProducts.map((product) => (
            <AffiliateCard
              key={product.id}
              product={product}
              source={`${source}-card`}
              variant={product.featured ? 'featured' : 'default'}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default AffiliateSection;
