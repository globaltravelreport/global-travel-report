import Hero from '../src/components/home/Hero';
import StoriesSection from '../src/components/home/StoriesSection';
import type { Metadata } from 'next';

// Force dynamic rendering to ensure stories are loaded at runtime
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Global Travel Report - Latest Travel News, Destination Guides & Cruise Updates',
  description: 'Global Travel Report brings you the latest travel news, destination guides, cruise updates, airline insights, and family & business travel stories from around the world.',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com',
  },
  openGraph: {
    title: 'Global Travel Report - Latest Travel News, Destination Guides & Cruise Updates',
    description: 'Global Travel Report brings you the latest travel news, destination guides, cruise updates, airline insights, and family & business travel stories from around the world.',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com',
    siteName: 'Global Travel Report',
    images: [
      {
        url: '/og/home-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'Global Travel Report - Latest Travel News, Destination Guides & Cruise Updates',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@globaltravelreport',
    creator: '@globaltravelreport',
    title: 'Global Travel Report - Latest Travel News, Destination Guides & Cruise Updates',
    description: 'Global Travel Report brings you the latest travel news, destination guides, cruise updates, airline insights, and family & business travel stories from around the world.',
    images: ['/og/home-1200x630.jpg'],
  },
  // LinkedIn uses Open Graph tags but we can add LinkedIn-specific optimization
  other: {
    'linkedin:owner': 'https://www.linkedin.com/company/globaltravelreport',
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
  // Debug environment variables
  const debugInfo = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NODE_ENV: process.env.NODE_ENV,
  };

  return (
    <div className="min-h-screen">
      {/* Debug Info - Remove after fixing */}
      <div className="bg-yellow-100 p-4 text-xs">
        <strong>Debug Info:</strong>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>

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