/**
 * Deals & Offers Page
 *
 * Dynamic page showcasing partner promotions, affiliate deals,
 * and special offers with enhanced tracking and monetization.
 */

import React from 'react';
import { Metadata } from 'next';
import { affiliatePartners } from '@/src/data/affiliatePartners';
import { AffiliateDisclosure } from '@/src/components/legal/AffiliateDisclosure';
import { createTrackedAffiliateLink, getCurrentPageContext } from '@/src/lib/enhancedAffiliateTracking';

export const metadata: Metadata = {
  title: 'Travel Deals & Offers | Exclusive Partner Promotions',
  description: 'Discover exclusive travel deals and partner offers including cruise packages, hotel discounts, and flight deals. Save on your next adventure with our curated promotions.',
  keywords: ['travel deals', 'travel offers', 'cruise deals', 'hotel discounts', 'flight offers', 'travel promotions'],
  openGraph: {
    title: 'Travel Deals & Offers | Exclusive Partner Promotions',
    description: 'Discover exclusive travel deals and partner offers including cruise packages, hotel discounts, and flight deals.',
    type: 'website',
  },
};

interface Deal {
  id: string;
  title: string;
  description: string;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercentage?: number;
  affiliateUrl: string;
  affiliateId: string;
  imageUrl: string;
  category: string;
  expiresAt?: string;
  featured: boolean;
  tags: string[];
}

export default function DealsPage() {
  const pageContext = getCurrentPageContext();

  // Mock deals data - in production this would come from an API
  const deals: Deal[] = [
    {
      id: 'mediterranean-cruise-deal',
      title: 'Mediterranean Cruise Package - 7 Nights',
      description: 'Experience the beauty of the Mediterranean with this exclusive cruise package including all meals and select excursions.',
      originalPrice: 1299,
      discountedPrice: 899,
      discountPercentage: 31,
      affiliateUrl: 'https://example-cruise.com/mediterranean-package',
      affiliateId: 'cruise-partner-1',
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&q=80&w=800',
      category: 'Cruises',
      expiresAt: '2024-12-31',
      featured: true,
      tags: ['cruise', 'mediterranean', 'all-inclusive', 'family-friendly']
    },
    {
      id: 'japan-hotel-package',
      title: 'Luxury Tokyo Hotel Stay - 20% Off',
      description: 'Stay at a premium Tokyo hotel with stunning city views and exceptional service. Includes breakfast and spa access.',
      originalPrice: 400,
      discountedPrice: 320,
      discountPercentage: 20,
      affiliateUrl: 'https://example-hotel.com/tokyo-luxury',
      affiliateId: 'hotel-partner-1',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&q=80&w=800',
      category: 'Hotels',
      expiresAt: '2024-11-30',
      featured: false,
      tags: ['hotel', 'tokyo', 'luxury', 'city-break']
    },
    {
      id: 'flight-deal-europe',
      title: 'Europe Flight Sale - Up to 40% Off',
      description: 'Fly to major European destinations at unbeatable prices. Limited time offer on premium economy and business class.',
      originalPrice: 800,
      discountedPrice: 480,
      discountPercentage: 40,
      affiliateUrl: 'https://example-airline.com/europe-sale',
      affiliateId: 'flight-partner-1',
      imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&q=80&w=800',
      category: 'Flights',
      expiresAt: '2024-10-31',
      featured: true,
      tags: ['flights', 'europe', 'business-class', 'sale']
    }
  ];

  const featuredDeals = deals.filter(deal => deal.featured);
  const regularDeals = deals.filter(deal => !deal.featured);

  const handleDealClick = (deal: Deal) => {
    const trackedLink = createTrackedAffiliateLink(
      deal.affiliateId,
      deal.affiliateUrl,
      {
        ...pageContext,
        storyId: deal.id,
        storyCategory: deal.category
      }
    );

    // Track the click
    if (trackedLink.onClick) {
      trackedLink.onClick({} as React.MouseEvent);
    }

    // Redirect to the affiliate link
    window.open(trackedLink.url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Exclusive Travel Deals & Offers
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover amazing travel deals from our trusted partners. Save on cruises, hotels, flights, and more
              with these exclusive promotions and limited-time offers.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Affiliate Disclosure */}
        <AffiliateDisclosure variant="banner" />

        {/* Featured Deals */}
        {featuredDeals.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Deals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDeals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  onClick={() => handleDealClick(deal)}
                  featured={true}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Deals */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                onClick={() => handleDealClick(deal)}
                featured={false}
              />
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="mt-12 bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Never Miss a Deal
          </h3>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter and be the first to know about exclusive deals and travel offers.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
              Subscribe
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

interface DealCardProps {
  deal: Deal;
  onClick: () => void;
  featured: boolean;
}

function DealCard({ deal, onClick, featured }: DealCardProps) {
  const discountAmount = deal.originalPrice && deal.discountedPrice
    ? deal.originalPrice - deal.discountedPrice
    : 0;

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${featured ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="relative">
        <img
          src={deal.imageUrl}
          alt={deal.title}
          className="w-full h-48 object-cover"
        />
        {deal.discountPercentage && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
            {deal.discountPercentage}% OFF
          </div>
        )}
        {featured && (
          <div className="absolute top-4 left-4 bg-blue-500 text-white px-2 py-1 rounded-md text-sm font-bold">
            FEATURED
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
            {deal.category}
          </span>
          {deal.expiresAt && (
            <span className="text-xs text-gray-500">
              Expires: {new Date(deal.expiresAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {deal.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {deal.description}
        </p>

        {/* Price Display */}
        <div className="flex items-center gap-4 mb-4">
          {deal.discountedPrice && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                ${deal.discountedPrice}
              </span>
              {deal.originalPrice && (
                <span className="text-lg text-gray-500 line-through">
                  ${deal.originalPrice}
                </span>
              )}
            </div>
          )}
          {discountAmount > 0 && (
            <span className="text-sm font-medium text-green-600">
              Save ${discountAmount}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {deal.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          onClick={onClick}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          View Deal
        </button>
      </div>
    </div>
  );
}