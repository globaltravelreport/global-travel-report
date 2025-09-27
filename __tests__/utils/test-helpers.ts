import { Story } from '@/types/Story';
import { StoryDatabase } from '@/src/services/storyDatabase';
import { render } from '@testing-library/react';

// Test utilities for all test files
// Includes: mock data generators, component helpers, API utilities, DB mocking, date helpers, image/animation/accessibility/performance helpers, custom matchers

export function mockStory(overrides = {}) {
  return {
    id: 'test-id',
    slug: 'test-slug',
    title: 'Test Story',
    excerpt: 'Test excerpt',
    body: 'Test body',
    publishedAt: new Date().toISOString(),
    author: 'Test Author',
    country: 'Testland',
    category: 'TestCategory',
    tags: ['test'],
    featured: false,
    editorsPick: false,
    ...overrides,
  };
}

export function makeStories(n = 5, overrides = {}) {
  return Array.from({ length: n }, (_, i) => mockStory({ id: `id-${i}`, slug: `slug-${i}`, ...overrides }));
}

export function mockDB(methods = {}) {
  const db = {
    getAllStories: jest.fn().mockResolvedValue(makeStories(5)),
    getStoryById: jest.fn(),
    getStoryBySlug: jest.fn(),
    addStory: jest.fn(),
    addStories: jest.fn(),
    deleteStory: jest.fn(),
    searchStories: jest.fn(),
    getStoriesByCategory: jest.fn(),
    getStoriesByCountry: jest.fn(),
    ...methods,
  };
  jest.spyOn(StoryDatabase, 'getInstance').mockReturnValue(db as any);
  return db;
}

export function makeNextRequest(url, options = {}) {
  return new Request(url, { method: 'GET', ...options });
}

export function renderWithProviders(ui, options) {
  // Add any global providers here if needed
  return render(ui, options);
}

export function advanceTo(date) {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(date));
}

export function resetDate() {
  jest.useRealTimers();
}

// Custom Jest matcher for JSON shape
expect.extend({
  toHaveJsonShape(received, shape) {
    const pass = Object.keys(shape).every(key => key in received);
    if (pass) {
      return { message: () => `expected object not to have shape`, pass: true };
    } else {
      return { message: () => `expected object to have shape`, pass: false };
    }
  },
});
