import { Story } from '../../types/Story';
import { v4 as uuidv4 } from 'uuid';
import { fetchRSSFeeds } from '../../lib/rss';

/**
 * Service for fetching and processing RSS feeds
 * This avoids using Node.js-specific modules that aren't available in Edge Runtime
 */
export class RSSFeedService {
  private static instance: RSSFeedService | null = null;

  /**
   * Get the singleton instance of RSSFeedService
   * @returns The singleton instance
   */
  public static getInstance(): RSSFeedService {
    if (!RSSFeedService.instance) {
      RSSFeedService.instance = new RSSFeedService();
    }
    return RSSFeedService.instance;
  }

  /**
   * Fetch stories from RSS feeds
   * @returns A promise resolving to an array of stories
   */
  public async fetchStories(): Promise<Story[]> {
    try {
      // Use the mock implementation instead of real RSS parsing
      const stories = await fetchRSSFeeds();
      return stories;
    } catch (error) {
      console.error('Error fetching RSS feeds:', error);
      return this.getBackupStories();
    }
  }

  /**
   * Get backup stories in case of failure
   * @returns An array of backup stories
   * @private
   */
  private getBackupStories(): Story[] {
    // Return mock stories as backup
    return [
      {
        id: uuidv4(),
        slug: 'mediterranean-cruise-guide-2024',
        title: 'Mediterranean Cruise Guide 2024: Best Ports and Itineraries',
        excerpt: 'Discover the most stunning Mediterranean cruise destinations for 2024, from the sun-drenched Greek Islands to the cultural treasures of Italy and Spain.',
        content: 'Full content would go here...',
        author: 'Global Travel Report Editorial Team',
        category: 'Cruises',
        country: 'Italy',
        tags: ['mediterranean', 'cruise', 'europe', 'travel guide'],
        featured: true,
        editorsPick: true,
        publishedAt: new Date().toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&q=80&w=2400',
      },
      {
        id: uuidv4(),
        slug: 'hidden-gems-of-japan',
        title: 'Hidden Gems of Japan: Beyond Tokyo and Kyoto',
        excerpt: 'Venture off the beaten path to discover Japan\'s lesser-known but equally enchanting destinations, from the snow monkeys of Nagano to the tropical beaches of Okinawa.',
        content: 'Full content would go here...',
        author: 'Global Travel Report Editorial Team',
        category: 'Destinations',
        country: 'Japan',
        tags: ['japan', 'asia', 'off the beaten path', 'travel guide'],
        featured: true,
        editorsPick: false,
        publishedAt: new Date().toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&q=80&w=2400',
      },
    ];
  }
}
