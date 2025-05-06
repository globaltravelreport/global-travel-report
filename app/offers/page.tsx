import React from 'react';
import { Metadata } from 'next';
import { TuneOffersSection } from '@/src/components/affiliates/TuneOffersSection';
import { AdSenseLeaderboard } from '@/src/components/ads/AdSense';

// Generate metadata for the offers page
export const metadata: Metadata = {
  title: 'Travel Offers | Global Travel Report',
  description: 'Exclusive travel offers and deals recommended by the Global Travel Report team to help you plan your next adventure.',
};

/**
 * Travel Offers Page
 * 
 * This page displays travel offers and deals from the TUNE affiliate network
 */
export default function OffersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Travel Offers</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Exclusive travel offers and deals recommended by our travel experts to help you plan your next adventure.
        </p>
      </div>

      {/* Featured Offers */}
      <TuneOffersSection
        title="Featured Travel Offers"
        description="Handpicked travel deals from our partners"
        source="offers-featured"
        layout="featured"
        featuredOnly={true}
        limit={4}
      />

      {/* AdSense Leaderboard */}
      <div className="my-12">
        <AdSenseLeaderboard />
      </div>

      {/* Cruise Offers */}
      <TuneOffersSection
        title="Cruise Deals"
        description="Discover amazing cruise deals to destinations around the world"
        source="offers-cruise"
        category="Cruise"
        limit={3}
      />

      {/* Hotel Offers */}
      <TuneOffersSection
        title="Hotel Deals"
        description="Find the perfect accommodation for your next trip"
        source="offers-hotel"
        tag="Hotel"
        limit={3}
      />

      {/* Flight Offers */}
      <TuneOffersSection
        title="Flight Deals"
        description="Save on flights to your favorite destinations"
        source="offers-flight"
        tag="Flight"
        limit={3}
      />

      {/* AdSense Leaderboard */}
      <div className="my-12">
        <AdSenseLeaderboard />
      </div>

      {/* Travel Insurance Offers */}
      <TuneOffersSection
        title="Travel Insurance"
        description="Protect your trip with comprehensive travel insurance"
        source="offers-insurance"
        tag="Insurance"
        limit={3}
      />

      {/* Travel Packages */}
      <TuneOffersSection
        title="Travel Packages"
        description="Complete travel packages for hassle-free adventures"
        source="offers-packages"
        tag="Package"
        limit={3}
      />
    </div>
  );
}
