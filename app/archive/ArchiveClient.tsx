'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllStories, getStoriesByMonth } from '../../src/utils/stories.ts';
import { Story } from '../../types/Story.ts';

type DateRange = '7' | '30' | '180' | '365' | 'all';

export default function ArchiveClient() {
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>('30');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'monthly'>('grid');

  const storiesPerPage = 12;

  useEffect(() => {
    const loadStories = async () => {
      try {
        setLoading(true);
        const allStories = await getAllStories();

        // Validate that we got stories and they have the expected structure
        if (Array.isArray(allStories) && allStories.length > 0) {
          setStories(allStories);
          setFilteredStories(allStories);
        } else {
          console.warn('No stories found or invalid data structure');
          setStories([]);
          setFilteredStories([]);
        }
      } catch (_error) {
        console.error('Error loading stories:', error);
        setStories([]);
        setFilteredStories([]);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, []);

  useEffect(() => {
    let filtered = stories;

    // Filter by date range - show stories older than the selected range (archived stories)
    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      filtered = filtered.filter(story => {
        const storyDate = new Date(story.publishedAt || '');
        // Only include stories older than the cutoff date (archived stories)
        return !isNaN(storyDate.getTime()) && storyDate < cutoffDate;
      });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(story =>
        story.category && story.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by country
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(story =>
        story.country && story.country.toLowerCase() === selectedCountry.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(story =>
        (story.title && story.title.toLowerCase().includes(query)) ||
        (story.excerpt && story.excerpt.toLowerCase().includes(query)) ||
        (story.content && story.content.toLowerCase().includes(query)) ||
        (story.tags && story.tags.some(tag => tag.toLowerCase().includes(query))) ||
        (story.author && story.author.toLowerCase().includes(query))
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.publishedAt || '');
      const dateB = new Date(b.publishedAt || '');
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredStories(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [stories, selectedCategory, selectedCountry, dateRange, searchQuery]);

  // Get unique categories and countries for filters
  const categories = Array.from(new Set(stories.map(s => s.category).filter(Boolean))).sort();
  const countries = Array.from(new Set(stories.map(s => s.country).filter(Boolean))).sort();

  // Pagination
  const totalPages = Math.ceil(filteredStories.length / storiesPerPage);
  const startIndex = (currentPage - 1) * storiesPerPage;
  const paginatedStories = filteredStories.slice(startIndex, startIndex + storiesPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A14A]"></div>
        <span className="ml-3 text-gray-600">Loading archive...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <nav aria-label="Breadcrumb" className="flex items-center text-sm text-gray-600 mb-8">
          <ol className="flex items-center">
            <li>
              <a href="/" className="hover:text-[#C9A14A] transition-colors">Home</a>
            </li>
            <li className="flex items-center mx-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <span className="text-gray-900 font-medium">Archive</span>
            </li>
          </ol>
        </nav>
      </div>

      {/* Header */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Travel Stories Archive
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our complete collection of travel stories, destination guides, and insider tips from the past year and beyond
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#C9A14A] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'monthly'
                    ? 'bg-[#C9A14A] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Monthly View
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {filteredStories.length} stories found
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Date Range Filter */}
              <div>
                <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  id="dateRange"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as DateRange)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:border-transparent"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="180">Last 6 months</option>
                  <option value="365">Last year</option>
                  <option value="all">All time</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  id="country"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:border-transparent"
                >
                  <option value="all">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="lg:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Archive
                </label>
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stories..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Summary */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {paginatedStories.length} of {filteredStories.length} archived stories
          </p>
          <Link
            href="/stories"
            className="text-[#C9A14A] hover:text-[#B89038] font-medium"
          >
            View Recent Stories →
          </Link>
        </div>

        {/* Monthly View */}
        {viewMode === 'monthly' && filteredStories.length > 0 && (
          <div className="space-y-8 mb-12">
            {Object.entries(getStoriesByMonth(filteredStories)).map(([monthKey, monthStories]) => {
              const [year, month] = monthKey.split('-');
              const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
              });
              const stories = monthStories as Story[];

              return (
                <div key={monthKey} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {monthName} ({stories.length} stories)
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {stories.map((story) => (
                        <article key={`monthly-${story.id}`} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <Link href={`/stories/${story.slug}`}>
                            <div className="relative h-32 overflow-hidden">
                              <Image
                                src={story.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=400&h=300'}
                                alt={story.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <div className="absolute top-2 left-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800">
                                  {story.category}
                                </span>
                              </div>
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{story.title}</h4>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{story.excerpt}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>By {story.author}</span>
                                <time dateTime={new Date(story.publishedAt).toISOString()}>
                                  {new Date(story.publishedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </time>
                              </div>
                            </div>
                          </Link>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stories Grid */}
        {viewMode === 'grid' && paginatedStories.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">No archived stories found</h2>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search terms.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedCountry('all');
                setDateRange('all');
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-[#C9A14A] hover:bg-[#B89038] text-white font-medium rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
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

                      {/* Archived Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-600 text-white">
                          Archived
                        </span>
                      </div>
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
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
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
                      );
                    })}
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
          </>
        )}
      </section>
    </div>
  );
}