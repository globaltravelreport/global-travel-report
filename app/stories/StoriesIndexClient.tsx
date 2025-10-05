'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StoryDatabase } from '@/src/services/storyDatabase';
import { Story } from '@/types/Story';

export default function StoriesIndexClient() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const storiesPerPage = 9;

  useEffect(() => {
    const loadStories = async () => {
      try {
        const storyDb = StoryDatabase.getInstance();
        const allStories = await storyDb.getAllStories();
        setStories(allStories);
      } catch (_error) {
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
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A14A]"></div>
        <span className="ml-3 text-gray-600">Loading stories...</span>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Stories Available</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We're currently working on adding new travel stories to our collection.
              Please check back soon for inspiring content from around the world.
            </p>
            <div className="space-y-4">
              <p className="text-gray-500">
                In the meantime, you can:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/submit"
                  className="inline-flex items-center px-6 py-3 bg-[#C9A14A] hover:bg-[#B89038] text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Submit Your Story
                </a>
                <a
                  href="/destinations"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                >
                  Explore Destinations
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get hero stories (featured or editor's pick) - only real content
  const heroStories = stories
    .filter(story => (story.editorsPick || story.featured) && story.content && story.content.length > 100)
    .slice(0, 2);

  // Get regular stories with pagination
  const allRegularStories = stories.filter(story => !story.editorsPick && !story.featured && story.content && story.content.length > 100);
  const totalPages = Math.ceil(allRegularStories.length / storiesPerPage);
  const startIndex = (currentPage - 1) * storiesPerPage;
  const paginatedStories = allRegularStories.slice(startIndex, startIndex + storiesPerPage);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Stories Section */}
      {heroStories.length > 0 && (
        <section className="bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Stories
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our handpicked selection of the most inspiring travel stories and guides
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              {heroStories.map((story, index) => (
                <article key={story.id} className="group">
                  <Link href={`/stories/${story.slug}`} className="block">
                    <div className="relative h-80 md:h-96 overflow-hidden rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-500">
                      <Image
                        src={story.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=1200&h=600'}
                        alt={story.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority={index === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-3">
                          {story.editorsPick && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#C9A14A] text-white">
                              Editor's Pick
                            </span>
                          )}
                          {story.featured && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                              Featured
                            </span>
                          )}
                        </div>

                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-[#C9A14A] transition-colors duration-300">
                          {story.title}
                        </h3>

                        <p className="text-gray-200 text-sm md:text-base leading-relaxed mb-4 line-clamp-3">
                          {story.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-300">
                            <span>By {story.author}</span>
                            {story.country && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{story.country}</span>
                              </>
                            )}
                          </div>
                          <div className="text-[#C9A14A] group-hover:translate-x-1 transition-transform duration-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Stories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our complete collection of travel stories, guides, and insights
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {paginatedStories.map((story) => (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium border ${
                      pageNum === currentPage
                        ? 'text-blue-600 bg-blue-50 border-blue-300'
                        : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Newsletter Signup CTA */}
      <section className="bg-gradient-to-r from-[#C9A14A]/10 to-[#B89038]/10 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Never Miss a Story
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest travel stories, exclusive deals, and insider tips delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C9A14A] focus:border-transparent outline-none"
            />
            <button className="px-6 py-3 bg-[#C9A14A] hover:bg-[#B89038] text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}