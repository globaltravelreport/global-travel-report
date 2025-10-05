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
import { generateSlug } from '@/utils/slug';

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
      } catch (_error) {
        console.error(_error);
        this.stats.errors.fetching++;
        throw error;
      }

      // Step 2: Process each story
      const storiesToProcess = stories.slice(0, Math.min(count, stories.length));
      const processedStoriesArray = [];

      for (let i = 0; i < storiesToProcess.length; i++) {
        const story = storiesToProcess[i];
        console.log(`Processing story ${i + 1}/${storiesToProcess.length}: ${story.title}`);

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
            } catch (_error) {
              console.error(_error);
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
            } catch (_error) {
              console.error(_error);
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
            } catch (_error) {
              console.error(_error);
              // Not critical, so we don't increment error count
            }
          } else {
            console.warn('OpenAI API request limit reached, skipping SEO metadata generation');
          }

          // Ensure the story has a valid slug and ID
          if (!enhancedStory.slug) {
            enhancedStory.slug = generateSlug(enhancedStory.title);
          }

          if (!enhancedStory.id) {
            enhancedStory.id = `story-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          }

          // Add processing metadata
          enhancedStory = {
            ...enhancedStory,
            processedAt: new Date().toISOString()
          };

          // Add to processed stories array
          processedStoriesArray.push(enhancedStory);
          this.stats.totalProcessed++;
        } catch (_error) {
          console.error(_error);
          // Continue with the next story
        }

        // Add a delay between processing stories to avoid rate limits
        if (i < storiesToProcess.length - 1) {
          console.log('Waiting before processing next story...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Step 3: Save all processed stories to the database at once
      if (processedStoriesArray.length > 0) {
        try {
          console.log(`Saving ${processedStoriesArray.length} stories to database...`);
          await this.storyDatabase.addStories(processedStoriesArray);
          this.stats.successfullySaved = processedStoriesArray.length;
          console.log('All stories saved to database successfully');

          // Add to processed stories result
          processedStories.push(...processedStoriesArray);

          // Step 4: Revalidate the pages to show the new stories
          try {
            console.log('Revalidating pages...');
            // Revalidate homepage
            await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com'}/api/revalidate?path=/`);
            // Revalidate stories page
            await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com'}/api/revalidate?path=/stories`);
            console.log('Pages revalidated successfully');
          } catch (revalidateError) {
            console.error('Error revalidating pages:', revalidateError);
            // Non-critical error, continue
          }
        } catch (_error) {
          console.error(_error);
          this.stats.errors.saving++;
        }
      }

      console.log('Story processing completed successfully');
      return processedStories;
    } catch (_error) {
      console.error(_error);
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
