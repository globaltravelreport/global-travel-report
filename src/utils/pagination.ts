/**
 * Pagination utilities for handling large datasets
 *
 * This file contains utility functions for paginating data in the Global Travel Report.
 *
 * Usage examples:
 *
 * 1. Paginate an array of items:
 *    ```typescript
 *    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 *    const result = paginate(items, { page: 1, limit: 5 });
 *    // result.data = [1, 2, 3, 4, 5]
 *    // result.pagination = { page: 1, limit: 5, total: 10, totalPages: 2, ... }
 *    ```
 *
 * 2. Generate pagination links:
 *    ```typescript
 *    const links = generatePaginationLinks('/stories', result.pagination);
 *    // links = { first: '/stories?page=1', prev: null, current: '/stories?page=1', ... }
 *    ```
 *
 * 3. Filter and paginate stories:
 *    ```typescript
 *    const result = paginatedStoryFilter(stories, story => story.featured, { page: 1, limit: 10 });
 *    // Returns paginated featured stories
 *    ```
 */

import { Story } from '@/types/Story';

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
}

/**
 * Pagination result
 */
export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Paginate an array of items
 * @param items - The array to paginate
 * @param options - Pagination options
 * @returns Paginated result
 */
export function paginate<T>(
  items: T[],
  options: PaginationOptions
): PaginationResult<T> {
  const { page = 1, limit = 10 } = options;
  const total = options.total || items.length;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const totalPages = Math.ceil(total / limit);
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    data: paginatedItems,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Generate pagination links
 * @param baseUrl - The base URL for pagination links
 * @param meta - Pagination metadata
 * @returns Object with pagination links
 */
export function generatePaginationLinks(
  baseUrl: string,
  pagination: PaginationResult<unknown>['pagination']
): Record<string, string | null> {
  const { page, totalPages } = pagination;

  // Ensure the base URL doesn't have trailing slash
  const url = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  return {
    first: `${url}?page=1`,
    prev: page > 1 ? `${url}?page=${page - 1}` : null,
    current: `${url}?page=${page}`,
    next: page < totalPages ? `${url}?page=${page + 1}` : null,
    last: `${url}?page=${totalPages}`,
  };
}

/**
 * Enhanced story filtering with pagination and lazy loading
 * @param stories - Array of stories to filter
 * @param filterFn - Filter function
 * @param options - Pagination options
 * @returns Paginated and filtered stories
 */
export function paginatedStoryFilter(
  stories: Story[],
  filterFn: (story: Story) => boolean,
  options: PaginationOptions
): PaginationResult<Story> {
  // Apply filter
  const filteredStories = stories.filter(filterFn);

  // Apply pagination
  return paginate(filteredStories, options);
}

/**
 * Create a lazy-loaded story filter
 * @param getStories - Function to get all stories
 * @param filterFn - Filter function
 * @returns Function that returns paginated stories
 */
export function createLazyStoryFilter(
  getStories: () => Promise<Story[]>,
  filterFn: (story: Story) => boolean
): (options: PaginationOptions) => Promise<PaginationResult<Story>> {
  // Cache for filtered stories
  let cachedFilteredStories: Story[] | null = null;

  return async (options: PaginationOptions): Promise<PaginationResult<Story>> => {
    // If we don't have cached filtered stories, get and filter them
    if (!cachedFilteredStories) {
      const stories = await getStories();
      cachedFilteredStories = stories.filter(filterFn);
    }

    // Apply pagination to the filtered stories
    return paginate(cachedFilteredStories, options);
  };
}
