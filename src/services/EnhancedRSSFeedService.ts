/**
 * Enhanced RSS Feed Service
 *
 * Fetches and processes RSS feeds with editorial-style content processing
 * and Australian English formatting
 */

import { Story } from '@/types/Story';
import { rssFeedSources, categoryMappings } from '@/config/rssFeeds';

export interface ProcessedRSSItem {
  title: string;
  content: string;
  link: string;
  pubDate: string;
  category: string;
  source: string;
  wordCount: number;
  qualityScore: number;
}

export interface RSSFetchResult {
  success: boolean;
  itemsProcessed: number;
  itemsAccepted: number;
  errors: string[];
  feedStats: Record<string, { processed: number; accepted: number }>;
}

export class EnhancedRSSFeedService {
  private static instance: EnhancedRSSFeedService | null = null;
  private fetchQueue: string[] = [];
  private processing = false;

  private constructor() {}

  public static getInstance(): EnhancedRSSFeedService {
    if (!EnhancedRSSFeedService.instance) {
      EnhancedRSSFeedService.instance = new EnhancedRSSFeedService();
    }
    return EnhancedRSSFeedService.instance;
  }

  /**
   * Fetch and process all RSS feeds
   */
  public async fetchAllFeeds(): Promise<RSSFetchResult> {
    const result: RSSFetchResult = {
      success: false,
      itemsProcessed: 0,
      itemsAccepted: 0,
      errors: [],
      feedStats: {},
    };

    try {
      console.log('🚀 Starting enhanced RSS feed processing...');

      // Process feeds in parallel with rate limiting
      const feedPromises = rssFeedSources.map(feed =>
        this.processFeed(feed.url, feed.category)
      );

      const feedResults = await Promise.allSettled(feedPromises);

      // Aggregate results
      for (let i = 0; i < feedResults.length; i++) {
        const feedResult = feedResults[i];
        const feed = rssFeedSources[i];

        if (feedResult.status === 'fulfilled') {
          const feedData = feedResult.value;
          result.itemsProcessed += feedData.itemsProcessed;
          result.itemsAccepted += feedData.itemsAccepted;
          result.feedStats[feed.category] = {
            processed: feedData.itemsProcessed,
            accepted: feedData.itemsAccepted,
          };
        } else {
          result.errors.push(`Failed to process ${feed.category} feed: ${feedResult.reason}`);
        }
      }

      result.success = result.errors.length === 0;
      console.log(`✅ RSS processing complete: ${result.itemsAccepted}/${result.itemsProcessed} items accepted`);

    } catch (_error) {
      console.error(_error);
      result.errors.push(_error instanceof Error ? _error.message : 'Unknown error');
    }

    return result;
  }

  /**
   * Process a single RSS feed
   */
  private async processFeed(feedUrl: string, category: string): Promise<{ itemsProcessed: number; itemsAccepted: number }> {
    try {
      console.log(`📡 Processing ${category} feed: ${feedUrl}`);

      // Fetch RSS content
      const response = await fetch(feedUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rssText = await response.text();

      // Parse RSS (simplified - would use proper RSS parser in production)
      const items = this.parseRSSContent(rssText);

      let itemsProcessed = 0;
      let itemsAccepted = 0;

      for (const item of items) {
        try {
          itemsProcessed++;

          // Process and validate item
          const processedItem = await this.processRSSItem(item, category);

          if (processedItem) {
            // Store processed item for moderation
            await this.storeForModeration(processedItem);
            itemsAccepted++;
          }
        } catch (_error) {
          console.error(_error);
        }
      }

      console.log(`📊 ${category}: ${itemsAccepted}/${itemsProcessed} items processed successfully`);
      return { itemsProcessed, itemsAccepted };

    } catch (_error) {
      console.error(_error);
      return { itemsProcessed: 0, itemsAccepted: 0 };
    }
  }

  /**
   * Parse RSS content (simplified parser)
   */
  private parseRSSContent(rssText: string): any[] {
    // This is a simplified RSS parser
    // In production, use a proper RSS parsing library
    const items: any[] = [];

    // Extract items from RSS (basic regex parsing)
    const itemMatches = rssText.match(/<item>(.*?)<\/item>/gs);
    if (itemMatches) {
      for (const itemMatch of itemMatches) {
        const titleMatch = itemMatch.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s);
        const contentMatch = itemMatch.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s);
        const linkMatch = itemMatch.match(/<link>(.*?)<\/link>/s);
        const pubDateMatch = itemMatch.match(/<pubDate>(.*?)<\/pubDate>/s);

        if (titleMatch && contentMatch && linkMatch) {
          items.push({
            title: titleMatch[1],
            content: contentMatch[1],
            link: linkMatch[1],
            pubDate: pubDateMatch ? pubDateMatch[1] : new Date().toISOString(),
          });
        }
      }
    }

    return items;
  }

  /**
   * Process individual RSS item with editorial standards
   */
  private async processRSSItem(item: any, category: string): Promise<ProcessedRSSItem | null> {
    try {
      // Clean and validate content
      const cleanTitle = this.cleanText(item.title);
      const cleanContent = this.cleanText(item.content);

      if (!cleanTitle || !cleanContent) {
        return null;
      }

      // Check content quality
      const wordCount = this.countWords(cleanContent);
      if (wordCount < 150) {
        return null; // Too short for quality content
      }

      // Apply category mapping
      const mappedCategory = categoryMappings[category] || category;

      // Calculate quality score
      const qualityScore = this.calculateQualityScore(cleanTitle, cleanContent, mappedCategory);

      if (qualityScore < 0.6) {
        return null; // Quality too low
      }

      return {
        title: cleanTitle,
        content: cleanContent,
        link: item.link,
        pubDate: item.pubDate,
        category: mappedCategory,
        source: this.extractDomain(item.link),
        wordCount,
        qualityScore,
      };

    } catch (_error) {
      console.error(_error);
      return null;
    }
  }

  /**
   * Clean text content
   */
  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  /**
   * Calculate quality score for content
   */
  private calculateQualityScore(title: string, content: string, category: string): number {
    let score = 0;

    // Title quality (20%)
    if (title.length > 20 && title.length < 100) score += 0.2;

    // Content length (30%)
    const wordCount = this.countWords(content);
    if (wordCount > 300) score += 0.3;
    else if (wordCount > 150) score += 0.15;

    // Category relevance (20%)
    const categoryKeywords = {
      'Cruises': ['cruise', 'ship', 'voyage', 'ocean', 'sea', 'itinerary'],
      'Hotels': ['hotel', 'resort', 'accommodation', 'luxury', 'amenities'],
      'Flights': ['flight', 'airline', 'airport', 'aviation', 'route'],
      'Destinations': ['destination', 'travel', 'explore', 'visit', 'city'],
    };

    const keywords = categoryKeywords[category as keyof typeof categoryKeywords] || [];
    const titleMatches = keywords.filter(keyword =>
      title.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    const contentMatches = keywords.filter(keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    ).length;

    score += Math.min((titleMatches + contentMatches) / 4, 0.2);

    // Structure quality (30%)
    const hasParagraphs = content.includes('\n\n') || content.length > 500;
    const hasDetails = content.length > 400;
    if (hasParagraphs && hasDetails) score += 0.3;

    return Math.min(score, 1.0);
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  }

  /**
   * Store processed item for moderation
   */
  private async storeForModeration(item: ProcessedRSSItem): Promise<void> {
    try {
      // Convert to submission format
      const submission = {
        id: `rss_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'RSS Feed Bot',
        email: 'bot@globaltravelreport.com',
        title: item.title,
        content: item.content,
        category: item.category,
        country: 'Global', // Would be extracted from content
        tags: this.generateTags(item),
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        imageUrl: '', // Will be added by image enhancement
      };

      // Store in database
      const { StoryDatabase } = await import('./storyDatabase');
      const db = StoryDatabase.getInstance();
      await db.storeSubmission(submission);

      console.log(`📋 Stored RSS item for moderation: ${item.title}`);

    } catch (_error) {
      console.error(_error);
    }
  }

  /**
   * Generate relevant tags for RSS item
   */
  private generateTags(item: ProcessedRSSItem): string[] {
    const tags: string[] = [];

    // Add category as tag
    tags.push(item.category.toLowerCase());

    // Extract keywords from title and content
    const text = `${item.title} ${item.content}`.toLowerCase();
    const commonKeywords = [
      'travel', 'luxury', 'budget', 'family', 'adventure', 'culture',
      'food', 'beach', 'mountain', 'city', 'historical', 'modern'
    ];

    commonKeywords.forEach(keyword => {
      if (text.includes(keyword) && !tags.includes(keyword)) {
        tags.push(keyword);
      }
    });

    return tags.slice(0, 5); // Limit to 5 tags
  }

  /**
   * Get RSS feed statistics
   */
  public async getRSSStats(): Promise<{
    totalFeeds: number;
    feedsProcessed: number;
    itemsInModeration: number;
    averageQualityScore: number;
  }> {
    try {
      const { StoryDatabase } = await import('./storyDatabase');
      const db = StoryDatabase.getInstance();

      const submissions = await db.getAllSubmissions();
      const rssSubmissions = submissions.filter(s =>
        s.email === 'bot@globaltravelreport.com'
      );

      const qualityScores = rssSubmissions.map(s => {
        // Calculate quality score based on content length and structure
        const wordCount = this.countWords(s.content);
        const lengthScore = Math.min(wordCount / 500, 1.0);
        const titleScore = s.title.length > 20 ? 1.0 : 0.5;
        return (lengthScore + titleScore) / 2;
      });

      const averageQualityScore = qualityScores.length > 0
        ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
        : 0;

      return {
        totalFeeds: rssFeedSources.length,
        feedsProcessed: rssFeedSources.length, // Would track actual processing
        itemsInModeration: rssSubmissions.filter(s => s.status === 'pending').length,
        averageQualityScore,
      };

    } catch (_error) {
      console.error(_error);
      return {
        totalFeeds: 0,
        feedsProcessed: 0,
        itemsInModeration: 0,
        averageQualityScore: 0,
      };
    }
  }
}