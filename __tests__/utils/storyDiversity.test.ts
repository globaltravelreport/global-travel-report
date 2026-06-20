import type { Story } from '@/types/Story';
import { checkStoryDiversity } from '@/src/utils/storyDiversity';

const now = new Date('2026-06-20T02:00:00.000Z');

function story(overrides: Partial<Story> = {}): Story {
  return {
    id: 'story-1',
    slug: 'qantas-airline-update',
    title: 'Qantas Airline Update for Travellers',
    excerpt: 'A travel update.',
    content: 'Travel update content.',
    author: '',
    publishedAt: '2026-06-20T00:00:00.000Z',
    processedAt: '2026-06-20T00:00:00.000Z',
    category: 'Air Travel',
    country: 'Australia',
    tags: [],
    featured: false,
    editorsPick: false,
    ...overrides
  };
}

describe('checkStoryDiversity', () => {
  it('rejects a substantially overlapping recent topic in the same category', () => {
    expect(checkStoryDiversity(
      { title: 'Qantas Airline Update for Passengers', category: 'Air Travel' },
      [story()],
      now
    )).toEqual({ allowed: false, reason: 'recent-topic-duplicate' });
  });

  it('allows distinct topics within the same category', () => {
    expect(checkStoryDiversity(
      { title: 'Japan Cruise Update for Travellers', category: 'Cruise' },
      [story({ title: 'United States Cruise Update for Travellers', category: 'Cruise' })],
      now
    )).toEqual({ allowed: true });
  });

  it('limits a category to two recent stories', () => {
    expect(checkStoryDiversity(
      { title: 'New Airline Route for Travellers', category: 'Air Travel' },
      [story(), story({ id: 'story-2', title: 'Virgin Australia Lounge Update' })],
      now
    )).toEqual({ allowed: false, reason: 'category-daily-limit' });
  });
});
