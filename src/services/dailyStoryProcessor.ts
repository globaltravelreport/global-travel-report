/* eslint-disable no-console */
// Define default story rewrite config
const storyRewriteConfig = {
  categoryDistribution: {
    cruise: 3,
    other: 7
  },
  categories: {
    cruise: ['Cruise', 'Ocean Cruises', 'River Cruises', 'Luxury Cruises'],
    other: ['Adventure', 'Luxury', 'Budget', 'Family', 'Solo', 'Culinary', 'Cultural']
  },
  preserveTags: true,
  maintainTone: true,
  publishing: {
    intervalMinutes: 60
  }
};
import { Story } from '@/types/Story';
import { IStoryProcessor, IStoryRewriter, IStoryValidator } from './interfaces';
import config from '@/src/config';

// Simple logger for now - could be replaced with a proper logging system
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args)
};

/**
 * Custom error class for story processing errors
 */
export class DailyStoryProcessorError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'DailyStoryProcessorError';
  }
}

/**
 * Service for processing daily stories
 * Uses dependency injection for better testability
 */
export class DailyStoryProcessor implements IStoryProcessor {
  private processingQueue: Story[] = [];
  private isProcessing: boolean = false;
  private processedStories: Story[] = [];
  private dailyStoriesProcessed: number = 0;
  private readonly maxDailyStories: number;
  private readonly minTimeBetweenStories: number; // 1 minute
  private lastProcessedTime: Date | null = null;
  private static instance: DailyStoryProcessor | null = null;

  /**
   * Constructor with dependency injection
   * @param storyRewriter - The story rewriter service
   * @param storyValidator - The story validator service (optional)
   */
  constructor(
    private readonly storyRewriter: IStoryRewriter,
    private readonly storyValidator?: IStoryValidator
  ) {
    // Default values since config doesn't have storyRewrite property
    this.maxDailyStories = 10; // Default daily limit
    this.minTimeBetweenStories = 60 * 1000; // 1 minute
  }

  /**
   * Get the singleton instance of DailyStoryProcessor
   * @returns The singleton instance
   */
  public static getInstance(): DailyStoryProcessor {
    if (!DailyStoryProcessor.instance) {
      // Create a mock implementation for the edge runtime
      const mockStoryRewriter: IStoryRewriter = {
        rewrite: async (content: string, category: string, options?: any) => {
          // Simple mock implementation
          return {
            id: `story-${Date.now()}`,
            title: `Generated Story ${Date.now()}`,
            slug: `generated-story-${Date.now()}`,
            excerpt: 'This is a generated story excerpt.',
            content: content,
            author: 'AI Writer',
            category: category || 'General',
            country: 'Global',
            tags: ['generated', 'ai'],
            publishedAt: new Date().toISOString(),
            featured: false,
            editorsPick: false,
          } as Story;
        }
      };

      DailyStoryProcessor.instance = new DailyStoryProcessor(mockStoryRewriter);
    }

    return DailyStoryProcessor.instance;
  }

  /**
   * Factory method to create a new DailyStoryProcessor
   * @param storyRewriter - The story rewriter service
   * @param storyValidator - The story validator service (optional)
   * @returns A new DailyStoryProcessor instance
   */
  public static create(
    storyRewriter: IStoryRewriter,
    storyValidator?: IStoryValidator
  ): DailyStoryProcessor {
    return new DailyStoryProcessor(storyRewriter, storyValidator);
  }

  public async processDailyStories(): Promise<void> {
    if (this.isProcessing) {
      throw new DailyStoryProcessorError('Story processing already in progress');
    }

    try {
      this.isProcessing = true;
      this.processedStories = []; // Reset processed stories
      this.resetDailyCount();

      // Process cruise stories first (priority)
      await this.processCategoryStories('cruise', storyRewriteConfig.categoryDistribution.cruise);

      // Process other categories
      await this.processCategoryStories('other', storyRewriteConfig.categoryDistribution.other);

      // Schedule the stories for publishing
      await this.scheduleStoriesForPublishing();

    } catch (error) {
      throw new DailyStoryProcessorError('Error processing daily stories', error);
    } finally {
      this.isProcessing = false;
    }
  }

  public async getProcessedStories(): Promise<Story[]> {
    return this.processedStories;
  }

  /**
   * Process stories for a specific category type
   * @param categoryType - The category type ('cruise' or 'other')
   * @param count - The number of stories to process
   * @returns Promise that resolves when processing is complete
   * @private
   */
  private async processCategoryStories(categoryType: 'cruise' | 'other', count: number): Promise<void> {
    const categories = storyRewriteConfig.categories[categoryType];

    for (let i = 0; i < count; i++) {
      if (!this.canProcessMoreStories()) {
        throw new DailyStoryProcessorError('Daily story limit reached');
      }

      try {
        // Select a random category from the appropriate list
        const category = categories[Math.floor(Math.random() * categories.length)];

        // Get original content (this would be replaced with actual content fetching)
        const originalContent = await this.getOriginalContent(category);

        // Rewrite the story
        const rewrittenStory = await this.storyRewriter.rewrite(
          originalContent,
          category,
          {
            preserveTags: storyRewriteConfig.preserveTags,
            maintainTone: storyRewriteConfig.maintainTone
          }
        );

        if (!rewrittenStory) {
          logger.error(`Failed to rewrite story for category: ${category}`);
          continue;
        }

        // Validate the story if validator is available
        if (this.storyValidator && rewrittenStory as Story) {
          const validationResult = await this.storyValidator.validate(rewrittenStory as Story);

          if (!validationResult.isValid) {
            logger.warn(`Story validation failed: ${validationResult.issues.join(', ')}`);
            // You could implement retry logic here or skip the story
          }
        }

        // Add to processing queue and processed stories
        this.processingQueue.push(rewrittenStory as Story);
        this.processedStories.push(rewrittenStory as Story);

        // Track processing stats
        this.dailyStoriesProcessed++;
        this.lastProcessedTime = new Date();
      } catch (error) {
        logger.error(`Error processing story for category ${categoryType}:`, error);
        // Continue with the next story instead of failing the entire batch
      }
    }
  }

  /**
   * Schedule stories for publishing at intervals
   * @returns Promise that resolves when scheduling is complete
   * @private
   */
  private async scheduleStoriesForPublishing(): Promise<void> {
    const interval = storyRewriteConfig.publishing.intervalMinutes * 60 * 1000; // Convert to milliseconds
    const totalStories = this.processingQueue.length;

    logger.info(`Scheduling ${totalStories} stories for publishing at ${interval / 60000} minute intervals`);

    for (let i = 0; i < totalStories; i++) {
      try {
        const story = this.processingQueue[i];
        const publishTime = new Date(Date.now() + (i * interval));

        // Schedule the story for publishing
        await this.scheduleStoryPublishing(story, publishTime);

        logger.info(`Scheduled story "${story.title}" for publishing at ${publishTime.toISOString()}`);
      } catch (error) {
        logger.error(`Error scheduling story at index ${i}:`, error);
      }
    }
  }

  /**
   * Get original content for a category
   * @param category - The category to get content for
   * @returns Promise resolving to the original content
   * @private
   */
  private async getOriginalContent(category: string): Promise<string> {
    // This would be replaced with actual content fetching logic
    // For example, fetching from an API, database, or content provider

    // For now, return a placeholder with more realistic content
    return `
# Travel Guide: Exploring ${category}

Discover the best ${category.toLowerCase()} experiences around the world. From hidden gems to popular destinations, this guide covers everything you need to know about ${category.toLowerCase()}.

## Why ${category} Matters

${category} is an essential part of the travel experience. Whether you're a seasoned traveler or planning your first trip, understanding ${category.toLowerCase()} options can enhance your journey.

## Top ${category} Picks for 2025

1. First amazing option
2. Second incredible choice
3. Third outstanding selection

## Planning Tips

When considering ${category.toLowerCase()}, always research in advance and book early for the best experiences.

## Conclusion

With the right approach to ${category.toLowerCase()}, your travel experiences will be unforgettable.
`;
  }

  /**
   * Schedule a story for publishing
   * @param story - The story to publish
   * @param publishTime - The time to publish the story
   * @returns Promise that resolves when scheduling is complete
   * @private
   */
  private async scheduleStoryPublishing(story: Story, publishTime: Date): Promise<void> {
    // This would be replaced with actual publishing logic
    // For example, adding to a publishing queue, database, or CMS

    // For now, just log the scheduling
    logger.info(`Scheduling story "${story.title}" for publishing at ${publishTime.toISOString()}`);

    // You could implement actual scheduling logic here:
    // - Add to a database with a publishedAt field
    // - Schedule a job with a task queue
    // - Set up a webhook or timer
  }

  private canProcessMoreStories(): boolean {
    if (this.dailyStoriesProcessed >= this.maxDailyStories) {
      return false;
    }

    if (!this.lastProcessedTime) {
      return true;
    }

    const timeSinceLastProcess = Date.now() - this.lastProcessedTime.getTime();
    return timeSinceLastProcess >= this.minTimeBetweenStories;
  }

  public resetDailyCount(): void {
    this.dailyStoriesProcessed = 0;
    this.lastProcessedTime = null;
  }

  async processStories(stories: Story[]): Promise<Story[]> {
    const processedStories: Story[] = [];

    for (const story of stories) {
      try {
        const processedStory = await this.processStory(story);
        if (processedStory) {
          processedStories.push(processedStory);
          this.dailyStoriesProcessed++;
          this.lastProcessedTime = new Date();
        }
      } catch (error) {
        console.error(`Error processing story ${story.id}:`, error);
      }
    }

    return processedStories;
  }

  private async processStory(story: Story): Promise<Story | null> {
    try {
      // Rewrite the story content
      const rewrittenContent = await this.storyRewriter.rewrite(
        story.content,
        story.category || 'General',
        {
          preserveTags: true,
          maintainTone: true
        }
      );

      if (!rewrittenContent) {
        console.error(`Failed to rewrite story ${story.id}`);
        return null;
      }

      // If the result is a string, update the content
      if (typeof rewrittenContent === 'string') {
        return {
          ...story,
          content: rewrittenContent
        };
      }
      // If the result is a Story object, merge it with the original story
      else if (typeof rewrittenContent === 'object') {
        return {
          ...story,
          ...(rewrittenContent as object)
        };
      }

      return null;
    } catch (error) {
      console.error(`Error in processStory for ${story.id}:`, error);
      return null;
    }
  }

  /**
   * Process stories - implements IStoryProcessor interface
   * @returns A promise resolving to the number of stories processed
   */
  async process(): Promise<number> {
    await this.processDailyStories();
    return this.dailyStoriesProcessed;
  }

  /**
   * Get processing stats - implements IStoryProcessor interface
   * @returns Processing stats
   */
  getStats() {
    return {
      storiesProcessed: this.dailyStoriesProcessed,
      storiesPublished: this.processedStories.length,
      lastProcessedTime: this.lastProcessedTime,
    };
  }
}