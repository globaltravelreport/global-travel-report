import { getAllStories, getHomepageStories } from '@/src/utils/stories';
import Hero from '@/components/Hero';
import { StoryCard } from '@/src/components/stories/StoryCard';
import { NewsletterSignup } from '../components/NewsletterSignup';
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from 'react';
import { PopularStories } from '@/components/recommendations/PopularStories';
import { getFeaturedCategories } from '@/src/config/categories';
import WebsiteSchema from '@/components/WebsiteSchema';

export const metadata: Metadata = {
  title: "Global Travel Report - Travel Stories from Around the World",
  description: "Discover amazing travel stories and share your own adventures with travelers worldwide.",
  openGraph: {
    title: "Global Travel Report - Travel Stories from Around the World",
    description: "Discover amazing travel stories and share your own adventures with travelers worldwide.",
    type: "website",
    locale: "en_US",
    siteName: "Global Travel Report",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Travel Report - Travel Stories from Around the World",
    description: "Discover amazing travel stories and share your own adventures with travelers worldwide.",
  },
};

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const allStories = await getAllStories();
  const homepageStoriesResult = getHomepageStories(allStories);
  const activeStories = homepageStoriesResult.data;
  const featuredStories = activeStories.filter(story => story.featured);
  const latestStories = activeStories
    .filter(story => !story.featured)
    .sort((a, b) => {
      const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
      const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
      return dateB.getTime() - dateA.getTime();
    });

  if (allStories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-24 bg-gradient-to-br from-blue-50 to-blue-100">
        <h1 className="text-5xl font-bold text-blue-700 mb-6 drop-shadow">Welcome to Global Travel Report</h1>
        <p className="text-xl text-blue-900 mb-8 max-w-2xl">
          Your destination for inspiring travel stories, tips, and guides from around the world. <br />
          We're working hard to bring you amazing content. Stay tuned!
        </p>
        <span className="inline-block bg-blue-200 text-blue-800 px-6 py-2 rounded-full font-semibold text-lg mb-8 animate-pulse">
          Coming Soon
        </span>
        <Link href="/about" className="text-blue-600 underline hover:text-blue-800 font-medium">Learn more about us</Link>
      </div>
    );
  }

  return (
    <>
      {/* Add structured data for SEO */}
      <WebsiteSchema />

      <Hero />

      {/* Featured Stories */}
      {featuredStories.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
                <span className="relative z-10">Featured Stories</span>
                <span className="absolute bottom-0 left-0 w-full h-3 bg-[#C9A14A]/20 -z-10 transform -rotate-1"></span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Discover our handpicked selection of the most inspiring travel stories from around the globe</p>
            </div>
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
              ))}
            </div>}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </Suspense>
          </div>
        </section>
      )}

      {/* Latest Stories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="mb-4 md:mb-0">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
                <span className="relative z-10">Latest Stories</span>
                <span className="absolute bottom-0 left-0 w-full h-3 bg-[#C9A14A]/20 -z-10 transform -rotate-1"></span>
              </h2>
              <p className="text-gray-600 max-w-2xl">Stay up to date with our most recent travel insights and adventures</p>
            </div>
            <Link
              href="/stories"
              className="group bg-white hover:bg-[#C9A14A]/10 text-[#C9A14A] font-medium py-2.5 px-5 rounded-lg border border-[#C9A14A] transition-all duration-300 flex items-center gap-2 hover:shadow-md"
            >
              View All Stories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-80"></div>
            ))}
          </div>}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </Suspense>
        </div>
      </section>

      {/* Popular Stories Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
              ))}
            </div>
          </div>}>
            <PopularStories limit={6} title="Popular This Week" />
          </Suspense>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
              <span className="relative z-10">Explore by Category</span>
              <span className="absolute bottom-0 left-0 w-full h-3 bg-[#C9A14A]/20 -z-10 transform -rotate-1"></span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover travel stories organized by your favorite categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {getFeaturedCategories().slice(0, 8).map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 group hover:translate-y-[-4px] border border-gray-100 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A14A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-500">{category.icon}</span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{category.description}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 bg-white hover:bg-[#C9A14A]/10 text-[#C9A14A] font-medium py-2.5 px-5 rounded-lg border border-[#C9A14A] transition-all duration-300 hover:shadow-md"
            >
              View All Categories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSignup />
    </>
  );
}