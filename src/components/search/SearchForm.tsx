"use client";

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Filter, Calendar } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/src/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion';
import { Calendar as CalendarComponent } from '@/src/components/ui/calendar';
import { StorySearchParams } from '@/lib/stories';
import { formatDisplayDate } from '@/src/utils/date-utils';
import { cn } from '@/src/lib/utils';

interface SearchFormProps {
  /**
   * Available categories for filtering
   */
  categories?: string[];
  
  /**
   * Available countries for filtering
   */
  countries?: string[];
  
  /**
   * Available tags for filtering
   */
  tags?: string[];
  
  /**
   * Available authors for filtering
   */
  authors?: string[];
  
  /**
   * Base URL for search results
   */
  baseUrl?: string;
  
  /**
   * CSS class for the search form
   */
  className?: string;
  
  /**
   * Callback for search submission
   */
  onSearch?: (params: StorySearchParams) => void;
}

/**
 * Reusable search form component
 */
export function SearchForm({
  categories = [],
  countries = [],
  tags = [],
  authors = [],
  baseUrl = '/search',
  className,
  onSearch,
}: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize search state from URL parameters
  const [searchState, setSearchState] = useState<StorySearchParams>({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    country: searchParams.get('country') || '',
    tag: searchParams.get('tag') || '',
    author: searchParams.get('author') || '',
    fromDate: searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined,
    toDate: searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined,
    featured: searchParams.get('featured') === 'true' ? true : undefined,
    editorsPick: searchParams.get('editors_pick') === 'true' ? true : undefined,
  });
  
  // Track if advanced filters are open
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setSearchState(prev => ({
        ...prev,
        [name]: checked || undefined,
      }));
    } else {
      setSearchState(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setSearchState(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle date change
  const handleDateChange = (name: 'fromDate' | 'toDate', date?: Date) => {
    setSearchState(prev => ({
      ...prev,
      [name]: date,
    }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchState({
      query: searchState.query,
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call the onSearch callback if provided
    if (onSearch) {
      onSearch(searchState);
    }
    
    // Build URL with search parameters
    const url = new URL(baseUrl, window.location.origin);
    
    // Add search parameters
    if (searchState.query) url.searchParams.set('q', searchState.query);
    if (searchState.category) url.searchParams.set('category', searchState.category);
    if (searchState.country) url.searchParams.set('country', searchState.country);
    if (searchState.tag) url.searchParams.set('tag', searchState.tag);
    if (searchState.author) url.searchParams.set('author', searchState.author);
    if (searchState.fromDate) url.searchParams.set('from', searchState.fromDate.toISOString().split('T')[0]);
    if (searchState.toDate) url.searchParams.set('to', searchState.toDate.toISOString().split('T')[0]);
    if (searchState.featured) url.searchParams.set('featured', 'true');
    if (searchState.editorsPick) url.searchParams.set('editors_pick', 'true');
    
    // Navigate to search results page
    router.push(url.pathname + url.search);
  };
  
  // Check if any filters are active
  const hasActiveFilters = useCallback(() => {
    return (
      !!searchState.category ||
      !!searchState.country ||
      !!searchState.tag ||
      !!searchState.author ||
      !!searchState.fromDate ||
      !!searchState.toDate ||
      searchState.featured !== undefined ||
      searchState.editorsPick !== undefined
    );
  }, [searchState]);
  
  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn('space-y-4', className)}
    >
      {/* Main search input */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            name="query"
            placeholder="Search stories..."
            className="pl-9"
            value={searchState.query || ''}
            onChange={handleInputChange}
          />
          {searchState.query && (
            <button
              type="button"
              onClick={() => setSearchState(prev => ({ ...prev, query: '' }))}
              className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <Button type="submit">Search</Button>
        
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button 
              type="button" 
              variant={hasActiveFilters() ? "default" : "outline"}
              size="icon"
              aria-label="Filters"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Filters</h3>
                {hasActiveFilters() && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                  >
                    Clear all
                  </Button>
                )}
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {/* Category filter */}
                {categories.length > 0 && (
                  <AccordionItem value="category">
                    <AccordionTrigger>Category</AccordionTrigger>
                    <AccordionContent>
                      <Select
                        value={searchState.category || ''}
                        onValueChange={(value) => handleSelectChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {/* Country filter */}
                {countries.length > 0 && (
                  <AccordionItem value="country">
                    <AccordionTrigger>Country</AccordionTrigger>
                    <AccordionContent>
                      <Select
                        value={searchState.country || ''}
                        onValueChange={(value) => handleSelectChange('country', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All countries</SelectItem>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {/* Tag filter */}
                {tags.length > 0 && (
                  <AccordionItem value="tag">
                    <AccordionTrigger>Tag</AccordionTrigger>
                    <AccordionContent>
                      <Select
                        value={searchState.tag || ''}
                        onValueChange={(value) => handleSelectChange('tag', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tag" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All tags</SelectItem>
                          {tags.map((tag) => (
                            <SelectItem key={tag} value={tag}>
                              {tag}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {/* Author filter */}
                {authors.length > 0 && (
                  <AccordionItem value="author">
                    <AccordionTrigger>Author</AccordionTrigger>
                    <AccordionContent>
                      <Select
                        value={searchState.author || ''}
                        onValueChange={(value) => handleSelectChange('author', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select author" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All authors</SelectItem>
                          {authors.map((author) => (
                            <SelectItem key={author} value={author}>
                              {author}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {/* Date range filter */}
                <AccordionItem value="date">
                  <AccordionTrigger>Date Range</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="fromDate">From</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="fromDate"
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {searchState.fromDate ? (
                                formatDisplayDate(searchState.fromDate)
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={searchState.fromDate}
                              onSelect={(date) => handleDateChange('fromDate', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="toDate">To</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="toDate"
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {searchState.toDate ? (
                                formatDisplayDate(searchState.toDate)
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={searchState.toDate}
                              onSelect={(date) => handleDateChange('toDate', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Featured and Editor's Pick filters */}
                <AccordionItem value="featured">
                  <AccordionTrigger>Story Type</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="featured"
                          name="featured"
                          checked={searchState.featured === true}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="featured">Featured stories</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="editorsPick"
                          name="editorsPick"
                          checked={searchState.editorsPick === true}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="editorsPick">Editor's picks</Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  onClick={() => setFiltersOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Active filters display */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2">
          {searchState.category && (
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
              <span className="mr-1 text-gray-500">Category:</span>
              <span className="font-medium">{searchState.category}</span>
              <button
                type="button"
                onClick={() => setSearchState(prev => ({ ...prev, category: '' }))}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label="Remove category filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {searchState.country && (
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
              <span className="mr-1 text-gray-500">Country:</span>
              <span className="font-medium">{searchState.country}</span>
              <button
                type="button"
                onClick={() => setSearchState(prev => ({ ...prev, country: '' }))}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label="Remove country filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {searchState.tag && (
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
              <span className="mr-1 text-gray-500">Tag:</span>
              <span className="font-medium">{searchState.tag}</span>
              <button
                type="button"
                onClick={() => setSearchState(prev => ({ ...prev, tag: '' }))}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label="Remove tag filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {searchState.author && (
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
              <span className="mr-1 text-gray-500">Author:</span>
              <span className="font-medium">{searchState.author}</span>
              <button
                type="button"
                onClick={() => setSearchState(prev => ({ ...prev, author: '' }))}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label="Remove author filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {searchState.fromDate && (
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
              <span className="mr-1 text-gray-500">From:</span>
              <span className="font-medium">{formatDisplayDate(searchState.fromDate)}</span>
              <button
                type="button"
                onClick={() => setSearchState(prev => ({ ...prev, fromDate: undefined }))}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label="Remove from date filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {searchState.toDate && (
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
              <span className="mr-1 text-gray-500">To:</span>
              <span className="font-medium">{formatDisplayDate(searchState.toDate)}</span>
              <button
                type="button"
                onClick={() => setSearchState(prev => ({ ...prev, toDate: undefined }))}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label="Remove to date filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {searchState.featured && (
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
              <span className="font-medium">Featured</span>
              <button
                type="button"
                onClick={() => setSearchState(prev => ({ ...prev, featured: undefined }))}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label="Remove featured filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {searchState.editorsPick && (
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
              <span className="font-medium">Editor's Pick</span>
              <button
                type="button"
                onClick={() => setSearchState(prev => ({ ...prev, editorsPick: undefined }))}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label="Remove editor's pick filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-primary hover:text-primary/80"
          >
            Clear all filters
          </button>
        </div>
      )}
    </form>
  );
}
