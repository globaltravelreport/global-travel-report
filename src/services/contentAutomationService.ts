/**
 * Content Automation Service
 *
 * Comprehensive system for automatically ingesting, processing, and managing travel content
 * from RSS feeds, APIs, and other sources with quality validation and manual override capabilities.
 */

import { Story } from '@/types/Story';
import { StoryDatabase } from './storyDatabase';
import { RSSFeedService } from './rssFeedService';
import { v4 as uuidv4 } from 'uuid';

export interface ContentIngestionConfig {
  enableAutoIngestion: boolean;
  maxStoriesPerDay: number;
  qualityThreshold: number;
  requireManualApproval: boolean;
  autoRefreshSchedule: string; // cron expression
}

export interface ContentQualityMetrics {
  relevanceScore: number;
  readabilityScore: number;
  completenessScore: number;
  uniquenessScore: number;
  overallScore: number;
}

export interface IngestedContentResult {
  success: boolean;
  storiesIngested: number;
  storiesRejected: number;
  storiesDuplicates: number;
  errors: string[];
  qualityReport: Record<string, ContentQualityMetrics>;
}

export class ContentAutomationService {
  private static instance: ContentAutomationService | null = null;
  private db: StoryDatabase;
  private rssService: RSSFeedService;
  private config: ContentIngestionConfig;

  private constructor() {
    this.db = StoryDatabase.getInstance();
    this.rssService = RSSFeedService.getInstance();
    this.config = {
      enableAutoIngestion: true,
      maxStoriesPerDay: 5,
      qualityThreshold: 0.7,
      requireManualApproval: false,
      autoRefreshSchedule: '0 9 * * 1,3,5' // Mon, Wed, Fri at 9 AM
    };
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ContentAutomationService {
    if (!ContentAutomationService.instance) {
      ContentAutomationService.instance = new ContentAutomationService();
    }
    return ContentAutomationService.instance;
  }

  /**
   * Configure the content automation service
   */
  public configure(config: Partial<ContentIngestionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Manually ingest content from RSS feeds
   */
  public async ingestContent(sourceUrls?: string[]): Promise<IngestedContentResult> {
    const result: IngestedContentResult = {
      success: false,
      storiesIngested: 0,
      storiesRejected: 0,
      storiesDuplicates: 0,
      errors: [],
      qualityReport: {}
    };

    try {
      console.log('Starting content ingestion process...');

      // Fetch stories from RSS feeds
      const rawStories = await this.rssService.fetchStories();

      if (!rawStories || rawStories.length === 0) {
        result.errors.push('No stories fetched from RSS feeds');
        return result;
      }

      console.log(`Fetched ${rawStories.length} raw stories from feeds`);

      // Process and validate each story
      for (const rawStory of rawStories.slice(0, this.config.maxStoriesPerDay)) {
        try {
          const processedStory = await this.processStory(rawStory);

          if (processedStory) {
            const quality = this.assessContentQuality(processedStory);

            if (quality.overallScore >= this.config.qualityThreshold) {
              // Store the story
              await this.db.addStory(processedStory);
              result.storiesIngested++;
              result.qualityReport[processedStory.id] = quality;
              console.log(`Ingested story: ${processedStory.title} (Quality: ${quality.overallScore.toFixed(2)}, ID: ${processedStory.id})`);
            } else {
              result.storiesRejected++;
              console.log(`Rejected story: ${processedStory.title} (Quality: ${quality.overallScore.toFixed(2)} below threshold ${this.config.qualityThreshold})`);
            }
          } else {
            result.storiesRejected++;
          }
        } catch (_error) {
          console.error(_error);
          result.errors.push(`Failed to process story: ${_error instanceof Error ? _error.message : 'Unknown error'}`);
        }
      }

      result.success = result.errors.length === 0;
      console.log(`Content ingestion completed. Ingested: ${result.storiesIngested}, Rejected: ${result.storiesRejected}`);

      return result;

    } catch (_error) {
      console.error(_error);
      result.errors.push(`Ingestion failed: ${_error instanceof Error ? _error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
    * Process a raw story into a structured Story object with enhanced safeguards
    */
  private async processStory(rawStory: any): Promise<Story | null> {
    try {
      // Validate required fields
      if (!rawStory.title || !rawStory.content) {
        console.log('Story missing required fields:', rawStory.title);
        return null;
      }

      // Generate unique ID from feed GUID or URL hash
      const uniqueId = this.generateUniqueId(rawStory);

      // Check for duplicates using multiple methods
      const duplicateCheck = await this.checkForDuplicates(rawStory, uniqueId);
      if (duplicateCheck.isDuplicate) {
        console.log('Duplicate story found:', rawStory.title, '- Reason:', duplicateCheck.reason);
        return null;
      }

      // Generate slug from title
      const slug = this.generateSlug(rawStory.title);

      // Extract metadata
      const category = this.inferCategory(rawStory);
      const country = this.inferCountry(rawStory);
      const tags = this.extractTags(rawStory);

      // Preserve original published date, never overwrite with today's date
      const originalPublishedAt = this.preserveOriginalDate(rawStory.publishedAt);
      const firstSeenAt = new Date().toISOString(); // When we first ingested this

      // Create processed story with enhanced fields
      const processedStory: Story = {
        id: uniqueId,
        slug,
        title: rawStory.title.trim(),
        excerpt: this.generateExcerpt(rawStory.content),
        content: rawStory.content.trim(),
        author: rawStory.author || 'Global Travel Report Editorial Team',
        category: category || 'Destinations',
        country: country || 'Global',
        tags: tags,
        featured: false, // Manual override required
        editorsPick: false, // Manual override required
        publishedAt: originalPublishedAt,
        imageUrl: rawStory.imageUrl || this.getDefaultImage(category),
        metaTitle: rawStory.title.trim(),
        metaDescription: this.generateExcerpt(rawStory.content, 150),
        // Enhanced fields for better tracking
        firstSeenAt,
        originalPublishedAt,
        ingestionSource: rawStory.feedUrl || 'unknown',
        contentHash: this.generateContentHash(rawStory),
        wordCount: this.countWords(rawStory.content)
      };

      return processedStory;

    } catch (_error) {
      console.error(_error);
      return null;
    }
  }

  /**
   * Assess content quality metrics
   */
  private assessContentQuality(story: Story): ContentQualityMetrics {
    const relevanceScore = this.calculateRelevanceScore(story);
    const readabilityScore = this.calculateReadabilityScore(story);
    const completenessScore = this.calculateCompletenessScore(story);
    const uniquenessScore = this.calculateUniquenessScore(story);

    const overallScore = (
      relevanceScore * 0.3 +
      readabilityScore * 0.25 +
      completenessScore * 0.25 +
      uniquenessScore * 0.2
    );

    return {
      relevanceScore,
      readabilityScore,
      completenessScore,
      uniquenessScore,
      overallScore
    };
  }

  /**
   * Calculate relevance score based on travel-related keywords and context
   */
  private calculateRelevanceScore(story: Story): number {
    const travelKeywords = [
      'travel', 'trip', 'journey', 'vacation', 'holiday', 'destination',
      'hotel', 'resort', 'cruise', 'flight', 'airport', 'tour', 'guide',
      'adventure', 'explore', 'discover', 'visit', 'experience'
    ];

    const content = `${story.title} ${story.excerpt} ${story.content}`.toLowerCase();
    const matches = travelKeywords.filter(keyword => content.includes(keyword.toLowerCase()));

    return Math.min(matches.length / 5, 1.0); // Normalize to 0-1 scale
  }

  /**
   * Calculate readability score based on content structure
   */
  private calculateReadabilityScore(story: Story): number {
    const content = story.content;

    // Check for proper sentence structure
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;

    // Check for paragraph structure
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);

    // Score based on content length and structure
    const lengthScore = Math.min(content.length / 1000, 1.0);
    const sentenceScore = avgSentenceLength > 20 && avgSentenceLength < 100 ? 1.0 : 0.5;
    const paragraphScore = paragraphs.length >= 3 ? 1.0 : 0.5;

    return (lengthScore + sentenceScore + paragraphScore) / 3;
  }

  /**
   * Calculate completeness score
   */
  private calculateCompletenessScore(story: Story): number {
    let score = 0;

    if (story.title && story.title.length > 10) score += 0.2;
    if (story.excerpt && story.excerpt.length > 50) score += 0.2;
    if (story.content && story.content.length > 300) score += 0.3;
    if (story.imageUrl) score += 0.1;
    if (story.tags && story.tags.length > 0) score += 0.1;
    if (story.category) score += 0.1;

    return score;
  }

  /**
   * Calculate uniqueness score (placeholder - would need content comparison)
   */
  private calculateUniquenessScore(story: Story): number {
    // For now, assume all ingested content is unique
    // In production, this would compare against existing content
    return 0.8;
  }

  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
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
  private generateExcerpt(content: string, maxLength: number = 200): string {
    const cleanContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    if (cleanContent.length <= maxLength) return cleanContent;

    return cleanContent.substring(0, maxLength).replace(/\s+\w*$/, '...');
  }

  /**
   * Infer category from story content
   */
  private inferCategory(story: any): string {
    const content = `${story.title} ${story.content}`.toLowerCase();

    const categoryKeywords = {
      'Cruises': ['cruise', 'ship', 'voyage', 'ocean liner', 'cruising'],
      'Hotels': ['hotel', 'resort', 'accommodation', 'lodging', 'hospitality'],
      'Flights': ['flight', 'airline', 'airport', 'aviation', 'airplane'],
      'Destinations': ['destination', 'city', 'country', 'travel guide', 'explore'],
      'Food': ['restaurant', 'cuisine', 'dining', 'food', 'culinary']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return category;
      }
    }

    return 'Destinations'; // Default category
  }

  /**
   * Infer country from story content
   */
  private inferCountry(story: any): string {
    const content = `${story.title} ${story.content}`.toLowerCase();

    // Simple country detection (could be enhanced with NLP)
    const countries = ['France', 'Japan', 'Italy', 'Spain', 'Greece', 'Thailand', 'Australia', 'USA', 'UK', 'Canada'];

    for (const country of countries) {
      if (content.includes(country.toLowerCase())) {
        return country;
      }
    }

    return 'Global';
  }

  /**
   * Extract relevant tags from content
   */
  private extractTags(story: any): string[] {
    const content = `${story.title} ${story.content}`.toLowerCase();
    const commonTags = [
      'travel', 'adventure', 'culture', 'food', 'luxury', 'budget',
      'family', 'solo', 'romantic', 'business', 'nature', 'urban'
    ];

    return commonTags.filter(tag => content.includes(tag)).slice(0, 5);
  }

  /**
    * Generate unique ID from feed GUID or URL hash
    */
  private generateUniqueId(rawStory: any): string {
    // Use feed GUID if available (most reliable)
    if (rawStory.guid) {
      return `feed-${this.hashString(rawStory.guid)}`;
    }

    // Use URL hash if available
    if (rawStory.url || rawStory.link) {
      return `url-${this.hashString(rawStory.url || rawStory.link)}`;
    }

    // Fallback to content hash
    return `content-${this.generateContentHash(rawStory)}`;
  }

  /**
    * Check for duplicates using multiple methods
    */
  private async checkForDuplicates(rawStory: any, uniqueId: string): Promise<{isDuplicate: boolean, reason: string}> {
    // Check by unique ID first
    const existingById = await this.db.getStoryById(uniqueId);
    if (existingById) {
      return { isDuplicate: true, reason: 'ID already exists' };
    }

    // Check by URL if available
    if (rawStory.url || rawStory.link) {
      const url = rawStory.url || rawStory.link;
      const allStories = await this.db.getAllStories();
      const existingByUrl = allStories.find(story =>
        story.sourceUrl === url || story.ingestionSource === url
      );
      if (existingByUrl) {
        return { isDuplicate: true, reason: 'URL already exists' };
      }
    }

    // Check by content hash
    const contentHash = this.generateContentHash(rawStory);
    const allStories = await this.db.getAllStories();
    const existingByContent = allStories.find(story => story.contentHash === contentHash);
    if (existingByContent) {
      return { isDuplicate: true, reason: 'Content already exists' };
    }

    return { isDuplicate: false, reason: 'No duplicate found' };
  }

  /**
    * Preserve original published date, never overwrite with today's date
    */
  private preserveOriginalDate(publishedAt: any): string {
    if (!publishedAt) {
      return new Date().toISOString();
    }

    // If it's already a valid date string, preserve it
    if (typeof publishedAt === 'string') {
      const date = new Date(publishedAt);
      if (!isNaN(date.getTime())) {
        return publishedAt;
      }
    }

    // If it's a Date object, convert to ISO string
    if (publishedAt instanceof Date) {
      return publishedAt.toISOString();
    }

    // If it's a timestamp, convert it
    if (typeof publishedAt === 'number') {
      return new Date(publishedAt).toISOString();
    }

    // Fallback to current date if invalid
    console.warn('Invalid published date, using current date:', publishedAt);
    return new Date().toISOString();
  }

  /**
    * Generate content hash for duplicate detection
    */
  private generateContentHash(rawStory: any): string {
    const content = `${rawStory.title || ''}${rawStory.content || ''}${rawStory.excerpt || ''}`;
    return this.hashString(content);
  }

  /**
    * Simple hash function for generating unique IDs
    */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
    * Count words in content
    */
  private countWords(content: string): number {
    if (!content) return 0;
    return content.trim().split(/\s+/).length;
  }

  /**
    * Get default image based on category
    */
  private getDefaultImage(category: string): string {
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
   * Set featured story manually (admin override)
   */
  public async setFeaturedStory(storyId: string): Promise<boolean> {
    try {
      // Remove featured flag from all stories
      const allStories = await this.db.getAllStories();
      for (const story of allStories) {
        if (story.featured) {
          await this.db.updateStory(story.id, { featured: false });
        }
      }

      // Set the new featured story
      await this.db.updateStory(storyId, { featured: true });
      console.log(`Set story ${storyId} as featured`);
      return true;
    } catch (_error) {
      console.error(_error);
      return false;
    }
  }

  /**
   * Set editor's pick stories manually
   */
  public async setEditorsPicks(storyIds: string[]): Promise<boolean> {
    try {
      // Remove editor's pick flag from all stories
      const allStories = await this.db.getAllStories();
      for (const story of allStories) {
        if (story.editorsPick) {
          await this.db.updateStory(story.id, { editorsPick: false });
        }
      }

      // Set the new editor's picks
      for (const storyId of storyIds) {
        await this.db.updateStory(storyId, { editorsPick: true });
      }

      console.log(`Set ${storyIds.length} stories as editor's picks`);
      return true;
    } catch (_error) {
      console.error(_error);
      return false;
    }
  }

  /**
   * Get content automation statistics
   */
  public async getAutomationStats(): Promise<{
    totalStories: number;
    storiesThisWeek: number;
    averageQualityScore: number;
    lastIngestion: Date | null;
  }> {
    try {
      const allStories = await this.db.getAllStories();
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const storiesThisWeek = allStories.filter(story =>
        new Date(story.publishedAt) >= oneWeekAgo
      );

      const qualityScores = allStories.map(story => {
        const quality = this.assessContentQuality(story);
        return quality.overallScore;
      });

      const averageQualityScore = qualityScores.length > 0
        ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
        : 0;

      return {
        totalStories: allStories.length,
        storiesThisWeek: storiesThisWeek.length,
        averageQualityScore,
        lastIngestion: allStories.length > 0 ? new Date(allStories[0].publishedAt) : null
      };
    } catch (_error) {
      console.error(_error);
      return {
        totalStories: 0,
        storiesThisWeek: 0,
        averageQualityScore: 0,
        lastIngestion: null
      };
    }
  }
}