import { Story } from '@/types/Story';
import { v4 as uuidv4 } from 'uuid';
import { rssFeedSources, categoryMappings } from '@/src/config/rssFeeds';

/**
 * RSS Feed Parser and Fetcher
 * Handles fetching and parsing RSS feeds for content automation
 */

export interface RSSItem {
  title: string;
  link: string;
  content: string;
  description?: string;
  pubDate?: string;
  author?: string;
  imageUrl?: string;
  category?: string;
}

export interface RSSFeed {
  title: string;
  items: RSSItem[];
}

/**
 * Fetch RSS feeds from configured sources
 */
export async function fetchRSSFeeds(): Promise<Story[]> {
  const stories: Story[] = [];

  try {
    console.log('Fetching RSS feeds from configured sources...');

    // For now, we'll use mock data to simulate RSS feeds
    // In production, this would fetch from actual RSS URLs
    const mockRSSItems: RSSItem[] = [
      {
        title: 'Mediterranean Cruise Season 2024: New Itineraries and Destinations',
        link: 'https://example.com/mediterranean-cruise-2024',
        content: 'The Mediterranean cruise season for 2024 promises to be exceptional with new ports of call in Croatia, Montenegro, and enhanced Greek island experiences. Major cruise lines are introducing innovative shore excursions and onboard experiences.',
        description: 'Discover the latest Mediterranean cruise offerings for 2024',
        pubDate: new Date().toISOString(),
        author: 'Cruise Industry News',
        imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&q=80&w=2400',
        category: 'Cruises'
      },
      {
        title: 'Japan\'s Hidden Gems: Beyond Tokyo and Kyoto',
        link: 'https://example.com/japan-hidden-gems',
        content: 'While Tokyo and Kyoto remain must-visit destinations, Japan offers countless hidden gems waiting to be discovered. From the snow monkeys of Nagano to the pristine beaches of Okinawa, these lesser-known spots provide authentic cultural experiences.',
        description: 'Explore Japan\'s lesser-known destinations',
        pubDate: new Date().toISOString(),
        author: 'Travel + Leisure',
        imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&q=80&w=2400',
        category: 'Destinations'
      },
      {
        title: 'Luxury Hotel Openings in Southeast Asia 2024',
        link: 'https://example.com/luxury-hotels-asia-2024',
        content: 'Southeast Asia continues to attract luxury travelers with stunning new hotel openings. From beachfront resorts in Bali to urban retreats in Singapore, these properties redefine luxury hospitality in the region.',
        description: 'New luxury hotel openings in Southeast Asia',
        pubDate: new Date().toISOString(),
        author: 'Luxury Travel Magazine',
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&q=80&w=2400',
        category: 'Hotels'
      },
      {
        title: 'European River Cruise Trends for 2024',
        link: 'https://example.com/european-river-cruises-2024',
        content: 'European river cruising is experiencing a renaissance with new ships, innovative itineraries, and enhanced experiences. From the Danube to the Rhine, discover what makes 2024 the perfect year for river exploration.',
        description: 'Latest trends in European river cruising',
        pubDate: new Date().toISOString(),
        author: 'River Cruise Advisor',
        imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&q=80&w=2400',
        category: 'Cruises'
      },
      {
        title: 'Sustainable Travel Destinations Leading the Way',
        link: 'https://example.com/sustainable-travel-2024',
        content: 'As travelers become more environmentally conscious, destinations worldwide are implementing sustainable tourism practices. From carbon-neutral resorts to community-based tourism initiatives, discover the leaders in sustainable travel.',
        description: 'Sustainable travel destinations making a difference',
        pubDate: new Date().toISOString(),
        author: 'Sustainable Travel International',
        imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&q=80&w=2400',
        category: 'Destinations'
      }
    ];

    // Convert RSS items to Story objects
    for (const item of mockRSSItems) {
      const story = await convertRSSItemToStory(item);
      if (story) {
        stories.push(story);
      }
    }

    console.log(`Successfully processed ${stories.length} stories from RSS feeds`);
    return stories;

  } catch (_error) {
    console.error('Error fetching RSS feeds:', error);

    // Return backup stories in case of failure
    return getBackupStories();
  }
}

/**
 * Convert RSS item to Story object
 */
async function convertRSSItemToStory(item: RSSItem): Promise<Story | null> {
  try {
    // Generate slug from title
    const slug = generateSlug(item.title);

    // Map category
    const category = mapCategory(item.category || '');

    // Generate excerpt from content
    const excerpt = generateExcerpt(item.content || item.description || '');

    const story: Story = {
      id: uuidv4(),
      slug,
      title: item.title.trim(),
      excerpt,
      content: item.content || item.description || '',
      author: item.author || 'Global Travel Report Editorial Team',
      category: category,
      country: 'Global', // Could be enhanced to extract from content
      tags: extractTags(item.title + ' ' + item.content),
      featured: false,
      editorsPick: false,
      publishedAt: item.pubDate || new Date().toISOString(),
      imageUrl: item.imageUrl || getDefaultImage(category),
      metaTitle: item.title.trim(),
      metaDescription: excerpt
    };

    return story;
  } catch (_error) {
    console.error('Error converting RSS item to story:', error);
    return null;
  }
}

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 50); // Limit length
}

/**
 * Generate excerpt from content
 */
function generateExcerpt(content: string, maxLength: number = 200): string {
  const cleanContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
  if (cleanContent.length <= maxLength) return cleanContent;

  return cleanContent.substring(0, maxLength).replace(/\s+\w*$/, '...');
}

/**
 * Map external category to internal category
 */
function mapCategory(externalCategory: string): string {
  return categoryMappings[externalCategory] || 'Destinations';
}

/**
 * Extract relevant tags from content
 */
function extractTags(content: string): string[] {
  const commonTags = [
    'travel', 'adventure', 'culture', 'food', 'luxury', 'budget',
    'family', 'solo', 'romantic', 'business', 'nature', 'urban',
    'cruise', 'hotel', 'flight', 'destination', 'beach', 'mountain'
  ];

  const lowerContent = content.toLowerCase();
  return commonTags.filter(tag => lowerContent.includes(tag)).slice(0, 5);
}

/**
 * Get default image based on category
 */
function getDefaultImage(category: string): string {
  const defaultImages = {
    'Cruises': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&q=80&w=2400',
    'Hotels': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&q=80&w=2400',
    'Flights': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&q=80&w=2400',
    'Destinations': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=2400',
    'Food': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&q=80&w=2400'
  };

  return defaultImages[category as keyof typeof defaultImages] || defaultImages['Destinations'];
}

/**
 * Get backup stories in case RSS feeds fail
 */
function getBackupStories(): Story[] {
  return [
    {
      id: uuidv4(),
      slug: 'mediterranean-cruise-guide-2024',
      title: 'Mediterranean Cruise Guide 2024: Best Ports and Itineraries',
      excerpt: 'Discover the most stunning Mediterranean cruise destinations for 2024, from the sun-drenched Greek Islands to the cultural treasures of Italy and Spain.',
      content: 'The Mediterranean has long been a favorite cruise destination, and 2024 promises to be an exceptional year with new ports, enhanced itineraries, and innovative onboard experiences.',
      author: 'Global Travel Report Editorial Team',
      category: 'Cruises',
      country: 'Italy',
      tags: ['mediterranean', 'cruise', 'europe', 'travel guide'],
      featured: true,
      editorsPick: true,
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&q=80&w=2400',
      metaTitle: 'Mediterranean Cruise Guide 2024',
      metaDescription: 'Complete guide to Mediterranean cruises in 2024'
    },
    {
      id: uuidv4(),
      slug: 'hidden-gems-of-japan',
      title: 'Hidden Gems of Japan: Beyond Tokyo and Kyoto',
      excerpt: 'Venture off the beaten path to discover Japan\'s lesser-known but equally enchanting destinations, from the snow monkeys of Nagano to the tropical beaches of Okinawa.',
      content: 'While Tokyo and Kyoto remain must-visit destinations, Japan offers countless hidden gems waiting to be discovered.',
      author: 'Global Travel Report Editorial Team',
      category: 'Destinations',
      country: 'Japan',
      tags: ['japan', 'asia', 'off the beaten path', 'travel guide'],
      featured: true,
      editorsPick: false,
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&q=80&w=2400',
      metaTitle: 'Hidden Gems of Japan',
      metaDescription: 'Discover Japan\'s lesser-known destinations'
    }
  ];
}