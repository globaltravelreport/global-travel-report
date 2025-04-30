/* eslint-disable no-console */
import OpenAI from "openai";
import type { Story } from "@/types/Story";
import { v4 as uuidv4 } from "uuid";
import { createChatCompletion, batchOpenAIRequests } from "@/src/utils/openai-optimizer";
import config from "@/src/config";

/**
 * Interface for rewrite options
 */
export interface RewriteOptions {
  category?: string;
  preserveTags?: boolean;
  maintainTone?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Class responsible for rewriting travel stories using AI
 */
export class StoryRewriter {
  private dailyStoriesProcessed: number = 0;
  private lastProcessedTime: Date | null = null;
  private readonly maxDailyStories: number = 100;
  private readonly defaultRetryDelay: number = 1000;
  private readonly defaultMaxRetries: number = 3;

  /**
   * Unified method to rewrite content, handling both new content and existing stories
   * @param content - Either a string with original content or an existing Story object
   * @param options - Configuration options for the rewrite process
   * @returns A Promise resolving to a Story object or null if rewrite fails
   */
  public async rewrite(
    content: string | Story,
    options: RewriteOptions = {}
  ): Promise<Story | Partial<Story> | null> {
    // Set default options
    const {
      category = "Travel",
      preserveTags = true,
      maintainTone = true,
      maxRetries = this.defaultMaxRetries,
      retryDelay = this.defaultRetryDelay
    } = options;

    // Track retry attempts
    let retryCount = 0;
    let lastError: Error | null = null;

    // Retry loop
    while (retryCount <= maxRetries) {
      try {
        // If content is a Story object, we're updating an existing story
        if (typeof content !== 'string') {
          return this.rewriteExistingStory(content, { preserveTags, maintainTone });
        }

        // Otherwise, we're creating a new story from raw content
        return await this.rewriteNewContent(content, category);
      } catch (error) {
        lastError = error instanceof Error
          ? error
          : new Error('Unknown error during story rewrite');

        // If we've reached max retries, throw the error
        if (retryCount >= maxRetries) {
          console.error(`Failed to rewrite story after ${maxRetries} attempts:`, lastError);
          throw lastError;
        }

        // Otherwise, wait and retry
        retryCount++;
        console.warn(`Rewrite attempt ${retryCount} failed, retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    // This should never be reached due to the throw in the catch block
    return null;
  }

  /**
   * Helper method to rewrite new content
   * @param originalContent - The original content string
   * @param category - The category for the new story
   * @returns A Promise resolving to a new Story object
   * @private
   */
  private async rewriteNewContent(originalContent: string, category: string): Promise<Story> {
    // Use optimized OpenAI API with caching and retries
    const completion = await createChatCompletion({
      model: config.api.openai.defaultModel,
      messages: [
        {
          role: "system",
          content: "You are a travel story rewriter. Your task is to rewrite travel stories in a more engaging and professional way while maintaining the original content and facts."
        },
        {
          role: "user",
          content: originalContent
        }
      ]
    }, {
      enableCache: true,
      cacheTtl: 24 * 60 * 60 * 1000, // 24 hours
      maxRetries: config.api.openai.maxRetries,
      retryDelay: config.api.openai.retryDelay
    });

    const rewrittenContent = completion.choices[0]?.message?.content || originalContent;

    // Generate a unique ID
    const id = uuidv4();

    // Extract title from the first line
    const lines = rewrittenContent.split('\n');
    const title = lines[0]?.trim() || 'Untitled Story';

    // Generate a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Extract excerpt (first paragraph after title)
    const excerpt = lines
      .slice(1)
      .find((line: string) => line.trim().length > 0) || 'No excerpt available';

    // Get current date
    const publishedAt = new Date();

    // Create the rewritten story object
    return {
      id,
      slug,
      title,
      excerpt,
      content: rewrittenContent,
      author: "AI Travel Writer",
      publishedAt,
      tags: ["travel", "ai-generated"],
      category,
      country: "Unknown",
      featured: false,
      editorsPick: false,
      imageUrl: ""
    };
  }

  /**
   * Helper method to rewrite an existing story
   * @param story - The existing Story object
   * @param options - Options for rewriting
   * @returns A Promise resolving to a partial Story object with updated fields
   * @private
   */
  private async rewriteExistingStory(
    story: Story,
    options: { preserveTags: boolean; maintainTone: boolean }
  ): Promise<Partial<Story>> {
    // In a real implementation, this would call the OpenAI API
    // For now, we're just returning the original content
    return {
      title: story.title,
      excerpt: story.excerpt,
      content: story.content,
    };
  }

  /**
   * Check if more stories can be processed based on daily limits
   * @returns Boolean indicating if more stories can be processed
   */
  public canProcessMoreStories(): boolean {
    if (this.dailyStoriesProcessed >= this.maxDailyStories) {
      return false;
    }

    if (!this.lastProcessedTime) {
      return true;
    }

    const now = new Date();
    const timeSinceLastProcess = now.getTime() - this.lastProcessedTime.getTime();
    const oneMinuteInMs = 60 * 1000;

    return timeSinceLastProcess >= oneMinuteInMs;
  }

  /**
   * Reset the daily story processing counter
   */
  public resetDailyCount(): void {
    this.dailyStoriesProcessed = 0;
    this.lastProcessedTime = null;
  }
}