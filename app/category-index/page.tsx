import { Metadata } from 'next';
import CategoryGrid from '@/src/components/CategoryGrid';

export const metadata: Metadata = {
  title: 'Travel Categories - Global Travel Report',
  description: 'Explore our comprehensive collection of travel categories. Find stories about cruises, airlines, hotels, destinations, food & dining, adventure, culture, and more.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/category-index`,
  },
  openGraph: {
    title: 'Travel Categories - Global Travel Report',
    description: 'Explore our comprehensive collection of travel categories. Find stories about cruises, airlines, hotels, destinations, food & dining, adventure, culture, and more.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/category-index`,
    siteName: 'Global Travel Report',
    images: [
      {
        url: '/og/home-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'Travel Categories - Global Travel Report',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@globaltravelreport',
    creator: '@globaltravelreport',
    title: 'Travel Categories - Global Travel Report',
    description: 'Explore our comprehensive collection of travel categories. Find stories about cruises, airlines, hotels, destinations, food & dining, adventure, culture, and more.',
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
  keywords: ['travel categories', 'travel guides', 'destination guides', 'travel tips', 'travel inspiration', 'travel blog'],
};

export default function CategoryIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            Explore by Category
          </h1>
          <p className="text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
            Discover amazing travel stories, tips, and guides organized by your favorite categories
          </p>
        </div>
      </section>

      {/* Categories Grid - Client Component */}
      <CategoryGrid />
    </div>
  );
}
