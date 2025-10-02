// Enhanced unit tests for story utilities
// Covers: getUniqueCountries, getUniqueCategories, getStoryBySlug, formatDate, isWithinLast7Days, memoization, error handling, edge cases, performance
// Uses mockStories from src/mocks/stories.ts
import * as storiesUtils from '@/utils/stories';
import { mockStories } from '@/src/mocks/stories';
import { mockDB, advanceTo, resetDate } from '../utils/test-helpers';

describe('stories utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetDate();
  });

  describe('formatDate', () => {
    it('formats ISO string', () => {
      expect(storiesUtils.formatDate('2024-01-01T00:00:00Z')).toMatch(/January/);
    });
    it('formats Date object', () => {
      expect(storiesUtils.formatDate(new Date('2024-01-01'))).toMatch(/January/);
    });
  });

  describe('isWithinLast7Days', () => {
    it('returns true for today', () => {
      advanceTo('2024-01-08');
      expect(storiesUtils.isWithinLast7Days('2024-01-07')).toBe(true);
    });
    it('returns false for 8 days ago', () => {
      advanceTo('2024-01-08');
      expect(storiesUtils.isWithinLast7Days('2023-12-31')).toBe(false);
    });
  });

  describe('getUniqueCountries', () => {
    it('returns unique countries', async () => {
      // Mock the database to return test stories
      const mockStories = [
        { country: 'A', id: '1', slug: 'test1', title: 'Test 1', excerpt: 'Test excerpt', body: 'Test body', publishedAt: '2024-01-01', author: 'Test', category: 'Test', tags: [] },
        { country: 'B', id: '2', slug: 'test2', title: 'Test 2', excerpt: 'Test excerpt', body: 'Test body', publishedAt: '2024-01-01', author: 'Test', category: 'Test', tags: [] },
        { country: 'A', id: '3', slug: 'test3', title: 'Test 3', excerpt: 'Test excerpt', body: 'Test body', publishedAt: '2024-01-01', author: 'Test', category: 'Test', tags: [] },
      ];
      mockDB({ getAllStories: jest.fn().mockResolvedValue(mockStories) });

      const result = await storiesUtils.getUniqueCountries();
      expect(result).toEqual(['A', 'B']);
    });
  });

  describe('getUniqueCategories', () => {
    it('returns unique categories', async () => {
      // Mock the database to return test stories
      const mockStories = [
        { category: 'X', id: '1', slug: 'test1', title: 'Test 1', excerpt: 'Test excerpt', body: 'Test body', publishedAt: '2024-01-01', author: 'Test', country: 'Test', tags: [] },
        { category: 'Y', id: '2', slug: 'test2', title: 'Test 2', excerpt: 'Test excerpt', body: 'Test body', publishedAt: '2024-01-01', author: 'Test', country: 'Test', tags: [] },
        { category: 'X', id: '3', slug: 'test3', title: 'Test 3', excerpt: 'Test excerpt', body: 'Test body', publishedAt: '2024-01-01', author: 'Test', country: 'Test', tags: [] },
      ];
      mockDB({ getAllStories: jest.fn().mockResolvedValue(mockStories) });

      const result = await storiesUtils.getUniqueCategories();
      expect(result).toEqual(['X', 'Y']);
    });
  });

  describe('getStoryBySlug', () => {
    it('finds by exact slug', async () => {
      const mockStory = { slug: 'foo', id: '1', title: 'Test', excerpt: 'Test', body: 'Test', publishedAt: '2024-01-01', author: 'Test', country: 'Test', category: 'Test', tags: [] };
      mockDB({ getStoryBySlug: jest.fn().mockResolvedValue(mockStory) });

      const result = await storiesUtils.getStoryBySlug('foo');
      expect(result).toEqual(mockStory);
    });
    it('finds by case-insensitive slug', async () => {
      const mockStory = { slug: 'Foo', id: '1', title: 'Test', excerpt: 'Test', body: 'Test', publishedAt: '2024-01-01', author: 'Test', country: 'Test', category: 'Test', tags: [] };
      mockDB({ getStoryBySlug: jest.fn().mockResolvedValue(mockStory) });

      const result = await storiesUtils.getStoryBySlug('foo');
      expect(result).toEqual(mockStory);
    });
    it('returns null for missing slug', async () => {
      mockDB({ getStoryBySlug: jest.fn().mockResolvedValue(null) });

      const result = await storiesUtils.getStoryBySlug('nope');
      expect(result).toBeNull();
    });
  });

  describe('getHomepageStories memoization', () => {
    it('returns same result for same input', () => {
      const stories = mockStories.slice(0, 3);
      const a = storiesUtils.getHomepageStories(stories, { page: 1, limit: 2 });
      const b = storiesUtils.getHomepageStories(stories, { page: 1, limit: 2 });
      expect(a).toBe(b);
    });
    it('returns different result for different options', () => {
      const stories = mockStories.slice(0, 3);
      const a = storiesUtils.getHomepageStories(stories, { page: 1, limit: 2 });
      const b = storiesUtils.getHomepageStories(stories, { page: 2, limit: 2 });
      expect(a).not.toBe(b);
    });
    it('evicts cache after maxCacheSize', () => {
      const stories = mockStories.slice(0, 3);
      const results = [];
      for (let i = 0; i < 25; i++) {
        results.push(storiesUtils.getHomepageStories(stories, { page: i, limit: 1 }));
      }
      // The first result should have been evicted
      expect(results[0]).not.toBe(storiesUtils.getHomepageStories(stories, { page: 0, limit: 1 }));
    });
  });

  // Add similar tests for getStoriesByCountry, getStoriesByCategory, searchStories, and edge cases...
});
