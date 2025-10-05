import { Story } from '@/types/Story';
import { IStoryRewriter } from './interfaces';
import { fetchRSSFeeds } from '@/lib/rss';

/**
 * Simple mock implementation of the StoryRewriter interface
 * This avoids using Node.js-specific modules that aren't available in Edge Runtime
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
   * Rewrite a story (mock implementation)
   * @param content - The content to rewrite
   * @param category - The category of the story
   * @param options - Rewrite options
   * @returns A promise resolving to a mock story
   */
  public async rewrite(
    content: string,
    category: string,
    options?: {
      preserveTags?: boolean;
      maintainTone?: boolean;
    }
  ): Promise<Story> {
    // Create a mock story
    return {
      id: `story-${Date.now()}`,
      title: `New ${category} Story`,
      slug: `new-${category.toLowerCase()}-story`,
      excerpt: 'This is a mock story excerpt.',
      content: 'This is a mock story content.',
      author: 'Global Travel Report Editorial Team',
      category,
      country: 'Global',
      tags: ['travel', category.toLowerCase()],
      featured: false,
      editorsPick: false,
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&q=80&w=2400',
    };
  }

  /**
   * Fetch stories by category (mock implementation)
   * @param category - The category to filter by
   * @param limit - The maximum number of stories to return
   * @returns A promise resolving to an array of stories
   */
  public async fetchStoriesByCategory(category: string, limit: number = 5): Promise<Story[]> {
    // Get all stories
    const allStories = await fetchRSSFeeds();
    
    // Filter by category
    const filteredStories = allStories.filter(story => 
      story.category.toLowerCase().includes(category.toLowerCase())
    );
    
    // Return limited number of stories
    return filteredStories.slice(0, limit);
  }
}
