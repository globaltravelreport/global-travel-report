'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/src/hooks/useDebounce';
import { cn } from '@/src/utils/cn';
import { Story } from '@/types/Story';
import Link from 'next/link';

interface EnhancedSearchBarProps {
  className?: string;
  placeholder?: string;
  stories?: Story[];
  popularSearches?: string[];
  onSearch?: (query: string) => void;
  variant?: 'default' | 'minimal' | 'expanded';
  maxSuggestions?: number;
}

export function EnhancedSearchBar({
  className,
  placeholder = 'Search for travel stories...',
  stories = [],
  popularSearches = ['Cruise destinations', 'European travel', 'Beach vacations', 'Adventure travel', 'Travel tips'],
  onSearch,
  variant = 'default',
  maxSuggestions = 5,
}: EnhancedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Story[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    const storedSearches = localStorage.getItem('recentSearches');
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches).slice(0, 5));
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    const storedSearches = localStorage.getItem('recentSearches');
    let searches = storedSearches ? JSON.parse(storedSearches) : [];
    
    // Remove the search term if it already exists
    searches = searches.filter((s: string) => s !== searchTerm);
    
    // Add the new search term at the beginning
    searches.unshift(searchTerm);
    
    // Limit to 5 recent searches
    searches = searches.slice(0, 5);
    
    localStorage.setItem('recentSearches', JSON.stringify(searches));
    setRecentSearches(searches);
  }, []);

  // Handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions when the debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Simulate a delay to show loading state
    const timer = setTimeout(() => {
      const filteredStories = stories.filter((story) =>
        story.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        story.excerpt.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        story.category.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        story.tags.some(tag => tag.toLowerCase().includes(debouncedQuery.toLowerCase()))
      );

      setSuggestions(filteredStories.slice(0, maxSuggestions));
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedQuery, stories, maxSuggestions]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    saveRecentSearch(query);
    
    if (onSearch) {
      onSearch(query);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
    
    setIsOpen(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (story: Story) => {
    saveRecentSearch(story.title);
    router.push(`/stories/${story.slug}`);
    setIsOpen(false);
  };

  // Handle recent search click
  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    saveRecentSearch(searchTerm);
    
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
    
    setIsOpen(false);
  };

  // Handle popular search click
  const handlePopularSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    saveRecentSearch(searchTerm);
    
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
    
    setIsOpen(false);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  // Clear current search
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
  };

  // Render minimal variant
  if (variant === 'minimal') {
    return (
      <div className={cn("relative", className)} ref={searchRef}>
        <form onSubmit={handleSubmit} className="relative">
          <Input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            placeholder={placeholder}
            className="w-full pl-9 pr-9"
            onFocus={() => setIsOpen(true)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {isOpen && (query.length >= 2 || recentSearches.length > 0) && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-5 w-4/5" />
              </div>
            ) : (
              <>
                {suggestions.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 py-1 text-xs font-medium text-gray-500 uppercase">Suggestions</div>
                    {suggestions.map((story) => (
                      <button
                        key={story.id}
                        onClick={() => handleSuggestionClick(story)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      >
                        <div className="font-medium text-gray-900">{story.title}</div>
                        <div className="text-xs text-gray-500">{story.category}</div>
                      </button>
                    ))}
                  </div>
                )}

                {recentSearches.length > 0 && (
                  <div className="py-2 border-t border-gray-100">
                    <div className="px-4 py-1 text-xs font-medium text-gray-500 uppercase flex justify-between items-center">
                      <span>Recent Searches</span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(search)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex items-center"
                      >
                        <Clock className="h-3 w-3 mr-2 text-gray-400" />
                        <span className="text-gray-700">{search}</span>
                      </button>
                    ))}
                  </div>
                )}

                {query.length >= 2 && suggestions.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No results found for "{query}"
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // Render expanded variant (for search page)
  if (variant === 'expanded') {
    // Implementation for expanded variant
    // This would be a more comprehensive search interface
    // with additional filters and options
  }

  // Default variant
  return (
    <div className={cn("relative", className)} ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10"
          onFocus={() => setIsOpen(true)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </form>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-6 w-4/5" />
            </div>
          ) : (
            <>
              {suggestions.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1 text-xs font-medium text-gray-500 uppercase">Suggestions</div>
                  {suggestions.map((story) => (
                    <button
                      key={story.id}
                      onClick={() => handleSuggestionClick(story)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    >
                      <div className="font-medium text-gray-900">{story.title}</div>
                      <div className="text-sm text-gray-500">{story.category}</div>
                    </button>
                  ))}
                </div>
              )}

              {recentSearches.length > 0 && (
                <div className="py-2 border-t border-gray-100">
                  <div className="px-4 py-1 text-xs font-medium text-gray-500 uppercase flex justify-between items-center">
                    <span>Recent Searches</span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(search)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex items-center"
                    >
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {popularSearches.length > 0 && (
                <div className="py-2 border-t border-gray-100">
                  <div className="px-4 py-1 text-xs font-medium text-gray-500 uppercase">Popular Searches</div>
                  <div className="px-4 py-2 flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handlePopularSearchClick(search)}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-sm text-gray-700"
                      >
                        <TrendingUp className="h-3 w-3 mr-1 text-gray-500" />
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query.length >= 2 && suggestions.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No results found for "{query}"
                </div>
              )}

              <div className="p-2 border-t border-gray-100">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="flex items-center justify-center w-full px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  onClick={(e) => {
                    if (!query.trim()) e.preventDefault();
                    else saveRecentSearch(query);
                  }}
                >
                  <span>View all results</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
