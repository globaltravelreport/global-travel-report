import { Story } from '../../types/Story';
import { IStoryProcessor, IStoryRewriter, IStoryValidator } from './interfaces';
import { StoryRewriter } from './storyRewriter';
import { fetchRSSFeeds } from '../../lib/rss';

/**
 * Simple mock implementation of the DailyStoryProcessor
 * This avoids using Node.js-specific modules that aren't available in Edge Runtime
 */
export class DailyStoryProcessor implements IStoryProcessor {
  private processedStories: Story[] = [];
  private dailyStoriesProcessed: number = 0;
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
  ) {}

  /**
   * Get the singleton instance of DailyStoryProcessor
   * @returns The singleton instance
   */
  public static getInstance(): DailyStoryProcessor {
    if (!DailyStoryProcessor.instance) {
      const storyRewriter = StoryRewriter.getInstance();
      DailyStoryProcessor.instance = new DailyStoryProcessor(storyRewriter);
    }
    return DailyStoryProcessor.instance;
  }

  /**
   * Process daily stories (mock implementation)
   * @returns A promise that resolves when processing is complete
   */
  public async processDailyStories(): Promise<void> {
    // Get mock stories
    const stories = await fetchRSSFeeds();
    
    // Store as processed stories
    this.processedStories = stories;
    this.dailyStoriesProcessed = stories.length;
    this.lastProcessedTime = new Date();
  }

  /**
   * Get processed stories
   * @returns A promise resolving to the processed stories
   */
  public async getProcessedStories(): Promise<Story[]> {
    return this.processedStories;
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
