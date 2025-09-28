import Hero from '@/src/components/home/Hero';
import StoriesSection from '@/src/components/home/StoriesSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Global Travel Report - Your Ultimate Travel Companion',
  description: 'Discover amazing travel destinations, insider tips, and inspiring stories from around the world. Your ultimate guide to unforgettable adventures.',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com',
  },
  openGraph: {
    title: 'Global Travel Report - Your Ultimate Travel Companion',
    description: 'Discover amazing travel destinations, insider tips, and inspiring stories from around the world. Your ultimate guide to unforgettable adventures.',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com',
    siteName: 'Global Travel Report',
    images: [
      {
        url: '/og/home-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'Global Travel Report - Your Ultimate Travel Companion',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@globaltravelreport',
    creator: '@globaltravelreport',
    title: 'Global Travel Report - Your Ultimate Travel Companion',
    description: 'Discover amazing travel destinations, insider tips, and inspiring stories from around the world. Your ultimate guide to unforgettable adventures.',
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
  keywords: ['travel', 'destinations', 'travel tips', 'travel guide', 'adventure', 'vacation', 'tourism'],
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Featured Story */}
      <Hero />

      {/* Stories Section */}
      <StoriesSection />

      {/* Quick Links Section */}
      <div className="max-w-4xl mx-auto px-4 pb-12 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <a href="/categories-main" className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Explore Categories</h3>
            <p className="text-gray-600 text-sm">Browse travel stories by category</p>
          </a>
          <a href="/destinations" className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Destinations</h3>
            <p className="text-gray-600 text-sm">Discover amazing places to visit</p>
          </a>
          <a href="/search" className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-center sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Search</h3>
            <p className="text-gray-600 text-sm">Find specific travel content</p>
          </a>
        </div>
      </div>
    </div>
  );
}