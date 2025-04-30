import Parser from 'rss-parser';
import { Story } from './stories';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['dc:creator', 'author'],
      ['content:encoded', 'content'],
    ],
  },
});

export async function fetchRSSFeeds(): Promise<Story[]> {
  const feeds = [
    'https://www.lonelyplanet.com/blog/feed/',
    'https://www.nationalgeographic.com/travel/feeds/travel-rss/',
    'https://www.travelandleisure.com/rss/all.xml',
  ];

  const stories: Story[] = [];

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);
      
      for (const item of feed.items) {
        if (!item.title || !item.link) continue;

        const story: Story = {
          id: item.guid || item.link,
          slug: generateSlug(item.title),
          title: item.title,
          excerpt: item.contentSnippet || item.content?.slice(0, 200) || '',
          content: item.content || '',
          author: item.creator || item.author || 'Unknown',
          category: determineCategory(item.categories || []),
          country: determineCountry(item.title, item.content || ''),
          tags: item.categories || [],
          featured: false,
          editorsPick: false,
          publishedAt: new Date(item.pubDate || Date.now()),
          imageUrl: item.enclosure?.url || item.media?.$.url || '',
        };

        stories.push(story);
      }
    } catch (error) {
      console.error(`Error fetching feed ${feedUrl}:`, error);
    }
  }

  return stories;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function determineCategory(categories: string[]): string {
  const categoryMap: Record<string, string> = {
    'hotel': 'Hotels',
    'airline': 'Airlines',
    'cruise': 'Cruises',
    'destination': 'Destinations',
    'food': 'Food & Dining',
    'adventure': 'Adventure',
    'culture': 'Culture',
    'shopping': 'Shopping',
    'nightlife': 'Nightlife',
    'family': 'Family Travel',
    'luxury': 'Luxury Travel',
    'budget': 'Budget Travel',
    'solo': 'Solo Travel',
    'honeymoon': 'Honeymoon',
    'business': 'Business Travel',
    'eco': 'Eco Tourism',
    'wellness': 'Wellness & Spa',
  };

  for (const category of categories) {
    const lowerCategory = category.toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
      if (lowerCategory.includes(key)) {
        return value;
      }
    }
  }

  return 'Destinations';
}

function determineCountry(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase();
  const countries = [
    'australia', 'japan', 'united states', 'united kingdom', 'france',
    'italy', 'spain', 'germany', 'canada', 'new zealand', 'thailand',
    'vietnam', 'singapore', 'malaysia', 'indonesia', 'china', 'india',
    'south africa', 'brazil', 'mexico'
  ];

  for (const country of countries) {
    if (text.includes(country)) {
      return country.charAt(0).toUpperCase() + country.slice(1);
    }
  }

  return 'Global';
} 