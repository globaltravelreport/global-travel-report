import { getStories, getHomepageStories } from '@/lib/stories';
import Hero from '@/components/Hero';
import { StoryCard } from '@/components/stories/StoryCard';
import { NewsletterSignup } from '../components/NewsletterSignup';
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from 'react';

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
  const allStories = await getStories();
  const activeStories = await getHomepageStories(allStories);
  const featuredStories = activeStories.filter(story => story.featured);
  const latestStories = activeStories
    .filter(story => !story.featured)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

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
      <Hero />
      
      {/* Featured Stories */}
      {featuredStories.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Stories</h2>
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
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Latest Stories</h2>
            <Link 
              href="/stories" 
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
            >
              View All Stories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Explore by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Hotels', icon: '🏨' },
              { name: 'Airlines', icon: '✈️' },
              { name: 'Cruises', icon: '🚢' },
              { name: 'Destinations', icon: '🌍' }
            ].map((category) => (
              <a
                key={category.name}
                href={`/categories/${category.name.toLowerCase()}`}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow group"
              >
                <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{category.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSignup />
    </>
  );
} 