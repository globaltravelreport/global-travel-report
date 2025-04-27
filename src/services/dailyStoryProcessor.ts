import { StoryRewriter } from './storyRewrite';
import { storyRewriteConfig } from '@/config/storyRewrite';
import { Story } from '@/lib/stories';

export class DailyStoryProcessor {
  private static instance: DailyStoryProcessor;
  private storyRewriter: StoryRewriter;
  private processingQueue: Story[] = [];
  private isProcessing: boolean = false;
  private processedStories: Story[] = [];

  private constructor() {
    this.storyRewriter = new StoryRewriter();
  }

  public static getInstance(): DailyStoryProcessor {
    if (!DailyStoryProcessor.instance) {
      DailyStoryProcessor.instance = new DailyStoryProcessor();
    }
    return DailyStoryProcessor.instance;
  }

  public async processDailyStories(): Promise<void> {
    if (this.isProcessing) {
      console.log('Story processing already in progress');
      return;
    }

    this.isProcessing = true;
    this.processedStories = []; // Reset processed stories

    try {
      // Reset daily count at the start of processing
      this.storyRewriter.resetDailyCount();

      // Process cruise stories first (priority)
      await this.processCategoryStories('cruise', storyRewriteConfig.categoryDistribution.cruise);

      // Process other categories
      await this.processCategoryStories('other', storyRewriteConfig.categoryDistribution.other);

      // Schedule the stories for publishing
      await this.scheduleStoriesForPublishing();

    } catch (error) {
      console.error('Error processing daily stories:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  public async getProcessedStories(): Promise<Story[]> {
    return this.processedStories;
  }

  private async processCategoryStories(categoryType: 'cruise' | 'other', count: number): Promise<void> {
    const categories = storyRewriteConfig.categories[categoryType];
    
    for (let i = 0; i < count; i++) {
      if (!this.storyRewriter.canProcessMoreStories()) {
        console.log('Daily story limit reached');
        break;
      }

      // Select a random category from the appropriate list
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      // Get original content (this would be replaced with actual content fetching)
      const originalContent = await this.getOriginalContent(category);
      
      // Rewrite the story
      const rewrittenStory = await this.storyRewriter.rewriteStory(originalContent, category);
      
      // Add to processing queue and processed stories
      this.processingQueue.push(rewrittenStory);
      this.processedStories.push(rewrittenStory);
    }
  }

  private async scheduleStoriesForPublishing(): Promise<void> {
    const interval = storyRewriteConfig.publishing.intervalMinutes * 60 * 1000; // Convert to milliseconds
    const totalStories = this.processingQueue.length;
    
    for (let i = 0; i < totalStories; i++) {
      const story = this.processingQueue[i];
      const publishTime = new Date(Date.now() + (i * interval));
      
      // Schedule the story for publishing
      await this.scheduleStoryPublishing(story, publishTime);
    }
  }

  private async getOriginalContent(category: string): Promise<string> {
    // This would be replaced with actual content fetching logic
    // For now, return a placeholder
    return `Original content for ${category} category`;
  }

  private async scheduleStoryPublishing(story: Story, publishTime: Date): Promise<void> {
    // This would be replaced with actual publishing logic
    console.log(`Scheduling story "${story.title}" for publishing at ${publishTime.toISOString()}`);
  }
} 