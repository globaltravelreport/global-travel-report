import {
  getAllStories,
  getHomepageStories,
  getArchivedStories,
  getStoriesByCountry,
  getStoriesByCategory,
  getStoriesByTag,
  searchStories,
  isStoryArchived
} from '../../src/utils/stories';
import type { Story } from '../../types/Story';

// Mock the mockStories import
jest.mock('../../src/mocks/stories', () => ({
  mockStories: [
    {
      id: '1',
      title: 'Test Story 1',
      slug: 'test-story-1',
      excerpt: 'Test excerpt 1',
      content: 'Test content 1',
      author: 'Test Author',
      publishedAt: new Date('2024-03-24'),
      category: 'Travel News',
      country: 'Australia',
      tags: ['test', 'story'],
      featured: true,
      editorsPick: true
    },
    {
      id: '2',
      title: 'Test Story 2',
      slug: 'test-story-2',
      excerpt: 'Test excerpt 2',
      content: 'Test content 2',
      author: 'Test Author',
      publishedAt: new Date('2024-03-20'),
      category: 'Guide',
      country: 'Japan',
      tags: ['test', 'guide'],
      featured: false,
      editorsPick: true
    },
    {
      id: '3',
      title: 'Test Story 3',
      slug: 'test-story-3',
      excerpt: 'Test excerpt 3',
      content: 'Test content 3',
      author: 'Another Author',
      publishedAt: new Date('2024-02-20'),
      category: 'Hotel',
      country: 'France',
      tags: ['hotel', 'luxury'],
      featured: false,
      editorsPick: false
    }
  ]
}));

describe('Stories Utility', () => {
  let stories: Story[];

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();
    stories = await getAllStories();
  });

  describe('getAllStories', () => {
    it('returns all stories sorted by date', async () => {
      expect(stories).toHaveLength(3);
      expect(stories[0].title).toBe('Test Story 1'); // Most recent first
      expect(stories[1].title).toBe('Test Story 2');
      expect(stories[2].title).toBe('Test Story 3');
    });
  });

  describe('getHomepageStories', () => {
    it('returns non-archived stories with pagination', () => {
      // Mock isArchived to consider stories older than 30 days as archived
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-24'));

      const result = getHomepageStories(stories);

      expect(result.data).toHaveLength(2); // Only 2 stories in the mock
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(8);
      expect(result.pagination.totalPages).toBe(1);

      jest.useRealTimers();
    });
  });

  describe('getArchivedStories', () => {
    it('returns archived stories with pagination', () => {
      // Mock isArchived to consider stories older than 7 days as archived
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-04-01')); // Set current date to April 1, 2024

      const result = getArchivedStories(stories);

      expect(result.data).toHaveLength(1); // Only 1 story is archived
      expect(result.pagination.total).toBe(1);

      jest.useRealTimers();
    });
  });

  describe('getStoriesByCountry', () => {
    it('returns stories for a specific country with pagination', () => {
      const result = getStoriesByCountry(stories, 'Japan', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].country).toBe('Japan');
      expect(result.pagination.total).toBe(1);
    });

    it('is case insensitive', () => {
      const result = getStoriesByCountry(stories, 'japan', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].country).toBe('Japan');
    });
  });

  describe('getStoriesByCategory', () => {
    it('returns stories for a specific category with pagination', () => {
      const result = getStoriesByCategory(stories, 'Guide', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].category).toBe('Guide');
      expect(result.pagination.total).toBe(1);
    });

    it('is case insensitive', () => {
      const result = getStoriesByCategory(stories, 'guide', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].category).toBe('Guide');
    });
  });

  describe('getStoriesByTag', () => {
    it('returns stories for a specific tag with pagination', () => {
      const result = getStoriesByTag(stories, 'luxury', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].tags).toContain('luxury');
      expect(result.pagination.total).toBe(1);
    });

    it('is case insensitive', () => {
      const result = getStoriesByTag(stories, 'LUXURY', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].tags).toContain('luxury');
    });
  });

  describe('searchStories', () => {
    it('searches stories by query', () => {
      const result = searchStories(stories, { query: 'hotel' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Test Story 3');
    });

    it('filters by category', () => {
      const result = searchStories(stories, { category: 'Guide' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].category).toBe('Guide');
    });

    it('filters by country', () => {
      const result = searchStories(stories, { country: 'France' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].country).toBe('France');
    });

    it('filters by author', () => {
      const result = searchStories(stories, { author: 'Another Author' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].author).toBe('Another Author');
    });

    it('filters by featured', () => {
      const result = searchStories(stories, { featured: true });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].featured).toBe(true);
    });

    it('filters by editorsPick', () => {
      const result = searchStories(stories, { editorsPick: true });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].editorsPick).toBe(true);
      expect(result.data[1].editorsPick).toBe(true);
    });

    it('combines multiple filters', () => {
      const result = searchStories(stories, {
        country: 'Japan',
        editorsPick: true
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].country).toBe('Japan');
      expect(result.data[0].editorsPick).toBe(true);
    });
  });

  describe('isStoryArchived', () => {
    it('returns true for stories older than the specified days', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-24'));

      const oldStory = {
        ...stories[2],
        publishedAt: new Date('2024-02-20')
      };

      expect(isStoryArchived(oldStory, 30)).toBe(true);

      jest.useRealTimers();
    });

    it('returns false for recent stories', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-24'));

      const recentStory = {
        ...stories[0],
        publishedAt: new Date('2024-03-20')
      };

      expect(isStoryArchived(recentStory, 30)).toBe(false);

      jest.useRealTimers();
    });
  });
});
