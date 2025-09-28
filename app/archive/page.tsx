import { Metadata } from 'next';
import ArchiveClient from './ArchiveClient';

// Force dynamic rendering for archive content
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Story Archive - Global Travel Report',
  description: 'Browse our complete collection of travel stories, destination guides, and insider tips. Discover inspiring content from the past year and beyond.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/archive`,
  },
  openGraph: {
    title: 'Story Archive - Global Travel Report',
    description: 'Browse our complete collection of travel stories, destination guides, and insider tips. Discover inspiring content from the past year and beyond.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/archive`,
    siteName: 'Global Travel Report',
    images: [
      {
        url: '/og/archive-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'Story Archive - Global Travel Report',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@globaltravelreport',
    creator: '@globaltravelreport',
    title: 'Story Archive - Global Travel Report',
    description: 'Browse our complete collection of travel stories, destination guides, and insider tips. Discover inspiring content from the past year and beyond.',
    images: ['/og/archive-1200x630.jpg'],
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
  keywords: ['travel stories archive', 'travel guides archive', 'destination guides archive', 'travel tips archive', 'travel blog archive'],
};

export default function ArchivePage() {
  return <ArchiveClient />;
}