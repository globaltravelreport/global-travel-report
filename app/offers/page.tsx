import { Metadata } from 'next';
import OffersPageClient from './OffersPageClient';

export const metadata: Metadata = {
  title: 'Travel Deals & Offers - Global Travel Report',
  description: 'Discover exclusive travel deals and offers from our trusted partners. Save on hotels, flights, transfers, and travel essentials.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/offers`,
  },
  openGraph: {
    title: 'Travel Deals & Offers - Global Travel Report',
    description: 'Discover exclusive travel deals and offers from our trusted partners. Save on hotels, flights, transfers, and travel essentials.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/offers`,
    siteName: 'Global Travel Report',
    images: [
      {
        url: '/og/home-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'Travel Deals and Offers - Global Travel Report',
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
    description: 'Discover exclusive travel deals and offers from our trusted partners. Save on hotels, flights, transfers, and travel essentials.',
    images: ['/og/home-1200x630.jpg'],
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
  keywords: ['travel deals', 'travel offers', 'hotel deals', 'flight deals', 'travel discounts', 'travel savings'],
};

export default function OffersPage() {
  // Convert to dynamic rendering to avoid static generation timeout
  return <OffersPageClient />;
}
