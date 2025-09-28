import { Metadata } from 'next';
import { affiliatePartners } from '@/src/data/affiliatePartners';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AffiliateDisclosure } from '@/src/components/legal/AffiliateDisclosure';
import Image from 'next/image';
import EnhancedOffersPageClient from './EnhancedOffersPageClient';

export const metadata: Metadata = {
  title: 'Travel Deals & Offers - Global Travel Report',
  description: 'Discover exclusive travel deals and offers from our trusted partners. Save on hotels, flights, transfers, and travel essentials.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/offers/enhanced`,
  },
  openGraph: {
    title: 'Travel Deals & Offers - Global Travel Report',
    description: 'Discover exclusive travel deals and offers from our trusted partners. Save on hotels, flights, transfers, and travel essentials.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/offers/enhanced`,
    siteName: 'Global Travel Report',
    images: [
      {
        url: '/og/offers-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'Travel Deals and Offers',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@globaltravelreport',
    creator: '@globaltravelreport',
    title: 'Travel Deals & Offers - Global Travel Report',
    description: 'Discover exclusive travel deals and offers from our trusted partners.',
    images: ['/og/offers-1200x630.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'travel',
  keywords: ['travel deals', 'travel offers', 'discounts', 'travel savings', 'affiliate deals'],
};

export default function EnhancedOffersPage() {
  // Group partners by category (using manual mapping since data doesn't include category)
  const categoryMapping: Record<string, string> = {
    'Trip.com': 'Accommodation',
    'Welcome Pickups': 'Transportation',
    'Yesim': 'Connectivity',
    'EKTA': 'Travel Essentials',
    'Kiwitaxi': 'Transportation',
    'Airalo': 'Connectivity',
    'GetRentacar.com': 'Transportation',
    'Surfshark VPN': 'Travel Essentials',
    'Surfshark One': 'Travel Essentials',
    'Wise': 'Finance',
    'AMEX Platinum': 'Finance',
    'UP Card': 'Finance'
  };

  const partnersByCategory = affiliatePartners.reduce((acc, partner) => {
    const category = categoryMapping[partner.name] || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(partner);
    return acc;
  }, {} as Record<string, typeof affiliatePartners>);

  // Sample promotional offers (in production, this would come from an API)
  const promotionalOffers = [
    {
      id: 'welcome-bonus',
      title: 'New Customer Welcome Bonus',
      description: 'Get 10% off your first booking with Trip.com',
      partner: 'Trip.com',
      discount: '10% OFF',
      validUntil: '2025-12-31',
      featured: true
    },
    {
      id: 'airport-transfer',
      title: 'Airport Transfer Discount',
      description: 'Save 15% on airport transfers with Welcome Pickups',
      partner: 'Welcome Pickups',
      discount: '15% OFF',
      validUntil: '2025-12-31',
      featured: true
    },
    {
      id: 'esim-data',
      title: 'Global Data Plans',
      description: 'Unlimited data in 200+ countries starting at $4.50',
      partner: 'Airalo',
      discount: 'FROM $4.50',
      validUntil: '2025-12-31',
      featured: false
    },
    {
      id: 'vpn-security',
      title: 'Travel Security Suite',
      description: 'Complete online protection for travelers',
      partner: 'Surfshark VPN',
      discount: 'SPECIAL OFFER',
      validUntil: '2025-12-31',
      featured: false
    }
  ];

  return (
    <EnhancedOffersPageClient
      promotionalOffers={promotionalOffers}
      partnersByCategory={partnersByCategory}
    />
  );
}