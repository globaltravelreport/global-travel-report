import { Metadata } from 'next';
import StoriesIndexClient from '@/src/components/StoriesIndexClient';

export const metadata: Metadata = {
  title: 'Travel Stories - Global Travel Report',
  description: 'Discover inspiring travel stories, destination guides, and insider tips from around the world. Explore our collection of engaging travel content.',
  openGraph: {
    title: 'Travel Stories - Global Travel Report',
    description: 'Discover inspiring travel stories, destination guides, and insider tips from around the world.',
    images: [
      {
        url: '/og/home-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'Travel Stories - Global Travel Report',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Stories - Global Travel Report',
    description: 'Discover inspiring travel stories, destination guides, and insider tips from around the world.',
    images: ['/og/home-1200x630.jpg'],
  },
};

export default function StoriesIndexPage() {
  return <StoriesIndexClient />;
}