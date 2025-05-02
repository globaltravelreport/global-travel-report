import { Story } from '@/types/Story';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for fetching and processing RSS feeds
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
      // Use fetch API instead of RSS parser library for server compatibility
      const stories = await this.fetchFromAllSources();
      return stories;
    } catch (error) {
      console.error('Error fetching RSS feeds:', error);
      return this.getBackupStories();
    }
  }

  /**
   * Fetch stories from all configured sources
   * @returns A promise resolving to an array of stories
   * @private
   */
  private async fetchFromAllSources(): Promise<Story[]> {
    // General travel feeds
    const generalFeeds = [
      'https://www.lonelyplanet.com/blog/feed/',
      'https://www.travelandleisure.com/rss/all.xml',
      'https://www.afar.com/feed',
      'https://www.cntraveler.com/feed/rss',
    ];
    
    // Cruise-specific feeds
    const cruiseFeeds = [
      'https://www.cruisecritic.com/news/xml/',
      'https://www.cruiseradio.net/feed/',
      'https://www.cruisehive.com/feed',
    ];
    
    // Combine all feeds
    const feeds = [...generalFeeds, ...cruiseFeeds];
    
    const allStories: Story[] = [];
    
    // Process each feed
    for (const feedUrl of feeds) {
      try {
        const stories = await this.fetchAndParseFeed(feedUrl);
        allStories.push(...stories);
      } catch (error) {
        console.error(`Error fetching feed ${feedUrl}:`, error);
        // Continue with other feeds
      }
    }
    
    return allStories;
  }

  /**
   * Fetch and parse a single RSS feed
   * @param feedUrl - The URL of the RSS feed
   * @returns A promise resolving to an array of stories
   * @private
   */
  private async fetchAndParseFeed(feedUrl: string): Promise<Story[]> {
    try {
      // Fetch the RSS feed
      const response = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Global Travel Report/1.0',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.statusText}`);
      }
      
      const xml = await response.text();
      
      // Parse the XML using DOMParser in the browser
      // or a simple regex-based approach for server compatibility
      const stories = this.parseXML(xml, feedUrl);
      
      return stories;
    } catch (error) {
      console.error(`Error fetching feed ${feedUrl}:`, error);
      return [];
    }
  }

  /**
   * Parse XML content into stories
   * @param xml - The XML content to parse
   * @param feedUrl - The URL of the feed (for reference)
   * @returns An array of stories
   * @private
   */
  private parseXML(xml: string, feedUrl: string): Story[] {
    const stories: Story[] = [];
    
    try {
      // Extract items using regex for server compatibility
      // This is a simplified approach - in production, you might want to use a proper XML parser
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      const titleRegex = /<title>([\s\S]*?)<\/title>/;
      const linkRegex = /<link>([\s\S]*?)<\/link>/;
      const descriptionRegex = /<description>([\s\S]*?)<\/description>/;
      const contentRegex = /<content:encoded>([\s\S]*?)<\/content:encoded>/;
      const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;
      const categoryRegex = /<category>([\s\S]*?)<\/category>/g;
      
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const itemContent = match[1];
        
        // Extract basic information
        const titleMatch = titleRegex.exec(itemContent);
        const linkMatch = linkRegex.exec(itemContent);
        const descriptionMatch = descriptionRegex.exec(itemContent);
        const contentMatch = contentRegex.exec(itemContent);
        const pubDateMatch = pubDateRegex.exec(itemContent);
        
        // Skip if required fields are missing
        if (!titleMatch || !linkMatch) continue;
        
        // Extract categories
        const categories: string[] = [];
        let categoryMatch;
        while ((categoryMatch = categoryRegex.exec(itemContent)) !== null) {
          categories.push(categoryMatch[1]);
        }
        
        // Create a story object
        const title = this.cleanHtml(titleMatch[1]);
        const link = linkMatch[1];
        const description = descriptionMatch ? this.cleanHtml(descriptionMatch[1]) : '';
        const content = contentMatch ? this.cleanHtml(contentMatch[1]) : description;
        const pubDate = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();
        
        const story: Story = {
          id: uuidv4(),
          slug: this.generateSlug(title),
          title,
          excerpt: description.slice(0, 200),
          content,
          author: 'Global Travel Report Editorial Team',
          category: this.determineCategory(categories),
          country: this.determineCountry(title, content),
          tags: categories,
          featured: false,
          editorsPick: false,
          publishedAt: pubDate.toISOString(),
          imageUrl: this.extractImageUrl(content) || '',
        };
        
        stories.push(story);
      }
    } catch (error) {
      console.error(`Error parsing XML from ${feedUrl}:`, error);
    }
    
    return stories;
  }

  /**
   * Clean HTML content
   * @param html - The HTML content to clean
   * @returns Cleaned HTML content
   * @private
   */
  private cleanHtml(html: string): string {
    return html
      .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .trim();
  }

  /**
   * Extract image URL from content
   * @param content - The content to extract image URL from
   * @returns The extracted image URL, or null if not found
   * @private
   */
  private extractImageUrl(content: string): string | null {
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    const match = imgRegex.exec(content);
    return match ? match[1] : null;
  }

  /**
   * Generate a slug from a title
   * @param title - The title to generate slug from
   * @returns The generated slug
   * @private
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Determine category from tags
   * @param categories - The categories to determine from
   * @returns The determined category
   * @private
   */
  private determineCategory(categories: string[]): string {
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

  /**
   * Determine country from content
   * @param title - The title to determine country from
   * @param content - The content to determine country from
   * @returns The determined country
   * @private
   */
  private determineCountry(title: string, content: string): string {
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
        imageUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
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
        imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      },
    ];
  }
}
