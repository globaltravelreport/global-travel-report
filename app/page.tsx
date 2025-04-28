import { getStories } from '@/lib/stories';
import Hero from '@/components/home/Hero';
import { StoryCard } from '@/components/stories/StoryCard';
import { StorySearch } from "@/components/stories/StorySearch";
import Link from "next/link";
import type { Story } from "@/lib/stories";
import type { Metadata } from "next";

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
  const stories = await getStories();
  const featuredStories = stories.filter(story => story.featured);
  const latestStories = stories
    .filter(story => !story.featured)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, 8);

  return (
    <div>
      <Hero />
      
      {/* Featured Stories */}
      {featuredStories.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredStories.map((story) => (
                <StoryCard key={story.id} story={story} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Stories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Explore by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Hotels', 'Airlines', 'Cruises', 'Destinations'].map((category) => (
              <a
                key={category}
                href={`/categories/${category.toLowerCase()}`}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay Updated with Travel News
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Subscribe to our newsletter for the latest travel stories and updates.
            </p>
            <form className="max-w-md mx-auto">
              <div className="flex gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
} 