import sitemap from '../app/sitemap';
import { getAllStories } from '../src/utils/stories';
import type { Story } from '../types/Story';

jest.mock('../src/utils/stories', () => ({
  getAllStories: jest.fn()
}));

const mockedGetAllStories = getAllStories as jest.MockedFunction<typeof getAllStories>;

const story: Story = {
  id: 'story-1',
  slug: 'japan-cruise-update',
  title: 'Japan Cruise Update',
  excerpt: 'An update for travellers considering a cruise in Japan.',
  content: 'A sufficiently long story body for sitemap generation.',
  author: 'Global Travel Report',
  publishedAt: '2026-06-19T00:00:00.000Z',
  updatedAt: '2026-06-19T01:00:00.000Z',
  category: 'Cruise',
  country: 'Japan',
  tags: ['cruise', 'japan'],
  featured: false,
  editorsPick: false,
  imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
};

describe('sitemap', () => {
  beforeEach(() => {
    mockedGetAllStories.mockResolvedValue([story]);
  });

  it('serialises story image entries as URLs and excludes missing tag routes', async () => {
    const entries = await sitemap();
    const storyEntry = entries.find((entry) => entry.url.endsWith(`/stories/${story.slug}`));

    expect(storyEntry).toMatchObject({
      images: [story.imageUrl],
      lastModified: new Date(story.updatedAt!)
    });
    expect(entries.some((entry) => entry.url.includes('/tags/'))).toBe(false);
  });

  it('does not refresh unchanged static pages with the current timestamp', async () => {
    const entries = await sitemap();
    const home = entries.find((entry) => entry.url === 'https://www.globaltravelreport.com');

    expect(home).toBeDefined();
    expect(home).not.toHaveProperty('lastModified');
  });
});
