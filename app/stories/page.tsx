import { Metadata } from 'next';
import StoriesIndexClient from './StoriesIndexClient.tsx';

// Force dynamic rendering to ensure stories are loaded at runtime
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Travel Stories - Global Travel Report',
  description: 'Discover inspiring travel stories, destination guides, and insider tips from around the world. Explore our collection of engaging travel content with stunning visuals and expert insights.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/stories`,
  },
  openGraph: {
    title: 'Travel Stories - Global Travel Report',
    description: 'Discover inspiring travel stories, destination guides, and insider tips from around the world. Explore our collection of engaging travel content with stunning visuals and expert insights.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/stories`,
    siteName: 'Global Travel Report',
    images: [
      {
        url: '/og/home-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'Travel Stories - Global Travel Report',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@globaltravelreport',
    creator: '@globaltravelreport',
    title: 'Travel Stories - Global Travel Report',
    description: 'Discover inspiring travel stories, destination guides, and insider tips from around the world. Explore our collection of engaging travel content with stunning visuals and expert insights.',
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
  keywords: ['travel stories', 'travel guides', 'destination guides', 'travel tips', 'travel inspiration', 'travel blog'],
};

export default function StoriesPage() {
  return <StoriesIndexClient />;
}