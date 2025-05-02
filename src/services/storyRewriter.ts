import { Story } from '@/types/Story';
import { IStoryRewriter } from './interfaces';
import { rewriteArticle, generateArticleExcerpt, suggestTags } from '@/src/lib/openai';
import { fetchUnsplashImage } from '@/lib/unsplash';
import { RSSFeedService } from './rssFeedService';

/**
 * Custom error class for story rewriter errors
 */
export class StoryRewriterError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'StoryRewriterError';
  }
}

/**
 * Service for rewriting stories using OpenAI
 */
export class StoryRewriter implements IStoryRewriter {
  private static instance: StoryRewriter | null = null;

  /**
   * Get the singleton instance of StoryRewriter
   * @returns The singleton instance
   */
  public static getInstance(): StoryRewriter {
    if (!StoryRewriter.instance) {
      StoryRewriter.instance = new StoryRewriter();
    }
    return StoryRewriter.instance;
  }

  /**
   * Rewrite a story using OpenAI
   * @param content - The content to rewrite
   * @param category - The category of the story
   * @param options - Rewrite options
   * @returns A promise resolving to the rewritten story
   */
  public async rewrite(
    content: string,
    category: string,
    options?: {
      preserveTags?: boolean;
      maintainTone?: boolean;
    }
  ): Promise<Story> {
    try {
      // Rewrite the content using OpenAI
      const rewrittenContent = await rewriteArticle(content);

      // Generate an excerpt
      const excerpt = await generateArticleExcerpt(rewrittenContent);

      // Generate tags
      const tags = options?.preserveTags
        ? await suggestTags(rewrittenContent)
        : [];

      // Create a slug from the title
      const title = this.extractTitle(rewrittenContent);
      const slug = this.generateSlug(title);

      // Determine country from content
      const country = this.determineCountry(rewrittenContent);

      // Create the rewritten story
      const story: Story = {
        id: `story-${Date.now()}`,
        title,
        slug,
        excerpt,
        content: rewrittenContent,
        author: 'Global Travel Report Editorial Team',
        category,
        country,
        tags,
        featured: false,
        editorsPick: false,
        publishedAt: new Date().toISOString(),
      };

      // Fetch an image from Unsplash
      const imageQuery = `${country} ${category} travel`;
      try {
        const { url, photographer } = await fetchUnsplashImage(imageQuery);
        story.imageUrl = url;
        story.photographer = photographer;
      } catch (error) {
        console.error('Failed to fetch Unsplash image:', error);
        // Continue without an image
      }

      return story;
    } catch (error) {
      throw new StoryRewriterError('Failed to rewrite story', error);
    }
  }

  /**
   * Fetch stories by category
   * @param category - The category to filter by
   * @param limit - The maximum number of stories to return
   * @returns A promise resolving to an array of stories
   */
  public async fetchStoriesByCategory(category: string, limit: number = 5): Promise<Story[]> {
    try {
      // Get the RSS feed service
      const rssFeedService = RSSFeedService.getInstance();

      // Fetch stories from RSS feeds
      const allStories = await rssFeedService.fetchStories();

      // Filter stories by category
      const isCruiseCategory = category.toLowerCase().includes('cruise');
      const filteredStories = allStories.filter(story => {
        const storyCategory = story.category.toLowerCase();
        if (isCruiseCategory) {
          return storyCategory.includes('cruise');
        } else {
          return !storyCategory.includes('cruise');
        }
      });

      // Sort by date (newest first) and limit
      return filteredStories
        .sort((a, b) => {
          const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
          const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, limit);
    } catch (error) {
      throw new StoryRewriterError('Failed to fetch stories by category', error);
    }
  }

  /**
   * Extract title from content
   * @param content - The content to extract title from
   * @returns The extracted title
   * @private
   */
  private extractTitle(content: string): string {
    // Try to extract a title from the content
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.length < 100) {
        return trimmedLine;
      }
    }

    // Fallback to a generic title
    return `Travel Guide: ${new Date().toLocaleDateString()}`;
  }

  /**
   * Generate a slug from a title
   * @param title - The title to generate slug from
   * @returns The generated slug
   * @private
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Determine country from content
   * @param content - The content to determine country from
   * @returns The determined country
   * @private
   */
  private determineCountry(content: string): string {
    const text = content.toLowerCase();
    const countries = [
      'australia', 'japan', 'united states', 'united kingdom', 'france',
      'italy', 'spain', 'germany', 'canada', 'new zealand', 'thailand',
      'vietnam', 'singapore', 'malaysia', 'indonesia', 'china', 'india',
      'south africa', 'brazil', 'mexico'
    ];

    for (const country of countries) {
      if (text.includes(country)) {
        return country.charAt(0).toUpperCase() + country.slice(1);
      }
    }

    return 'Global';
  }
}
