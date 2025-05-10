import { Metadata } from 'next';
import Link from 'next/link';
import { CATEGORIES, getFeaturedCategories, getSubcategories } from '@/src/config/categories';
import { Breadcrumb } from '@/src/components/ui/Breadcrumb';
import { AdSenseLeaderboard } from '@/src/components/ads/AdSense';
import { PopularStories } from '@/components/recommendations/PopularStories';
import { Suspense } from 'react';
import { CategoriesIndexStructuredData } from '@/src/components/seo/CategoriesIndexStructuredData';

export const metadata: Metadata = {
  title: 'Categories - Global Travel Report',
  description: 'Explore travel stories by category. Find articles about cruises, airlines, hotels, destinations, food & dining, adventure, culture, and more.',
  keywords: [
    'travel categories',
    'travel stories',
    'cruises',
    'airlines',
    'hotels',
    'destinations',
    'food and dining',
    'adventure travel',
    'culture travel',
    'travel tips'
  ],
  openGraph: {
    title: 'Categories - Global Travel Report',
    description: 'Explore travel stories by category. Find articles about cruises, airlines, hotels, destinations, food & dining, adventure, culture, and more.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/categories` : 'https://www.globaltravelreport.com/categories',
    siteName: 'Global Travel Report',
    locale: 'en_AU',
    images: [
      {
        url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/images/categories-og.jpg` : 'https://www.globaltravelreport.com/images/categories-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Travel Categories - Global Travel Report',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Categories - Global Travel Report',
    description: 'Explore travel stories by category. Find articles about cruises, airlines, hotels, destinations, food & dining, adventure, culture, and more.',
    creator: '@GTravelReport',
    site: '@GTravelReport',
    images: [process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/images/categories-og.jpg` : 'https://www.globaltravelreport.com/images/categories-og.jpg'],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/categories` : 'https://www.globaltravelreport.com/categories',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function CategoriesPage() {
  // Get all main categories (those without a parent)
  const mainCategories = CATEGORIES.filter(category => !category.parent);

  // Group categories by featured status
  const featuredCategories = mainCategories.filter(category => category.featured);
  const otherCategories = mainCategories.filter(category => !category.featured);

  // Get site URL for structured data
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com';

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add structured data for SEO */}
        <CategoriesIndexStructuredData
          featuredCategories={featuredCategories}
          otherCategories={otherCategories}
          siteUrl={siteUrl}
        />

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Categories', active: true }
          ]}
          className="mb-8"
        />

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            <span className="relative z-10">Explore by Category</span>
            <span className="absolute bottom-0 left-0 w-full h-3 bg-[#C9A14A]/20 -z-10 transform -rotate-1"></span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover travel stories organized by your favorite categories
          </p>
        </div>

        {/* Featured Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
          {featuredCategories.map((category) => {
            // Get subcategories for this category
            const subcategories = getSubcategories(category.slug);

            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 group hover:translate-y-[-4px] border border-gray-100 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A14A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-500">{category.icon}</span>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h2>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{category.description}</p>

                {/* Show subcategories if any */}
                {subcategories.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {subcategories.slice(0, 2).map(subcat => (
                      <span key={subcat.slug} className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {subcat.name}
                      </span>
                    ))}
                    {subcategories.length > 2 && (
                      <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        +{subcategories.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* AdSense Leaderboard */}
        <div className="mb-16">
          <AdSenseLeaderboard />
        </div>

        {/* Other Categories */}
        {otherCategories.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">More Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {otherCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300 flex items-center gap-3 border border-gray-100"
                >
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Popular Stories Section */}
        <div className="mb-16">
          <Suspense fallback={<div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
              ))}
            </div>
          </div>}>
            <PopularStories limit={3} title="Popular Stories" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
