'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllStories, searchStories } from '@/src/utils/stories';
import { SearchForm } from '@/components/search/SearchForm';
import { StoryCard } from '@/components/stories/StoryCard';
import { Pagination } from '@/src/components/ui/Pagination';
import { mockCategories, mockCountries, mockTags } from '@/src/mocks/stories';
import { Story } from '@/types/Story';
import { StorySearchParams } from '@/types/StorySearchParams';

const DEFAULT_PAGE_SIZE = 12;

function SearchResults() {
  const searchParams = useSearchParams();
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<string[]>([]);

  useEffect(() => {
    const loadStories = async () => {
      try {
        setLoading(true);
        const allStories = await getAllStories();
        setStories(allStories);
        setAuthors(Array.from(new Set(allStories.map(story => story.author))));

        // Apply search filters
        const searchResult = applySearchFilters(allStories, searchParams);
        setFilteredStories(searchResult.data);
      } catch (_error) {
        console.error(_error);
        setStories([]);
        setAuthors([]);
        setFilteredStories([]);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, [searchParams]);

  const applySearchFilters = (allStories: Story[], params: URLSearchParams) => {
    const query = params.get('q') || '';
    const category = params.get('category') || '';
    const country = params.get('country') || '';
    const tag = params.get('tag') || '';
    const author = params.get('author') || '';
    const fromDate = params.get('from') ? new Date(params.get('from')!) : undefined;
    const toDate = params.get('to') ? new Date(params.get('to')!) : undefined;
    const featured = params.get('featured') === 'true' ? true : undefined;
    const editorsPick = params.get('editors_pick') === 'true' ? true : undefined;
    const page = parseInt(params.get('page') || '1', 10);
    const limit = parseInt(params.get('limit') || String(DEFAULT_PAGE_SIZE), 10);

    const searchParams2: StorySearchParams = {
      query,
      category,
      country,
      tag,
      author,
      fromDate,
      toDate,
      featured,
      editorsPick,
    };

    return searchStories(allStories, searchParams2, { page, limit });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A14A]"></div>
        <span className="ml-3 text-gray-600">Searching stories...</span>
      </div>
    );
  }

  const hasSearchParams = Array.from(searchParams.entries()).some(([key, value]) =>
    value !== '' && !['page', 'limit'].includes(key)
  );

  const results = {
    data: filteredStories,
    meta: {
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE), 10),
      total: filteredStories.length,
      totalPages: Math.ceil(filteredStories.length / parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE), 10))
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Stories</h1>

      {/* Search form */}
      <div className="mb-8">
        <SearchForm
          categories={mockCategories}
          countries={mockCountries}
          tags={mockTags}
          authors={authors}
          baseUrl="/search"
        />
      </div>

      {/* Search results */}
      <div className="mb-8">
        {hasSearchParams ? (
          <>
            <h2 className="text-xl font-semibold mb-4">
              {results.meta.total} {results.meta.total === 1 ? 'result' : 'results'} found
              {searchParams.get('q') && ` for "${searchParams.get('q')}"`}
            </h2>

            {results.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.data.map(story => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600">No stories found matching your search criteria.</p>
                <p className="mt-2 text-gray-500">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Enter search terms or select filters to find stories.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {results.meta.totalPages > 1 && (
        <Pagination
          meta={results.meta}
          baseUrl="/search"
          additionalParams={Object.fromEntries(searchParams.entries())}
        />
      )}
    </div>
  );
}

export default function SearchPageClient() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A14A]"></div>
        <span className="ml-3 text-gray-600">Loading search...</span>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}