/* eslint-disable no-console */
import type { Story } from "../../types/Story";
import { v4 as uuidv4 } from "uuid";
import { generateStoryContent } from "../services/aiService";
import { CATEGORIES, normalizeCategoryName } from "../config/categories";

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
Avoid formulaic openings such as "travellers are set to", "whether you are a seasoned traveller", "hidden gem", "must-visit", "paradise", or "unforgettable experience".
Do not finish with a generic conclusion. End with a useful planning note, booking implication, timing consideration, or official-advice caveat.
Vary paragraph openings and sentence rhythm.
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

Headline: A clear, factual headline for Australian travellers, under 70 characters where possible
Excerpt: 1 concise sentence summarising the practical reader value, under 155 characters
Article: 5 to 8 short paragraphs, with this editorial shape:
- Paragraph 1: the news and why it matters
- Paragraph 2: who is affected
- Paragraph 3: key details from the source
- Paragraph 4: Australian traveller context where relevant
- Final paragraph: practical next step, timing note, or official-advice caveat
Tags: 5 comma-separated SEO tags
Country: best matching country, or Global if it is not country-specific
Category: one best matching category from this exact list: ${CATEGORIES.map(category => category.name).join(', ')}

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
    const excerpt = this.truncateSentence(excerptMatch?.[1]?.trim() || 'A practical travel news update for Australian travellers.', 155);
    const articleContent = this.cleanArticleContent(articleMatch?.[1]?.trim() || rewrittenContent);
    const tags = tagsMatch?.[1]
      ?.split(',')
      .map((tag: string) => tag.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8) || ['travel news'];
    const country = countryMatch?.[1]?.trim() || 'Global';
    const finalCategory = normalizeCategoryName(categoryMatch?.[1]?.trim() || category);

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
Remove repetitive phrasing, generic travel cliches, and unsupported promotional language.
Keep any safety, visa, route, price, timing, operator or official-advice claims cautious unless they are explicit in the original.

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
      excerpt: this.truncateSentence(excerptMatch?.[1]?.trim() || story.excerpt, 155),
      content: this.cleanArticleContent(articleMatch?.[1]?.trim() || rewrittenContent),
      tags: updatedTags,
      updatedAt: new Date().toISOString(),
      publishedAt: story.publishedAt,
    };
  }

  private cleanArticleContent(content: string): string {
    const paragraphs = content
      .replace(/^Article:\s*/i, '')
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
    const seen = new Set<string>();

    return paragraphs
      .filter((paragraph) => {
        const fingerprint = paragraph.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

        if (seen.has(fingerprint)) {
          return false;
        }

        seen.add(fingerprint);
        return true;
      })
      .join('\n\n');
  }

  private truncateSentence(value: string, maxLength: number): string {
    if (value.length <= maxLength) {
      return value;
    }

    return `${value.slice(0, maxLength - 1).trim().replace(/[,\s]+$/, '')}.`;
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
