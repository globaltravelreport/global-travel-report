/* eslint-disable no-console */
import type { Story } from "../../types/Story";
import { v4 as uuidv4 } from "uuid";
import { generateStoryContent } from "../services/aiService";

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

const GLOBAL_TRAVEL_REPORT_TONE = `
Write as Global Travel Report, an independent travel news site for Australian readers.
Use Australian English.
Keep the tone practical, warm, clear, and editorial.
Do not mention AI, automation, rewriting, source feeds, prompts, or content generation.
Do not sound salesy, promotional, exaggerated, or robotic.
Make the article useful for Australian travellers by explaining why the news matters, who it affects, and what readers should keep in mind.
Use short paragraphs, natural transitions, and a confident travel editor voice.
Preserve all factual claims from the source. Do not invent prices, dates, routes, airlines, cruise lines, warnings, visa rules, or official advice.
If a fact is unclear in the source, phrase it cautiously.
Avoid clickbait headlines.
Do not include hashtags.
`;

/**
 * Class responsible for rewriting travel stories using AI
 */
export class StoryRewriter {
  private dailyStoriesProcessed: number = 0;
  private lastProcessedTime: Date | null = null;
  private readonly maxDailyStories: number = 8;
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
      category = "Travel News",
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
      } catch (_error) {
        lastError = _error instanceof Error
          ? _error
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
    const prompt = `${GLOBAL_TRAVEL_REPORT_TONE}

Rewrite the following travel news item as a fresh, original Global Travel Report article.

Return the article in this structure:

Headline: A clear, factual headline for Australian travellers
Excerpt: 1 concise sentence summarising the story
Article: 5 to 8 short paragraphs
Tags: 5 comma-separated SEO tags
Country: best matching country, or Global if it is not country-specific
Category: best matching category, such as Air Travel, Cruise, Hotel, Tours, Rail, Insurance, Safety, Deals, Destinations, or Travel News

Source category hint: ${category}

Source content:
${originalContent}`;

    const result = await generateStoryContent(prompt);
    const rewrittenContent = result.content || originalContent;

    // Generate a unique ID
    const id = uuidv4();

    const headlineMatch = rewrittenContent.match(/Headline:\s*(.+)/i);
    const excerptMatch = rewrittenContent.match(/Excerpt:\s*(.+)/i);
    const tagsMatch = rewrittenContent.match(/Tags:\s*(.+)/i);
    const countryMatch = rewrittenContent.match(/Country:\s*(.+)/i);
    const categoryMatch = rewrittenContent.match(/Category:\s*(.+)/i);
    const articleMatch = rewrittenContent.match(/Article:\s*([\s\S]*?)(?:\n\s*Tags:|\n\s*Country:|\n\s*Category:|$)/i);

    const title = headlineMatch?.[1]?.trim() || rewrittenContent.split('\n').find(Boolean)?.trim() || 'Travel News Update';
    const excerpt = excerptMatch?.[1]?.trim() || 'A practical travel news update for Australian travellers.';
    const articleContent = articleMatch?.[1]?.trim() || rewrittenContent;
    const tags = tagsMatch?.[1]
      ?.split(',')
      .map((tag: string) => tag.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8) || ['travel news'];
    const country = countryMatch?.[1]?.trim() || 'Global';
    const finalCategory = categoryMatch?.[1]?.trim() || category;

    // Generate a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // A new generated story receives today's publish date once.
    // Existing story updates must preserve their original publishedAt elsewhere in the pipeline.
    const publishedAt = new Date();

    // Create the rewritten story object
    return {
      id,
      slug,
      title,
      excerpt,
      content: articleContent,
      author: "Global Travel Report",
      publishedAt,
      tags,
      category: finalCategory,
      country,
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
    const prompt = `${GLOBAL_TRAVEL_REPORT_TONE}

Refresh the following existing Global Travel Report article while preserving the original facts and public publish date.
Do not change the story date.
Improve clarity, structure, excerpt, and reader usefulness.
Keep the article suitable for Australian travellers.

Original title: ${story.title}
Original excerpt: ${story.excerpt}
Original category: ${story.category}
Original country: ${story.country}
Original tags: ${(story.tags || []).join(', ')}

Original article:
${story.content}

Return only:
Headline:
Excerpt:
Article:
Tags:`;

    const result = await generateStoryContent(prompt);
    const rewrittenContent = result.content || story.content;

    const headlineMatch = rewrittenContent.match(/Headline:\s*(.+)/i);
    const excerptMatch = rewrittenContent.match(/Excerpt:\s*(.+)/i);
    const tagsMatch = rewrittenContent.match(/Tags:\s*(.+)/i);
    const articleMatch = rewrittenContent.match(/Article:\s*([\s\S]*?)(?:\n\s*Tags:|$)/i);

    const updatedTags = options.preserveTags
      ? story.tags
      : tagsMatch?.[1]
          ?.split(',')
          .map((tag: string) => tag.trim().toLowerCase())
          .filter(Boolean)
          .slice(0, 8) || story.tags;

    return {
      title: headlineMatch?.[1]?.trim() || story.title,
      excerpt: excerptMatch?.[1]?.trim() || story.excerpt,
      content: articleMatch?.[1]?.trim() || rewrittenContent,
      tags: updatedTags,
      updatedAt: new Date().toISOString(),
      publishedAt: story.publishedAt,
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
