import Hero from '../src/components/home/Hero';
import StoriesSection from '../src/components/home/StoriesSection';
import { getAllStories, getHomepageStories } from '../src/utils/stories';
import type { Metadata } from 'next';
import type { Story } from '../types/Story';

// The homepage is a live newsroom index. It must read the same current Supabase
// data as the individual story routes and sitemap instead of serving a stale
// render after a new story has been published.
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: {
    absolute: 'Global Travel Report',
  },
  description: 'Independent travel news for Australian travellers, covering air travel, cruise, accommodation, destinations, deals, safety and travel technology.',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com',
  },
  openGraph: {
    title: 'Global Travel Report',
    description: 'Air travel, cruise, accommodation, destinations, deals, safety and travel technology in one independent travel newsroom.',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com',
    siteName: 'Global Travel Report',
    images: [
      {
        url: '/og/facebook-home-20260509',
        width: 1200,
        height: 630,
        alt: 'Global Travel Report social preview',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@globaltravelreport',
    creator: '@globaltravelreport',
    title: 'Global Travel Report',
    description: 'Air travel, cruise, accommodation, destinations, deals, safety and travel technology in one independent travel newsroom.',
    images: ['/og/facebook-home-20260509'],
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
  keywords: ['travel news', 'air travel', 'cruise', 'accommodation', 'destinations', 'travel deals', 'travel safety', 'travel technology'],
};

function getHomepageStorySet(allStories: Story[]): Story[] {
  const homepageStories = getHomepageStories(allStories, { page: 1, limit: 8 }).data;

  if (homepageStories.length > 0) {
    return homepageStories;
  }

  return [...allStories]
    .sort((a, b) => new Date(b.publishedAt || '').getTime() - new Date(a.publishedAt || '').getTime())
    .slice(0, 8);
}

export default async function Home() {
  const stories = getHomepageStorySet(await getAllStories());

  return (
    <div className="min-h-screen">
      {/* Hero Section with Featured Story */}
      <Hero stories={stories} />

      {/* Stories Section */}
      <StoriesSection initialStories={stories} />

      {/* Quick Links Section */}
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-24 lg:px-8">
        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:grid-cols-3">
          <a href="/categories" className="group border-b border-gray-200 p-6 transition-colors hover:bg-[#F8F5EC] sm:border-b-0 sm:border-r">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8A6A20]">Browse</p>
            <h3 className="mb-2 text-lg font-bold text-[#19273A] group-hover:text-[#8A6A20]">Explore Categories</h3>
            <p className="text-sm leading-6 text-gray-600">Find travel stories by theme, from air travel and cruise to deals and safety.</p>
          </a>
          <a href="/destinations" className="group border-b border-gray-200 p-6 transition-colors hover:bg-[#F8F5EC] sm:border-b-0 sm:border-r">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8A6A20]">Plan</p>
            <h3 className="mb-2 text-lg font-bold text-[#19273A] group-hover:text-[#8A6A20]">Destinations</h3>
            <p className="text-sm leading-6 text-gray-600">Scan destination coverage and practical context for Australian travellers.</p>
          </a>
          <a href="/search" className="group p-6 transition-colors hover:bg-[#F8F5EC]">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8A6A20]">Find</p>
            <h3 className="mb-2 text-lg font-bold text-[#19273A] group-hover:text-[#8A6A20]">Search</h3>
            <p className="text-sm leading-6 text-gray-600">Look up specific airlines, cruise lines, countries, offers, or travel topics.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
