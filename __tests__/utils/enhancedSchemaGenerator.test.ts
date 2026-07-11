import type { Story } from '@/types/Story';
import {
  generateEnhancedNewsArticleSchema,
  generateEnhancedTravelDestinationSchema
} from '@/src/utils/enhancedSchemaGenerator';

const story: Story = {
  id: 'story-1',
  slug: 'japan-travel-guide',
  title: 'Japan Travel Guide',
  excerpt: 'Practical advice for planning a trip to Japan.',
  content: 'A long-form guide to travelling in Japan.',
  author: '',
  publishedAt: '2026-06-20T00:00:00.000Z',
  category: 'Destinations',
  country: 'Japan',
  tags: ['Japan', 'travel guide'],
  featured: false,
  editorsPick: false,
  sourceUrl: 'https://example.com/japan-source'
};

describe('enhanced schema generator', () => {
  it('uses the editorial organisation and visible source relationship', () => {
    const schema = generateEnhancedNewsArticleSchema(story);

    expect(schema.author).toMatchObject({
      '@type': 'Organization',
      name: 'Global Travel Report Editorial Desk'
    });
    expect(schema.isBasedOn).toBe(story.sourceUrl);
    expect(schema.isAccessibleForFree).toBe(true);
  });

  it('does not fabricate destination ratings or reviews', () => {
    const schema = generateEnhancedTravelDestinationSchema(story);

    expect(schema).not.toHaveProperty('review');
    expect(schema).not.toHaveProperty('aggregateRating');
  });
});
