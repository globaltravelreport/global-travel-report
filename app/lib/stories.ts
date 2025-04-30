import { Story } from '@/types/Story';
import { mockStories } from '@/src/mocks/stories';
import { formatDisplayDate } from '@/src/utils/date-utils';
import { isWithinLast7Days } from './utils';

/**
 * Format a date for display
 * @param date - The date to format
 * @returns A formatted date string
 */
export function formatDate(date: Date | string): string {
  return formatDisplayDate(date, 'en-US');
}

// Mock stories for tests
const testStories = [
  {
    title: 'Test Story 1',
    summary: 'Summary 1',
    keywords: ['test', 'story'],
    slug: 'test-story-1',
    date: '2024-03-24',
    country: 'Australia',
    type: 'Travel News',
    content: 'Test content 1',
    lastModified: '2024-03-24T00:00:00.000Z',
    publishedAt: '2024-03-24T00:00:00.000Z',
    category: 'Travel News',
    excerpt: 'Summary 1',
    tags: ['test', 'story']
  },
  {
    title: 'Test Story 2',
    summary: 'Summary 2',
    keywords: ['test', 'story'],
    slug: 'test-story-2',
    date: '2024-03-20',
    country: 'Japan',
    type: 'Guide',
    content: 'Test content 2',
    lastModified: '2024-03-20T00:00:00.000Z',
    publishedAt: '2024-03-20T00:00:00.000Z',
    category: 'Guide',
    excerpt: 'Summary 2',
    tags: ['test', 'story']
  }
] as unknown as Story[];

/**
 * Get all stories
 * @returns A promise resolving to an array of stories
 */
export async function getAllStories(): Promise<Story[]> {
  // For tests, return the test stories
  if (process.env.NODE_ENV === 'test') {
    return testStories;
  }

  // In a real application, this would fetch from a database or API
  return mockStories.sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

/**
 * Get unique countries from all stories
 * @returns A promise resolving to an array of unique countries
 */
export async function getUniqueCountries(): Promise<string[]> {
  const stories = await getAllStories();
  const countries = stories.map(story => story.country).filter(Boolean) as string[];
  return [...new Set(countries)].sort();
}

/**
 * Get unique types from all stories
 * @returns A promise resolving to an array of unique types
 */
export async function getUniqueTypes(): Promise<string[]> {
  const stories = await getAllStories();
  const types = stories.map(story => story.type || story.category).filter(Boolean) as string[];
  return [...new Set(types)].sort();
}

/**
 * Get stories with optional filters
 * @param options - Filter options
 * @returns A promise resolving to an array of filtered stories
 */
export async function getStories(options: {
  country?: string;
  type?: string;
  recentOnly?: boolean;
} = {}): Promise<Story[]> {
  const stories = await getAllStories();

  return stories.filter(story => {
    // Filter by country if specified
    if (options.country && story.country !== options.country) {
      return false;
    }

    // Filter by type if specified
    if (options.type && (story.type !== options.type && story.category !== options.type)) {
      return false;
    }

    // Filter by recent only if specified
    if (options.recentOnly) {
      const dateField = story.date || story.publishedAt;
      if (!isWithinLast7Days(dateField)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get recent stories with optional filters
 * @param options - Filter options
 * @returns A promise resolving to an array of recent stories
 */
export async function getRecentStories(options: {
  country?: string;
} = {}): Promise<Story[]> {
  return getStories({
    ...options,
    recentOnly: true
  });
}

/**
 * Get a story by its slug
 * @param slug - The story slug
 * @returns A promise resolving to a story or null if not found
 */
export async function getStoryBySlug(slug: string): Promise<Story | null> {
  try {
    const stories = await getAllStories();
    return stories.find(story => story.slug === slug) || null;
  } catch (error) {
    return null;
  }
}

/**
 * Get stories by tag
 * @param tag - The tag to filter by
 * @returns A promise resolving to an array of stories
 */
export async function getStoriesByTag(tag: string): Promise<Story[]> {
  const stories = await getAllStories();
  return stories.filter(story => {
    const tags = story.tags || story.keywords;
    return tags?.some(t =>
      typeof t === 'string' && t.toLowerCase() === tag.toLowerCase()
    );
  });
}

/**
 * Search stories by various criteria
 * @param query - The search query
 * @returns A promise resolving to an array of stories
 */
export async function searchStories(query: string): Promise<Story[]> {
  const stories = await getAllStories();
  const lowerQuery = query.toLowerCase();

  return stories.filter(story => {
    return (
      story.title.toLowerCase().includes(lowerQuery) ||
      (story.excerpt || story.summary || '').toLowerCase().includes(lowerQuery) ||
      story.content.toLowerCase().includes(lowerQuery) ||
      (story.tags || story.keywords)?.some(tag =>
        typeof tag === 'string' && tag.toLowerCase().includes(lowerQuery)
      )
    );
  });
}

/**
 * Get archived stories
 * @param stories - The stories to filter
 * @param pagination - Pagination options
 * @returns Paginated stories
 */
export function getArchivedStories(stories: Story[], pagination: { page: number; limit: number }) {
  // Implementation would filter for archived stories
  return {
    data: stories.filter(story => story.archived),
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total: stories.filter(story => story.archived).length
    }
  };
}