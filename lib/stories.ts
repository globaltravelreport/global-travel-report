import { Story } from '@/types/Story';
import { mockStories } from '@/src/mocks/stories';
import { memoize, memoizeMultiArg } from '@/src/utils/memoization';
import { isArchived } from '@/src/utils/date-utils';
import {
  paginate,
  PaginationOptions,
  PaginationResult
} from '@/src/utils/pagination';

/**
 * Get all stories
 * @returns A promise resolving to an array of stories
 */
export async function getStories(): Promise<Story[]> {
  // In a real application, this would fetch from a database or API
  return mockStories;
}

/**
 * Check if a story is archived (older than 7 days)
 * @param story - The story to check
 * @returns Boolean indicating if the story is archived
 */
export const isStoryArchived = memoize((story: Story): boolean => {
  return isArchived(story.publishedAt, 7);
});

/**
 * Get stories for the homepage (non-archived, sorted by date)
 * @param stories - Array of stories to filter
 * @param options - Pagination options
 * @returns Paginated array of stories for the homepage
 */
export const getHomepageStories = memoize(
  (stories: Story[], options: PaginationOptions = { page: 1, limit: 8 }): PaginationResult<Story> => {
    // First filter and sort the stories
    const filteredStories = stories
      .filter(story => !isStoryArchived(story))
      .sort((a, b) => {
        const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
        const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      });

    // Then apply pagination
    return paginate(filteredStories, options);
  },
  {
    // Use a custom key generator that includes pagination options but excludes the story content
    // to reduce memory usage in the cache key
    keyGenerator: (args) => {
      const [stories, options] = args;
      return JSON.stringify({
        storyIds: stories.map((s: Story) => s.id),
        options
      });
    },
    // Limit cache size to avoid memory issues with large datasets
    maxCacheSize: 20
  }
);

/**
 * Get archived stories (older than 7 days, sorted by date)
 * @param stories - Array of stories to filter
 * @param options - Pagination options
 * @returns Paginated array of archived stories
 */
export const getArchivedStories = memoize(
  (stories: Story[], options: PaginationOptions = { page: 1, limit: 10 }): PaginationResult<Story> => {
    // First filter and sort the stories
    const filteredStories = stories
      .filter(story => isStoryArchived(story))
      .sort((a, b) => {
        const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
        const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      });

    // Then apply pagination
    return paginate(filteredStories, options);
  },
  {
    // Use a custom key generator that includes pagination options but excludes the story content
    keyGenerator: (args) => {
      const [stories, options] = args;
      return JSON.stringify({
        storyIds: stories.map((s: Story) => s.id),
        options
      });
    },
    maxCacheSize: 20
  }
);

/**
 * Get stories by country
 * @param stories - Array of stories to filter
 * @param country - Country to filter by
 * @param options - Pagination options
 * @returns Paginated array of stories for the specified country
 */
export const getStoriesByCountry = memoizeMultiArg(
  (
    stories: Story[],
    country: string,
    options: PaginationOptions = { page: 1, limit: 10 }
  ): PaginationResult<Story> => {
    // First filter and sort the stories
    const filteredStories = stories
      .filter(story => story.country.toLowerCase() === country.toLowerCase())
      .sort((a, b) => {
        const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
        const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      });

    // Then apply pagination
    return paginate(filteredStories, options);
  },
  {
    // Use a custom key generator that includes pagination options but excludes the story content
    keyGenerator: (args) => {
      const [stories, country, options] = args;
      return JSON.stringify({
        storyIds: stories.map((s: Story) => s.id),
        country,
        options
      });
    },
    maxCacheSize: 30 // Higher cache size for country filters as there may be many countries
  }
);

/**
 * Get stories by category
 * @param stories - Array of stories to filter
 * @param category - Category to filter by
 * @param options - Pagination options
 * @returns Paginated array of stories for the specified category
 */
export const getStoriesByCategory = memoizeMultiArg(
  (
    stories: Story[],
    category: string,
    options: PaginationOptions = { page: 1, limit: 10 }
  ): PaginationResult<Story> => {
    // First filter and sort the stories
    const filteredStories = stories
      .filter(story => story.category.toLowerCase() === category.toLowerCase())
      .sort((a, b) => {
        const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
        const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      });

    // Then apply pagination
    return paginate(filteredStories, options);
  },
  {
    // Use a custom key generator that includes pagination options but excludes the story content
    keyGenerator: (args) => {
      const [stories, category, options] = args;
      return JSON.stringify({
        storyIds: stories.map((s: Story) => s.id),
        category,
        options
      });
    },
    maxCacheSize: 30 // Higher cache size for category filters as there may be many categories
  }
);

/**
 * Get stories by tag
 * @param stories - Array of stories to filter
 * @param tag - Tag to filter by
 * @param options - Pagination options
 * @returns Paginated array of stories for the specified tag
 */
export const getStoriesByTag = memoizeMultiArg(
  (
    stories: Story[],
    tag: string,
    options: PaginationOptions = { page: 1, limit: 10 }
  ): PaginationResult<Story> => {
    // First filter and sort the stories
    const filteredStories = stories
      .filter(story => story.tags.some(t => t.toLowerCase() === tag.toLowerCase()))
      .sort((a, b) => {
        const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
        const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      });

    // Then apply pagination
    return paginate(filteredStories, options);
  },
  {
    keyGenerator: (args) => {
      const [stories, tag, options] = args;
      return JSON.stringify({
        storyIds: stories.map((s: Story) => s.id),
        tag,
        options
      });
    },
    maxCacheSize: 50 // Higher cache size for tag filters as there may be many tags
  }
);

/**
 * Search interface for story search
 */
export interface StorySearchParams {
  query?: string;
  category?: string;
  country?: string;
  tag?: string;
  author?: string;
  fromDate?: Date | string;
  toDate?: Date | string;
  featured?: boolean;
  editorsPick?: boolean;
}

/**
 * Search stories with multiple criteria
 * @param stories - Array of stories to search
 * @param params - Search parameters
 * @param options - Pagination options
 * @returns Paginated array of stories matching the search criteria
 */
export const searchStories = memoizeMultiArg(
  (
    stories: Story[],
    params: StorySearchParams,
    options: PaginationOptions = { page: 1, limit: 10 }
  ): PaginationResult<Story> => {
    // Apply all search filters
    let filteredStories = stories;

    // Text search (case insensitive)
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredStories = filteredStories.filter(story =>
        story.title.toLowerCase().includes(query) ||
        story.excerpt.toLowerCase().includes(query) ||
        story.content.toLowerCase().includes(query) ||
        story.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (params.category) {
      filteredStories = filteredStories.filter(story =>
        story.category.toLowerCase() === params.category!.toLowerCase()
      );
    }

    // Country filter
    if (params.country) {
      filteredStories = filteredStories.filter(story =>
        story.country.toLowerCase() === params.country!.toLowerCase()
      );
    }

    // Tag filter
    if (params.tag) {
      filteredStories = filteredStories.filter(story =>
        story.tags.some(tag => tag.toLowerCase() === params.tag!.toLowerCase())
      );
    }

    // Author filter
    if (params.author) {
      filteredStories = filteredStories.filter(story =>
        story.author.toLowerCase() === params.author!.toLowerCase()
      );
    }

    // Date range filter
    if (params.fromDate) {
      const fromDate = params.fromDate instanceof Date
        ? params.fromDate
        : new Date(params.fromDate);

      filteredStories = filteredStories.filter(story => {
        const storyDate = story.publishedAt instanceof Date
          ? story.publishedAt
          : new Date(story.publishedAt);

        return storyDate >= fromDate;
      });
    }

    if (params.toDate) {
      const toDate = params.toDate instanceof Date
        ? params.toDate
        : new Date(params.toDate);

      filteredStories = filteredStories.filter(story => {
        const storyDate = story.publishedAt instanceof Date
          ? story.publishedAt
          : new Date(story.publishedAt);

        return storyDate <= toDate;
      });
    }

    // Featured filter
    if (params.featured !== undefined) {
      filteredStories = filteredStories.filter(story =>
        story.featured === params.featured
      );
    }

    // Editor's pick filter
    if (params.editorsPick !== undefined) {
      filteredStories = filteredStories.filter(story =>
        story.editorsPick === params.editorsPick
      );
    }

    // Sort by date (newest first)
    filteredStories = filteredStories.sort((a, b) => {
      const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
      const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
      return dateB.getTime() - dateA.getTime();
    });

    // Apply pagination
    return paginate(filteredStories, options);
  },
  {
    keyGenerator: (args) => {
      const [stories, params, options] = args;
      return JSON.stringify({
        storyIds: stories.map((s: Story) => s.id),
        params,
        options
      });
    },
    maxCacheSize: 50 // Higher cache size for search as there may be many combinations
  }
);