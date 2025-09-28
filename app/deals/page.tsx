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
import { DealsPageClient } from './DealsPageClient';

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


export default function DealsPage() {
  return <DealsPageClient />;
}
