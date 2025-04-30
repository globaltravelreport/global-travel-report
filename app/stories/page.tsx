'use client';

import { useState, useEffect } from 'react';
import { getStories, isStoryArchived } from '@/lib/stories';
import { StoryCard } from '@/components/stories/StoryCard';
import type { Story } from '@/lib/stories';

const categories = [
  'All',
  'Hotels',
  'Airlines',
  'Cruises',
  'Destinations',
  'Travel Tips',
  'Food & Dining',
  'Adventure',
  'Culture',
  'Nature',
];

export default function StoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showArchived, setShowArchived] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await getStories();
        setStories(data);
      } catch (error) {
        // Error handled silently in UI by showing empty state
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  const filteredStories = stories.filter(story => {
    const matchesCategory = selectedCategory === 'All' || story.category === selectedCategory;
    const matchesArchiveStatus = showArchived ? isStoryArchived(story) : !isStoryArchived(story);
    return matchesCategory && matchesArchiveStatus;
  });

  const featuredStories = filteredStories.filter(story => story.featured);
  const latestStories = filteredStories
    .filter(story => !story.featured)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C9A14A]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-12 space-y-6">
          {/* Category Filter */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#C9A14A] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Archive Filter */}
          <div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                showArchived
                  ? 'bg-[#C9A14A] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showArchived ? 'Showing Archived Stories' : 'Show Archived Stories'}
            </button>
          </div>
        </div>

        {/* Featured Stories Section */}
        {!showArchived && featuredStories.length > 0 && (
          <section aria-labelledby="featured-stories-heading" className="mb-12">
            <h2 id="featured-stories-heading" className="text-3xl font-bold text-gray-900 mb-8">
              Featured Stories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </section>
        )}

        {/* Latest/Archived Stories Section */}
        <section aria-labelledby="stories-heading">
          <h2 id="stories-heading" className="text-3xl font-bold text-gray-900 mb-8">
            {showArchived
              ? `Archived ${selectedCategory === 'All' ? '' : selectedCategory} Stories`
              : `${selectedCategory === 'All' ? 'Latest' : selectedCategory} Stories`}
          </h2>
          {latestStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              No {showArchived ? 'archived ' : ''}stories found in this category.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}