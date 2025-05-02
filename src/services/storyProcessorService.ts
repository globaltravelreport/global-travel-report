/**
 * Story Processor Service
 * 
 * This service orchestrates the entire story processing workflow:
 * 1. Fetching stories from RSS feeds
 * 2. Rewriting them using OpenAI
 * 3. Enhancing them with images from Unsplash
 * 4. Storing them in the database
 */

import { Story } from '@/types/Story';
import { RSSFeedService } from './rssFeedService';
import { OpenAIService } from './openaiService';
import { UnsplashService } from './unsplashService';
import { StoryDatabase } from './storyDatabase';
import { generateSlug } from '@/src/utils/slug';

interface ProcessingStats {
  totalProcessed: number;
  successfullyRewritten: number;
  successfullyEnhancedWithImages: number;
  successfullySaved: number;
  errors: {
    fetching: number;
    rewriting: number;
    imageEnhancement: number;
    saving: number;
  };
  startTime: string;
  endTime: string | null;
  elapsedTimeMs: number | null;
}

export class StoryProcessorService {
  private static instance: StoryProcessorService | null = null;
  private rssFeedService: RSSFeedService;
  private openaiService: OpenAIService;
  private unsplashService: UnsplashService;
  private storyDatabase: StoryDatabase;
  private stats: ProcessingStats;
  private isProcessing: boolean;
  private lastProcessingTime: string | null;
  
  private constructor() {
    this.rssFeedService = RSSFeedService.getInstance();
    this.openaiService = OpenAIService.getInstance();
    this.unsplashService = UnsplashService.getInstance();
    this.storyDatabase = StoryDatabase.getInstance();
    this.stats = this.createEmptyStats();
    this.isProcessing = false;
    this.lastProcessingTime = null;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): StoryProcessorService {
    if (!StoryProcessorService.instance) {
      StoryProcessorService.instance = new StoryProcessorService();
    }
    return StoryProcessorService.instance;
  }

  /**
   * Create empty processing stats
   */
  private createEmptyStats(): ProcessingStats {
    return {
      totalProcessed: 0,
      successfullyRewritten: 0,
      successfullyEnhancedWithImages: 0,
      successfullySaved: 0,
      errors: {
        fetching: 0,
        rewriting: 0,
        imageEnhancement: 0,
        saving: 0
      },
      startTime: new Date().toISOString(),
      endTime: null,
      elapsedTimeMs: null
    };
  }

  /**
   * Check if processing is currently running
   */
  public isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }

  /**
   * Get the last processing time
   */
  public getLastProcessingTime(): string | null {
    return this.lastProcessingTime;
  }

  /**
   * Get the current processing stats
   */
  public getProcessingStats(): ProcessingStats {
    return { ...this.stats };
  }

  /**
   * Process stories from RSS feeds
   */
  public async processStories(count: number = 8, cruiseCount: number = 2): Promise<Story[]> {
    if (this.isProcessing) {
      throw new Error('Story processing is already running');
    }

    this.isProcessing = true;
    this.stats = this.createEmptyStats();
    const processedStories: Story[] = [];

    try {
      // Step 1: Fetch stories from RSS feeds
      console.log(`Fetching ${count} stories (including ${cruiseCount} cruise stories) from RSS feeds...`);
      let stories: Story[] = [];
      
      try {
        stories = await this.rssFeedService.fetchStories();
      } catch (error) {
        console.error('Error fetching stories:', error);
        this.stats.errors.fetching++;
        throw error;
      }

      // Step 2: Process each story
      for (let i = 0; i < Math.min(count, stories.length); i++) {
        const story = stories[i];
        console.log(`Processing story ${i + 1}/${Math.min(count, stories.length)}: ${story.title}`);
        
        try {
          // Step 2a: Rewrite the story using OpenAI
          console.log('Rewriting story...');
          let rewrittenStory = story;
          
          if (this.openaiService.canMakeRequest()) {
            try {
              rewrittenStory = await this.openaiService.rewriteStory(story);
              if (rewrittenStory.rewritten) {
                this.stats.successfullyRewritten++;
                console.log('Story rewritten successfully');
              } else {
                console.warn('Story was not rewritten');
              }
            } catch (error) {
              console.error('Error rewriting story:', error);
              this.stats.errors.rewriting++;
            }
          } else {
            console.warn('OpenAI API request limit reached, skipping rewriting');
          }
          
          // Step 2b: Enhance the story with an image from Unsplash
          console.log('Enhancing story with image...');
          let enhancedStory = rewrittenStory;
          
          if (this.unsplashService.canMakeRequest()) {
            try {
              enhancedStory = await this.unsplashService.enhanceStoryWithImage(rewrittenStory);
              if (enhancedStory.imageUrl && enhancedStory.imageUrl !== rewrittenStory.imageUrl) {
                this.stats.successfullyEnhancedWithImages++;
                console.log('Story enhanced with image successfully');
              } else {
                console.warn('Story was not enhanced with image');
              }
            } catch (error) {
              console.error('Error enhancing story with image:', error);
              this.stats.errors.imageEnhancement++;
            }
          } else {
            console.warn('Unsplash API request limit reached, skipping image enhancement');
          }
          
          // Step 2c: Generate SEO metadata
          console.log('Generating SEO metadata...');
          if (this.openaiService.canMakeRequest()) {
            try {
              const seoMetadata = await this.openaiService.generateSEOMetadata(enhancedStory);
              enhancedStory = {
                ...enhancedStory,
                metaTitle: seoMetadata.metaTitle,
                metaDescription: seoMetadata.metaDescription,
                focusKeywords: seoMetadata.focusKeywords
              };
              console.log('SEO metadata generated successfully');
            } catch (error) {
              console.error('Error generating SEO metadata:', error);
              // Not critical, so we don't increment error count
            }
          } else {
            console.warn('OpenAI API request limit reached, skipping SEO metadata generation');
          }
          
          // Step 2d: Save the story to the database
          console.log('Saving story to database...');
          try {
            // Ensure the story has a valid slug
            if (!enhancedStory.slug) {
              enhancedStory.slug = generateSlug(enhancedStory.title);
            }
            
            // Add processing metadata
            enhancedStory = {
              ...enhancedStory,
              processedAt: new Date().toISOString(),
              published: true
            };
            
            await this.storyDatabase.addStory(enhancedStory);
            this.stats.successfullySaved++;
            console.log('Story saved to database successfully');
            
            // Add to processed stories
            processedStories.push(enhancedStory);
          } catch (error) {
            console.error('Error saving story to database:', error);
            this.stats.errors.saving++;
          }
          
          this.stats.totalProcessed++;
        } catch (error) {
          console.error(`Error processing story ${story.title}:`, error);
          // Continue with the next story
        }
        
        // Add a delay between processing stories to avoid rate limits
        if (i < Math.min(count, stories.length) - 1) {
          console.log('Waiting before processing next story...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      console.log('Story processing completed successfully');
      return processedStories;
    } catch (error) {
      console.error('Error processing stories:', error);
      throw error;
    } finally {
      // Update stats
      this.stats.endTime = new Date().toISOString();
      this.stats.elapsedTimeMs = new Date().getTime() - new Date(this.stats.startTime).getTime();
      this.lastProcessingTime = new Date().toISOString();
      this.isProcessing = false;
    }
  }
}
