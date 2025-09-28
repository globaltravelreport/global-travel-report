'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllStories, getHomepageStories } from '@/src/utils/stories';
import { Story } from '@/types/Story';
import { MostViewedThisWeek } from '@/src/components/engagement/MostViewedThisWeek';
import { TrendingDestinations } from '@/src/components/engagement/TrendingDestinations';

export default function StoriesSection() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStories = async () => {
      try {
        const allStories = await getAllStories();
        setStories(allStories);
      } catch (error) {
        console.error('Error loading stories:', error);
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A14A]"></div>
          <span className="ml-3 text-gray-600">Loading stories...</span>
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">No stories available</h2>
          <p className="text-gray-600">
            We're working on adding more travel stories. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  // Get homepage stories (non-archived, paginated)
  const homepageResult = getHomepageStories(stories);
  const recentStories = homepageResult?.data || [];

  if (recentStories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">No stories available</h2>
          <p className="text-gray-600">
            We're working on adding more travel stories. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Latest Travel Stories
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover inspiring travel stories, destination guides, and insider tips from around the world
        </p>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
        {recentStories.map((story) => (
          <article key={story.id} className="group card hover:shadow-xl overflow-hidden">
            <Link href={`/stories/${story.slug}`}>
              {/* Story Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={story.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=800&h=600'}
                  alt={story.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Category Badge */}
                {story.category && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 backdrop-blur-sm">
                      {story.category}
                    </span>
                  </div>
                )}

                {/* Featured/Editor's Pick Badge */}
                {(story.featured || story.editorsPick) && (
                  <div className="absolute top-3 right-3">
                    {story.editorsPick && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#C9A14A] text-white">
                        Editor's Pick
                      </span>
                    )}
                    {story.featured && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                        Featured
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#C9A14A] transition-colors duration-300 leading-tight">
                  {story.title}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {story.excerpt}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>By {story.author}</span>
                  {story.publishedAt && (
                    <time dateTime={new Date(story.publishedAt).toISOString()}>
                      {new Date(story.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </time>
                  )}
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* Engagement Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <MostViewedThisWeek maxItems={5} />
        <TrendingDestinations maxItems={6} />
      </div>

      {/* Navigation CTAs */}
      <div className="text-center space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/stories"
            className="inline-flex items-center px-6 py-3 bg-[#C9A14A] hover:bg-[#B89038] text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2"
          >
            View All Recent Stories
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/archive"
            className="inline-flex items-center px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            Browse Archive
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" />
            </svg>
          </Link>
        </div>
        <p className="text-sm text-gray-500">
          Recent stories: Last 30 days • Archive: Complete collection (12+ months)
        </p>
      </div>
    </div>
  );
}