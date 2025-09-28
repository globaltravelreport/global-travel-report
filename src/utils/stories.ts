/**
 * Consolidated stories utility functions
 *
 * This file contains all the utility functions for working with stories in the Global Travel Report.
 * It provides functions for retrieving, filtering, and paginating stories based on various criteria.
 *
 * Usage examples:
 *
 * 1. Get all stories:
 *    ```typescript
 *    const stories = await getAllStories();
 *    ```
 *
 * 2. Get stories for the homepage:
 *    ```typescript
 *    const allStories = await getAllStories();
 *    const homepageStoriesResult = getHomepageStories(allStories);
 *    const activeStories = homepageStoriesResult.data;
 *    ```
 *
 * 3. Get stories by country:
 *    ```typescript
 *    const allStories = await getAllStories();
 *    const countryStoriesResult = getStoriesByCountry(allStories, 'Japan', { page: 1, limit: 10 });
 *    const japanStories = countryStoriesResult.data;
 *    ```
 *
 * 4. Search stories:
 *    ```typescript
 *    const allStories = await getAllStories();
 *    const searchResult = searchStories(allStories, { query: 'travel', category: 'Guide' }, { page: 1, limit: 10 });
 *    const matchingStories = searchResult.data;
 *    ```
 */
import { format } from 'date-fns';
import { Story } from '../../types/Story';
import { StorySearchParams } from '../../types/StorySearchParams';
import { mockStories } from '../mocks/stories';
import { memoize, memoizeMultiArg } from './memoization';
import { isRecent } from './date-utils';
import { StoryDatabase } from '../services/storyDatabase';
import {
  paginate,
  PaginationOptions,
  PaginationResult
} from './pagination';

/**
 * Format a date for display
 * @param date - The date to format
 * @returns A formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMMM dd, yyyy');
};

/**
 * Check if a date is within the last 7 days
 * @param date - The date to check
 * @returns Boolean indicating if the date is within the last 7 days
 */
export function isWithinLast7Days(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  return diffInDays <= 7;
}

/**
 * Check if a story is archived (older than specified days)
 * @param story - The story to check
 * @param days - Number of days to consider for archiving (default: 30)
 * @returns Boolean indicating if the story is archived
 */
export const isStoryArchived = memoizeMultiArg((story: Story, days: number = 30): boolean => {
  if (!story.publishedAt) {
    return true; // Consider stories without publish date as archived
  }
  return !isRecent(story.publishedAt, days);
});

/**
 * Check if a story is recent (within specified days)
 * @param story - The story to check
 * @param days - Number of days to consider as recent (default: 30)
 * @returns Boolean indicating if the story is recent
 */
export const isStoryRecent = memoizeMultiArg((story: Story, days: number = 30): boolean => {
  return isRecent(story.publishedAt, days);
});

/**
 * Get all stories
 * @returns A promise resolving to an array of stories
 */
export async function getAllStories(): Promise<Story[]> {
  try {
    // Get the database instance
    const db = StoryDatabase.getInstance();

    // Get all stories from the database
    const stories = await db.getAllStories();

    // If no stories found in the database, fall back to mock stories
    if (!stories || stories.length === 0) {
      return mockStories.sort((a, b) => {
        const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
        const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      });
    }

    // Sort by date (newest first)
    return stories.sort((a, b) => {
      const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
      const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error fetching stories from database:', error);

    // Fall back to mock stories if database access fails
    return mockStories.sort((a, b) => {
      const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
      const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
      return dateB.getTime() - dateA.getTime();
    });
  }
}

/**
 * Get recent stories for the homepage (within 30 days, sorted by date)
 * @param stories - Array of stories to filter
 * @param options - Pagination options
 * @returns Paginated array of recent stories for the homepage
 */
export const getHomepageStories = memoizeMultiArg(
    (stories: Story[], options: PaginationOptions = { page: 1, limit: 8 }): PaginationResult<Story> => {
     // First filter and sort the stories - only show recent stories (30 days)
     const filteredStories = Array.isArray(stories) ? stories
       .filter(story => isRecent(story.publishedAt, 30)) // Only show stories from last 30 days
      .sort((a, b) => {
        const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
        const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      }) : [];

    // Then apply pagination
    return paginate(filteredStories, options);
  },
  {
    // Use a custom key generator that includes pagination options but excludes the story content
    keyGenerator: (args) => {
      const stories = args[0] as Story[];
      const options = args[1] as PaginationOptions;
      return JSON.stringify({
        storyIds: Array.isArray(stories) ? stories.map((s: Story) => s.id) : [],
        options
      });
    },
    // Limit cache size to avoid memory issues with large datasets
    maxCacheSize: 20
  }
);

/**
 * Get archived stories (older than 30 days, sorted by date)
 * @param stories - Array of stories to filter
 * @param options - Pagination options
 * @returns Paginated array of archived stories
 */
export const getArchivedStories = memoizeMultiArg(
    (stories: Story[], options: PaginationOptions = { page: 1, limit: 10 }): PaginationResult<Story> => {
     // First filter and sort the stories - show stories older than 30 days
     const filteredStories = Array.isArray(stories) ? stories
       .filter(story => isStoryArchived(story, 30)) // Stories older than 30 days
      .sort((a, b) => {
        const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
        const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      }) : [];

    // Then apply pagination
    return paginate(filteredStories, options);
  },
  {
    // Use a custom key generator that includes pagination options but excludes the story content
    keyGenerator: (args: unknown[]) => {
      const stories = args[0] as Story[];
      const options = args[1] as PaginationOptions;
      return JSON.stringify({
        storyIds: Array.isArray(stories) ? stories.map((s: Story) => s.id) : [],
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
    const filteredStories = Array.isArray(stories) ? stories
      .filter(story => story.country.toLowerCase() === country.toLowerCase())
      .sort((a, b) => {
        const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
        const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      }) : [];

    // Then apply pagination
    return paginate(filteredStories, options);
  },
  {
    // Use a custom key generator that includes pagination options but excludes the story content
    keyGenerator: (args) => {
      const stories = args[0] as Story[];
      const country = args[1] as string;
      const options = args[2] as PaginationOptions;
      return JSON.stringify({
        storyIds: Array.isArray(stories) ? stories.map((s: Story) => s.id) : [],
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
    const filteredStories = Array.isArray(stories) ? stories
      .filter(story => {
        // Check both category and type fields (some stories use type instead of category)
        const storyCategory = story.category || '';
        const storyType = story.type || '';

        // Normalize category names for comparison
        const normalizedCategory = category.toLowerCase();
        const normalizedStoryCategory = storyCategory.toLowerCase();
        const normalizedStoryType = storyType.toLowerCase();

        // Special case for "Cruise" category
        if (normalizedCategory === 'cruise' || normalizedCategory === 'cruises') {
          return normalizedStoryCategory === 'cruise' ||
                 normalizedStoryCategory === 'cruises' ||
                 normalizedStoryType === 'cruise' ||
                 normalizedStoryType === 'cruises' ||
                 normalizedStoryCategory.includes('cruise') ||
                 normalizedStoryType.includes('cruise');
        }

        // General case for other categories
        return normalizedStoryCategory === normalizedCategory ||
               normalizedStoryType === normalizedCategory ||
               normalizedStoryCategory.includes(normalizedCategory) ||
               normalizedStoryType.includes(normalizedCategory);
      })
      .sort((a, b) => {
        const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
        const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      }) : [];

    // Then apply pagination
    return paginate(filteredStories, options);
  },
  {
    // Use a custom key generator that includes pagination options but excludes the story content
    keyGenerator: (args) => {
      const stories = args[0] as Story[];
      const category = args[1] as string;
      const options = args[2] as PaginationOptions;
      return JSON.stringify({
        storyIds: Array.isArray(stories) ? stories.map((s: Story) => s.id) : [],
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
    const filteredStories = Array.isArray(stories) ? stories
      .filter(story => story.tags.some(t => t.toLowerCase() === tag.toLowerCase()))
      .sort((a, b) => {
        const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
        const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      }) : [];

    // Then apply pagination
    return paginate(filteredStories, options);
  },
  {
    keyGenerator: (args) => {
      const stories = args[0] as Story[];
      const tag = args[1] as string;
      const options = args[2] as PaginationOptions;
      return JSON.stringify({
        storyIds: Array.isArray(stories) ? stories.map((s: Story) => s.id) : [],
        tag,
        options
      });
    },
    maxCacheSize: 50 // Higher cache size for tag filters as there may be many tags
  }
);

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
    let filteredStories = Array.isArray(stories) ? [...stories] : [];

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
      const category = params.category;
      filteredStories = filteredStories.filter(story => {
        // Check both category and type fields (some stories use type instead of category)
        const storyCategory = story.category || '';
        const storyType = story.type || '';

        // Normalize category names for comparison
        const normalizedCategory = category.toLowerCase();
        const normalizedStoryCategory = storyCategory.toLowerCase();
        const normalizedStoryType = storyType.toLowerCase();

        // Special case for "Cruise" category
        if (normalizedCategory === 'cruise' || normalizedCategory === 'cruises') {
          return normalizedStoryCategory === 'cruise' ||
                 normalizedStoryCategory === 'cruises' ||
                 normalizedStoryType === 'cruise' ||
                 normalizedStoryType === 'cruises' ||
                 normalizedStoryCategory.includes('cruise') ||
                 normalizedStoryType.includes('cruise');
        }

        // General case for other categories
        return normalizedStoryCategory === normalizedCategory ||
               normalizedStoryType === normalizedCategory ||
               normalizedStoryCategory.includes(normalizedCategory) ||
               normalizedStoryType.includes(normalizedCategory);
      });
    }

    // Country filter
    if (params.country) {
      const country = params.country;
      filteredStories = filteredStories.filter(story =>
        story.country.toLowerCase() === country.toLowerCase()
      );
    }

    // Tag filter
    if (params.tag) {
      const tag = params.tag;
      filteredStories = filteredStories.filter(story =>
        story.tags.some(storyTag => storyTag.toLowerCase() === tag.toLowerCase())
      );
    }

    // Author filter
    if (params.author) {
      const author = params.author;
      filteredStories = filteredStories.filter(story =>
        story.author.toLowerCase() === author.toLowerCase()
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
      const stories = args[0] as Story[];
      const params = args[1] as StorySearchParams;
      const options = args[2] as PaginationOptions;
      return JSON.stringify({
        storyIds: Array.isArray(stories) ? stories.map((s: Story) => s.id) : [],
        params,
        options
      });
    },
    maxCacheSize: 50 // Higher cache size for search as there may be many combinations
  }
);

/**
 * Get unique countries from all stories
 * @returns A promise resolving to an array of unique countries
 */
export async function getUniqueCountries(): Promise<string[]> {
  const stories = await getAllStories();
  const countries = stories.map(story => story.country).filter(Boolean) as string[];
  return Array.from(new Set(countries)).sort();
}

/**
 * Get unique categories from all stories
 * @returns A promise resolving to an array of unique categories
 */
export async function getUniqueCategories(): Promise<string[]> {
  const stories = await getAllStories();
  const categories = stories.map(story => story.category).filter(Boolean) as string[];
  return Array.from(new Set(categories)).sort();
}

/**
 * Update a story with proper update tracking for SEO
 * @param storyId - The ID of the story to update
 * @param updates - The partial story data to update
 * @returns The updated story
 */
export async function updateStoryWithTracking(storyId: string, updates: Partial<Story>): Promise<Story | null> {
  try {
    const db = StoryDatabase.getInstance();

    // Get the current story to preserve original publish date
    const currentStory = await db.getStoryById(storyId);
    if (!currentStory) {
      return null;
    }

    // Prepare update data with proper tracking
    const updateData: Partial<Story> = {
      ...updates,
      updatedAt: new Date().toISOString(),
      // Preserve original publish date for SEO
      publishedAt: currentStory.publishedAt,
    };

    const updatedStory = await db.updateStory(storyId, updateData);
    console.log(`Updated story "${updatedStory?.title}" with SEO tracking`);

    return updatedStory;
  } catch (error) {
    console.error('Error updating story with tracking:', error);
    return null;
  }
}

/**
 * Get stories organized by month/year for archive browsing
 * @param stories - Array of stories to organize
 * @returns Stories grouped by month/year
 */
export function getStoriesByMonth(stories: Story[]): Record<string, Story[]> {
  const grouped: Record<string, Story[]> = {};

  stories.forEach(story => {
    const date = new Date(story.publishedAt || '');
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(story);
  });

  // Sort stories within each month (newest first)
  Object.keys(grouped).forEach(month => {
    grouped[month].sort((a, b) => {
      const dateA = new Date(a.publishedAt || '');
      const dateB = new Date(b.publishedAt || '');
      return dateB.getTime() - dateA.getTime();
    });
  });

  // Sort months (newest first)
  const sortedGrouped = Object.keys(grouped)
    .sort((a, b) => b.localeCompare(a))
    .reduce((result, key) => {
      result[key] = grouped[key];
      return result;
    }, {} as Record<string, Story[]>);

  return sortedGrouped;
}

/**
 * Get archive statistics
 * @param stories - Array of stories to analyze
 * @returns Archive statistics
 */
export function getArchiveStats(stories: Story[]): {
  totalStories: number;
  recentStories: number; // Last 30 days
  archivedStories: number; // Older than 30 days
  categories: Record<string, number>;
  countries: Record<string, number>;
  monthlyDistribution: Record<string, number>;
} {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentStories = stories.filter(story => {
    const storyDate = new Date(story.publishedAt || '');
    return storyDate >= thirtyDaysAgo;
  });

  const archivedStories = stories.filter(story => {
    const storyDate = new Date(story.publishedAt || '');
    return storyDate < thirtyDaysAgo;
  });

  const categories: Record<string, number> = {};
  const countries: Record<string, number> = {};
  const monthlyDistribution: Record<string, number> = {};

  stories.forEach(story => {
    // Count categories
    const category = story.category || 'Uncategorized';
    categories[category] = (categories[category] || 0) + 1;

    // Count countries
    const country = story.country || 'Unknown';
    countries[country] = (countries[country] || 0) + 1;

    // Count monthly distribution
    const date = new Date(story.publishedAt || '');
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyDistribution[monthKey] = (monthlyDistribution[monthKey] || 0) + 1;
  });

  return {
    totalStories: stories.length,
    recentStories: recentStories.length,
    archivedStories: archivedStories.length,
    categories,
    countries,
    monthlyDistribution,
  };
}

/**
 * Get a story by its slug
 * @param slug - The story slug
 * @returns A promise resolving to a story or null if not found
 */
export async function getStoryBySlug(slug: string): Promise<Story | null> {
  try {
    console.log(`[getStoryBySlug] Looking for story with slug: ${slug}`);

    // Normalize the slug for comparison
    const normalizedSlug = slug.trim().toLowerCase();

    // Get the database instance
    const db = StoryDatabase.getInstance();

    // Try to get the story directly from the database
    let story = await db.getStoryBySlug(normalizedSlug);

    // If found in the database, return it
    if (story) {
      console.log(`[getStoryBySlug] Found story in database: ${story.title}`);
      return story;
    }

    // Try with the original slug
    story = await db.getStoryBySlug(slug);
    if (story) {
      console.log(`[getStoryBySlug] Found story in database with original slug: ${story.title}`);
      return story;
    }

    // If not found in the database, fall back to the old method
    console.log(`[getStoryBySlug] Story not found in database, trying getAllStories`);
    const stories = await getAllStories();

    // Try exact match first
    let foundStory = stories.find(s => s.slug === slug);

    // If not found, try case-insensitive match
    if (!foundStory) {
      foundStory = stories.find(s => s.slug.toLowerCase() === normalizedSlug);
    }

    // If still not found, try partial match (for slugs that might have been truncated)
    if (!foundStory && slug.length > 5) {
      foundStory = stories.find(s => s.slug.toLowerCase().includes(normalizedSlug) ||
                                    normalizedSlug.includes(s.slug.toLowerCase()));
    }

    if (foundStory) {
      console.log(`[getStoryBySlug] Found story in getAllStories: ${foundStory.title}`);
    } else {
      console.log(`[getStoryBySlug] Story not found in getAllStories`);
    }

    return foundStory || null;
  } catch (error) {
    console.error(`[getStoryBySlug] Error fetching story with slug "${slug}":`, error);

    // Fall back to the old method if database access fails
    try {
      console.log(`[getStoryBySlug] Trying fallback method for slug: ${slug}`);
      const stories = await getAllStories();
      const normalizedSlug = slug.trim().toLowerCase();

      // Try exact match first
      let foundStory = stories.find(s => s.slug === slug);

      // If not found, try case-insensitive match
      if (!foundStory) {
        foundStory = stories.find(s => s.slug.toLowerCase() === normalizedSlug);
      }

      // If still not found, try partial match
      if (!foundStory && slug.length > 5) {
        foundStory = stories.find(s => s.slug.toLowerCase().includes(normalizedSlug) ||
                                      normalizedSlug.includes(s.slug.toLowerCase()));
      }

      if (foundStory) {
        console.log(`[getStoryBySlug] Found story in fallback: ${foundStory.title}`);
      } else {
        console.log(`[getStoryBySlug] Story not found in fallback`);
      }

      return foundStory || null;
    } catch (fallbackError) {
      console.error(`[getStoryBySlug] Fallback method failed:`, fallbackError);
      return null;
    }
  }
}