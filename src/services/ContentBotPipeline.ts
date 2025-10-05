/**
 * Content Bot Pipeline
 *
 * Orchestrates the complete content automation workflow:
 * RSS Fetch → Rewrite → Image Enhancement → Moderation → Publishing → Distribution
 */

import { Story } from '@/types/Story';
import { UserSubmission } from '@/types/UserSubmission';
import { StoryDatabase } from './storyDatabase';
import { EnhancedRSSFeedService } from './EnhancedRSSFeedService';
import { AustralianEnglishRewriter } from './AustralianEnglishRewriter';
import { LocationAccurateImageService } from './LocationAccurateImageService';
import { ContentAutomationService } from './contentAutomationService';
import { SocialDistributionBot } from './SocialDistributionBot';
import { sendSubmissionNotification } from './brevoService';
import { rssFeedSources, categoryMappings } from '@/src/config/rssFeeds';

export interface PipelineConfig {
  enableAutoIngestion: boolean;
  maxStoriesPerDay: number;
  qualityThreshold: number;
  requireManualApproval: boolean;
  autoPublishApproved: boolean;
  enableSocialDistribution: boolean;
}

export interface PipelineResult {
  success: boolean;
  storiesProcessed: number;
  storiesIngested: number;
  storiesRewritten: number;
  storiesPublished: number;
  storiesDistributed: number;
  errors: string[];
  warnings: string[];
}

export interface ProcessedContent {
  originalStory: any;
  rewrittenStory: Story;
  imageUrl?: string;
  photographer?: {
    name: string;
    url?: string;
  };
  submissionId: string;
  status: 'fetched' | 'rewritten' | 'moderation_pending' | 'approved' | 'published' | 'distributed';
}

export class ContentBotPipeline {
  private static instance: ContentBotPipeline | null = null;
  private db: StoryDatabase;
  private rssService: EnhancedRSSFeedService;
  private rewriter: AustralianEnglishRewriter;
  private imageService: LocationAccurateImageService;
  private automationService: ContentAutomationService;
  private distributionBot: SocialDistributionBot;
  private config: PipelineConfig;

  private constructor() {
    this.db = StoryDatabase.getInstance();
    this.rssService = EnhancedRSSFeedService.getInstance();
    this.rewriter = AustralianEnglishRewriter.getInstance();
    this.imageService = LocationAccurateImageService.getInstance();
    this.automationService = ContentAutomationService.getInstance();
    this.distributionBot = SocialDistributionBot.getInstance();

    this.config = {
      enableAutoIngestion: true,
      maxStoriesPerDay: 10,
      qualityThreshold: 0.7,
      requireManualApproval: true,
      autoPublishApproved: true,
      enableSocialDistribution: true,
    };
  }

  public static getInstance(): ContentBotPipeline {
    if (!ContentBotPipeline.instance) {
      ContentBotPipeline.instance = new ContentBotPipeline();
    }
    return ContentBotPipeline.instance;
  }

  /**
   * Configure the pipeline
   */
  public configure(config: Partial<PipelineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Run the complete content pipeline
   */
  public async runPipeline(): Promise<PipelineResult> {
    const result: PipelineResult = {
      success: false,
      storiesProcessed: 0,
      storiesIngested: 0,
      storiesRewritten: 0,
      storiesPublished: 0,
      storiesDistributed: 0,
      errors: [],
      warnings: [],
    };

    try {
      console.log('🚀 Starting Content Bot Pipeline...');

      // Step 1: Fetch RSS content
      const fetchedStories = await this.fetchRSSContent();
      result.storiesProcessed = fetchedStories.length;

      if (fetchedStories.length === 0) {
        result.warnings.push('No new RSS content fetched');
        result.success = true;
        return result;
      }

      // Step 2: Process and rewrite stories
      const processedStories = await this.processAndRewriteStories(fetchedStories);
      result.storiesRewritten = processedStories.length;

      // Step 3: Submit to moderation
      const moderationResults = await this.submitToModeration(processedStories);
      result.storiesIngested = moderationResults.length;

      // Step 4: Auto-publish if configured and approved
      if (this.config.autoPublishApproved) {
        const publishedStories = await this.autoPublishApproved();
        result.storiesPublished = publishedStories.length;

        // Step 5: Distribute published stories to social media
        if (this.config.enableSocialDistribution && publishedStories.length > 0) {
          const distributionResults = await this.distributePublishedStories(publishedStories);
          result.storiesDistributed = distributionResults.length;
        }
      }

      result.success = true;
      console.log('✅ Content Bot Pipeline completed successfully');

    } catch (_error) {
      console.error(_error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown pipeline error');
    }

    return result;
  }

  /**
   * Step 5: Distribute published stories to social media
   */
  private async distributePublishedStories(stories: Story[]): Promise<Story[]> {
    const distributedStories: Story[] = [];

    for (const story of stories) {
      try {
        const distributionResult = await this.distributionBot.distributeStory(story);

        if (distributionResult.success) {
          distributedStories.push(story);
          console.log(`📢 Distributed: ${story.title} to ${distributionResult.platforms.length} platforms`);
        } else {
          console.error(`Failed to distribute ${story.title}:`, distributionResult.errors);
        }
      } catch (_error) {
        console.error(_error);
      }
    }

    return distributedStories;
  }

  /**
   * Step 1: Fetch content from RSS feeds
   */
  private async fetchRSSContent(): Promise<any[]> {
    try {
      console.log('📡 Fetching RSS content...');
      const result = await this.rssService.fetchAllFeeds();
      const stories: any[] = []; // Would extract stories from result

      // Filter for quality content and remove duplicates
      const qualityStories = stories.filter(story => {
        const hasContent = story.content && story.content.length > 200;
        const hasTitle = story.title && story.title.length > 10;
        return hasContent && hasTitle;
      });

      console.log(`📊 Fetched ${stories.length} stories, ${qualityStories.length} passed quality filter`);
      return qualityStories;

    } catch (_error) {
      console.error(_error);
      throw error;
    }
  }

  /**
   * Step 2: Process and rewrite stories with Australian English style
   */
  private async processAndRewriteStories(rawStories: any[]): Promise<ProcessedContent[]> {
    const processedStories: ProcessedContent[] = [];

    for (const rawStory of rawStories) {
      try {
        console.log(`✍️ Processing story: ${rawStory.title}`);

        // Step 2a: Rewrite content in Australian English editorial style
        const rewrittenStory = await this.rewriter.rewrite(
          rawStory.content,
          rawStory.category || 'Destinations',
          {
            preserveTags: true,
            maintainTone: true,
            australianEnglish: true,
          }
        );

        // Step 2b: Enhance with location-accurate image
        const imageEnhancedStory = await this.enhanceStoryWithImage(rewrittenStory);

        // Step 2c: Create processed content object
        const processedContent: ProcessedContent = {
          originalStory: rawStory,
          rewrittenStory: imageEnhancedStory,
          imageUrl: imageEnhancedStory.imageUrl,
          photographer: imageEnhancedStory.photographer,
          submissionId: `rss_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'rewritten',
        };

        processedStories.push(processedContent);

      } catch (_error) {
        console.error(_error);
      }
    }

    return processedStories;
  }

  /**
   * Step 3: Submit processed stories to moderation
   */
  private async submitToModeration(processedStories: ProcessedContent[]): Promise<string[]> {
    const submissionIds: string[] = [];

    for (const processed of processedStories) {
      try {
        // Create submission object for moderation
        const submission: UserSubmission = {
          id: processed.submissionId,
          name: 'Content Bot',
          email: 'bot@globaltravelreport.com',
          title: processed.rewrittenStory.title,
          content: processed.rewrittenStory.content,
          category: processed.rewrittenStory.category,
          country: processed.rewrittenStory.country,
          tags: processed.rewrittenStory.tags,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        // Store in database
        await this.db.storeSubmission(submission);
        submissionIds.push(submission.id);

        // Send notification to editors
        await sendSubmissionNotification({
          name: submission.name,
          email: submission.email,
          title: submission.title,
          content: submission.content,
          category: submission.category,
          country: submission.country,
          tags: submission.tags,
        });

        console.log(`📋 Submitted to moderation: ${submission.title}`);

      } catch (_error) {
        console.error(_error);
      }
    }

    return submissionIds;
  }

  /**
   * Step 4: Auto-publish approved stories
   */
  private async autoPublishApproved(): Promise<Story[]> {
    try {
      console.log('🚀 Auto-publishing approved stories...');

      // Get all approved submissions
      const approvedSubmissions = await this.db.getAllSubmissions('approved');

      const publishedStories: Story[] = [];

      for (const submission of approvedSubmissions) {
        try {
          // Convert approved submission to published story
          const story = await this.db.approveSubmissionToStory(submission.id, {
            featured: false,
            editorsPick: false,
            imageUrl: submission.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=800&h=600',
          });

          if (story) {
            publishedStories.push(story);
            console.log(`✅ Published: ${story.title}`);
          }

        } catch (_error) {
          console.error(_error);
        }
      }

      return publishedStories;

    } catch (_error) {
      console.error(_error);
      return [];
    }
  }

  /**
   * Enhance story with location-accurate image
   */
  private async enhanceStoryWithImage(story: Story): Promise<Story> {
    try {
      // Build search query based on story location and category
      let searchQuery = '';

      if (story.country && story.country !== 'Global') {
        searchQuery += story.country;
      }

      if (story.category) {
        const categoryKeywords = {
          'Cruises': 'cruise ship ocean sea',
          'Hotels': 'hotel resort luxury accommodation',
          'Flights': 'airplane airport aviation',
          'Destinations': 'travel destination landmark',
          'Food': 'restaurant cuisine dining food',
          'Adventure': 'adventure outdoor nature landscape',
          'Luxury': 'luxury premium high-end elegant',
        };

        const keywords = categoryKeywords[story.category as keyof typeof categoryKeywords] || 'travel';
        searchQuery += searchQuery ? ` ${keywords}` : keywords;
      }

      // Use location-accurate image service
      const imageResult = await this.imageService.findBestImageForStory(story);

      if (imageResult) {
        return {
          ...story,
          imageUrl: imageResult.url,
          imageAlt: imageResult.alt,
          photographer: imageResult.photographer,
        };
      }

      // Fallback to default image
      return {
        ...story,
        imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=800&h=600',
      };

    } catch (_error) {
      console.error(_error);
      return story;
    }
  }

  /**
   * Get pipeline statistics
   */
  public async getPipelineStats(): Promise<{
    totalProcessed: number;
    pendingModeration: number;
    approved: number;
    published: number;
    lastRun?: Date;
  }> {
    try {
      const submissions = await this.db.getAllSubmissions();
      const allStories = await this.db.getAllStories();

      const stats = {
        totalProcessed: submissions.length,
        pendingModeration: submissions.filter(s => s.status === 'pending').length,
        approved: submissions.filter(s => s.status === 'approved').length,
        published: allStories.length,
        lastRun: new Date(), // Would track actual last run time
      };

      return stats;

    } catch (_error) {
      console.error(_error);
      return {
        totalProcessed: 0,
        pendingModeration: 0,
        approved: 0,
        published: 0,
      };
    }
  }

  /**
   * Manual pipeline trigger (for admin use)
   */
  public async triggerManualRun(): Promise<PipelineResult> {
    console.log('🎯 Manual pipeline run triggered by admin');
    return await this.runPipeline();
  }
}