import React from 'react';
import { Metadata } from 'next';
import { getStories, searchStories, StorySearchParams } from '@/lib/stories';
import { SearchForm } from '@/src/components/search/SearchForm';
import { StoryCard } from '@/src/components/stories/StoryCard';
import { Pagination } from '@/src/components/ui/Pagination';
import { mockCategories, mockCountries, mockTags } from '@/src/mocks/stories';

// Generate metadata for the search page
export const metadata: Metadata = {
  title: 'Search Stories | Global Travel Report',
  description: 'Search for travel stories, guides, and insights from around the world.',
};

// Define search page props
interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    country?: string;
    tag?: string;
    author?: string;
    from?: string;
    to?: string;
    featured?: string;
    editors_pick?: string;
    page?: string;
    limit?: string;
  };
}

// Default page size
const DEFAULT_PAGE_SIZE = 12;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Parse search parameters
  const query = searchParams.q || '';
  const category = searchParams.category || '';
  const country = searchParams.country || '';
  const tag = searchParams.tag || '';
  const author = searchParams.author || '';
  const fromDate = searchParams.from ? new Date(searchParams.from) : undefined;
  const toDate = searchParams.to ? new Date(searchParams.to) : undefined;
  const featured = searchParams.featured === 'true' ? true : undefined;
  const editorsPick = searchParams.editors_pick === 'true' ? true : undefined;
  const page = parseInt(searchParams.page || '1', 10);
  const limit = parseInt(searchParams.limit || String(DEFAULT_PAGE_SIZE), 10);
  
  // Get all stories
  const stories = await getStories();
  
  // Create search params object
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
  
  // Search stories with pagination
  const results = searchStories(stories, searchParams2, { page, limit });
  
  // Get unique authors from stories
  const authors = [...new Set(stories.map(story => story.author))];
  
  // Check if there are any search parameters
  const hasSearchParams = Object.values(searchParams2).some(value => 
    value !== undefined && value !== '' && 
    !(Array.isArray(value) && value.length === 0)
  );
  
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
              {query && ` for "${query}"`}
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
          additionalParams={{
            ...(query && { q: query }),
            ...(category && { category }),
            ...(country && { country }),
            ...(tag && { tag }),
            ...(author && { author }),
            ...(fromDate && { from: fromDate.toISOString().split('T')[0] }),
            ...(toDate && { to: toDate.toISOString().split('T')[0] }),
            ...(featured !== undefined && { featured: String(featured) }),
            ...(editorsPick !== undefined && { editors_pick: String(editorsPick) }),
          }}
        />
      )}
    </div>
  );
}
