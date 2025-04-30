import {
  getHomepageStories,
  getArchivedStories,
  getStoriesByCountry,
  getStoriesByCategory,
  getStoriesByTag,
  searchStories,
  StorySearchParams
} from '../../lib/stories';
import { Story } from '@/types/Story';

// Mock stories for testing
const mockStories: Story[] = [
  {
    id: '1',
    slug: 'paris-adventure',
    title: 'Paris Adventure',
    excerpt: 'Exploring the city of lights',
    content: 'Paris is a beautiful city with many attractions.',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    author: 'John Doe',
    category: 'Adventure',
    country: 'France',
    tags: ['europe', 'city', 'culture'],
    featured: true,
    editorsPick: false,
    imageUrl: '/images/paris.jpg',
  },
  {
    id: '2',
    slug: 'tokyo-food-tour',
    title: 'Tokyo Food Tour',
    excerpt: 'Tasting the best of Japanese cuisine',
    content: 'Tokyo offers an amazing variety of food options.',
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago (archived)
    author: 'Jane Smith',
    category: 'Food',
    country: 'Japan',
    tags: ['asia', 'food', 'culture'],
    featured: false,
    editorsPick: true,
    imageUrl: '/images/tokyo.jpg',
  },
  {
    id: '3',
    slug: 'new-york-city-guide',
    title: 'New York City Guide',
    excerpt: 'The ultimate guide to NYC',
    content: 'New York City is a vibrant metropolis with endless possibilities.',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    author: 'John Doe',
    category: 'Guide',
    country: 'USA',
    tags: ['north america', 'city', 'guide'],
    featured: true,
    editorsPick: true,
    imageUrl: '/images/nyc.jpg',
  },
  {
    id: '4',
    slug: 'safari-in-kenya',
    title: 'Safari in Kenya',
    excerpt: 'Wildlife adventures in East Africa',
    content: 'Kenya offers amazing wildlife viewing opportunities.',
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago (archived)
    author: 'Sarah Johnson',
    category: 'Adventure',
    country: 'Kenya',
    tags: ['africa', 'wildlife', 'safari'],
    featured: false,
    editorsPick: false,
    imageUrl: '/images/kenya.jpg',
  },
  {
    id: '5',
    slug: 'beaches-of-thailand',
    title: 'Beaches of Thailand',
    excerpt: 'Discovering the best beaches in Thailand',
    content: 'Thailand has some of the most beautiful beaches in the world.',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    author: 'Mike Brown',
    category: 'Beach',
    country: 'Thailand',
    tags: ['asia', 'beach', 'relaxation'],
    featured: true,
    editorsPick: false,
    imageUrl: '/images/thailand.jpg',
  },
];

// Mock the isArchived function
jest.mock('@/src/utils/date-utils', () => ({
  isArchived: (date: Date | string, days: number = 7) => {
    const publishedDate = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - publishedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > days;
  },
}));

// Mock the memoization functions to just return the original function
jest.mock('@/src/utils/memoization', () => ({
  memoize: (fn: any) => fn,
  memoizeMultiArg: (fn: any) => fn,
}));

describe('Enhanced Story Filtering Functions', () => {
  describe('getHomepageStories', () => {
    it('should return non-archived stories sorted by date', () => {
      const result = getHomepageStories(mockStories, { page: 1, limit: 10 });

      // Should return 3 non-archived stories
      expect(result.data.length).toBe(3);

      // Should be sorted by date (newest first)
      expect(result.data[0].id).toBe('3'); // New York (1 day ago)
      expect(result.data[1].id).toBe('1'); // Paris (2 days ago)
      expect(result.data[2].id).toBe('5'); // Thailand (3 days ago)

      // Should include pagination metadata
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBe(3);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should respect pagination parameters', () => {
      const result = getHomepageStories(mockStories, { page: 1, limit: 2 });

      // Should return only 2 stories due to limit
      expect(result.data.length).toBe(2);

      // Should be the first page
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.total).toBe(3);
      expect(result.meta.totalPages).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);

      // Second page should have 1 story
      const page2 = getHomepageStories(mockStories, { page: 2, limit: 2 });
      expect(page2.data.length).toBe(1);
      expect(page2.meta.page).toBe(2);
      expect(page2.meta.hasNextPage).toBe(false);
    });
  });

  describe('getArchivedStories', () => {
    it('should return archived stories sorted by date', () => {
      const result = getArchivedStories(mockStories, { page: 1, limit: 10 });

      // Should return 2 archived stories
      expect(result.data.length).toBe(2);

      // Should be sorted by date (newest first)
      expect(result.data[0].id).toBe('2'); // Tokyo (10 days ago)
      expect(result.data[1].id).toBe('4'); // Kenya (15 days ago)

      // Should include pagination metadata
      expect(result.meta.page).toBe(1);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('getStoriesByCountry', () => {
    it('should return stories for a specific country', () => {
      const result = getStoriesByCountry(mockStories, 'Japan', { page: 1, limit: 10 });

      // Should return 1 story for Japan
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('2');
      expect(result.data[0].country).toBe('Japan');

      // Should include pagination metadata
      expect(result.meta.page).toBe(1);
      expect(result.meta.total).toBe(1);
    });

    it('should handle case-insensitive country names', () => {
      const result = getStoriesByCountry(mockStories, 'japan', { page: 1, limit: 10 });

      // Should return 1 story for Japan (case-insensitive)
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('2');
    });

    it('should return empty array for non-existent country', () => {
      const result = getStoriesByCountry(mockStories, 'Germany', { page: 1, limit: 10 });

      // Should return 0 stories
      expect(result.data.length).toBe(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('getStoriesByCategory', () => {
    it('should return stories for a specific category', () => {
      const result = getStoriesByCategory(mockStories, 'Adventure', { page: 1, limit: 10 });

      // Should return 2 stories for Adventure category
      expect(result.data.length).toBe(2);
      expect(result.data[0].id).toBe('1'); // Paris (newer)
      expect(result.data[1].id).toBe('4'); // Kenya (older)

      // Should include pagination metadata
      expect(result.meta.page).toBe(1);
      expect(result.meta.total).toBe(2);
    });

    it('should handle case-insensitive category names', () => {
      const result = getStoriesByCategory(mockStories, 'adventure', { page: 1, limit: 10 });

      // Should return 2 stories for Adventure category (case-insensitive)
      expect(result.data.length).toBe(2);
    });
  });

  describe('getStoriesByTag', () => {
    it('should return stories with a specific tag', () => {
      const result = getStoriesByTag(mockStories, 'culture', { page: 1, limit: 10 });

      // Should return 2 stories with culture tag
      expect(result.data.length).toBe(2);
      expect(result.data[0].id).toBe('1'); // Paris (newer)
      expect(result.data[1].id).toBe('2'); // Tokyo (older)

      // Should include pagination metadata
      expect(result.meta.page).toBe(1);
      expect(result.meta.total).toBe(2);
    });

    it('should handle case-insensitive tag names', () => {
      const result = getStoriesByTag(mockStories, 'CULTURE', { page: 1, limit: 10 });

      // Should return 2 stories with culture tag (case-insensitive)
      expect(result.data.length).toBe(2);
    });
  });

  describe('searchStories', () => {
    it('should search by query text', () => {
      const params: StorySearchParams = { query: 'city' };
      const result = searchStories(mockStories, params, { page: 1, limit: 10 });

      // Should return 2 stories containing 'city' in title, excerpt, content, or tags
      expect(result.data.length).toBe(2);
      expect(result.data.some(story => story.id === '1')).toBe(true); // Paris
      expect(result.data.some(story => story.id === '3')).toBe(true); // NYC
    });

    it('should filter by category', () => {
      const params: StorySearchParams = { category: 'Food' };
      const result = searchStories(mockStories, params, { page: 1, limit: 10 });

      // Should return 1 story in Food category
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('2'); // Tokyo
    });

    it('should filter by country', () => {
      const params: StorySearchParams = { country: 'USA' };
      const result = searchStories(mockStories, params, { page: 1, limit: 10 });

      // Should return 1 story from USA
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('3'); // NYC
    });

    it('should filter by tag', () => {
      const params: StorySearchParams = { tag: 'beach' };
      const result = searchStories(mockStories, params, { page: 1, limit: 10 });

      // Should return 1 story with beach tag
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('5'); // Thailand
    });

    it('should filter by author', () => {
      const params: StorySearchParams = { author: 'John Doe' };
      const result = searchStories(mockStories, params, { page: 1, limit: 10 });

      // Should return 2 stories by John Doe
      expect(result.data.length).toBe(2);
      expect(result.data.some(story => story.id === '1')).toBe(true); // Paris
      expect(result.data.some(story => story.id === '3')).toBe(true); // NYC
    });

    it('should filter by date range', () => {
      const now = new Date();
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

      const params: StorySearchParams = {
        fromDate: fiveDaysAgo,
        toDate: oneDayAgo
      };

      const result = searchStories(mockStories, params, { page: 1, limit: 10 });

      // Should return stories published between 5 days ago and 1 day ago
      expect(result.data.length).toBe(3);
      expect(result.data.some(story => story.id === '1')).toBe(true); // Paris (2 days ago)
      expect(result.data.some(story => story.id === '5')).toBe(true); // Thailand (3 days ago)
      expect(result.data.some(story => story.id === '3')).toBe(true); // New York (1 day ago)
    });

    it('should filter by featured status', () => {
      const params: StorySearchParams = { featured: true };
      const result = searchStories(mockStories, params, { page: 1, limit: 10 });

      // Should return 3 featured stories
      expect(result.data.length).toBe(3);
      expect(result.data.every(story => story.featured)).toBe(true);
    });

    it('should filter by editor\'s pick status', () => {
      const params: StorySearchParams = { editorsPick: true };
      const result = searchStories(mockStories, params, { page: 1, limit: 10 });

      // Should return 2 editor's pick stories
      expect(result.data.length).toBe(2);
      expect(result.data.every(story => story.editorsPick)).toBe(true);
    });

    it('should combine multiple filters', () => {
      const params: StorySearchParams = {
        category: 'Adventure',
        featured: true
      };

      const result = searchStories(mockStories, params, { page: 1, limit: 10 });

      // Should return 1 story that is both in Adventure category and featured
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('1'); // Paris
    });

    it('should respect pagination parameters', () => {
      const params: StorySearchParams = {};
      const result = searchStories(mockStories, params, { page: 1, limit: 2 });

      // Should return only 2 stories due to limit
      expect(result.data.length).toBe(2);

      // Should be the first page
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.total).toBe(5);
      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNextPage).toBe(true);

      // Second page should have 2 more stories
      const page2 = searchStories(mockStories, params, { page: 2, limit: 2 });
      expect(page2.data.length).toBe(2);
      expect(page2.meta.page).toBe(2);
      expect(page2.meta.hasNextPage).toBe(true);

      // Third page should have 1 story
      const page3 = searchStories(mockStories, params, { page: 3, limit: 2 });
      expect(page3.data.length).toBe(1);
      expect(page3.meta.page).toBe(3);
      expect(page3.meta.hasNextPage).toBe(false);
    });
  });
});
