import { Story } from '@/types/Story';
import { mockStories } from '@/src/mocks/stories';

/**
 * @deprecated Use src/utils/stories.ts instead
 * This file is kept for backward compatibility and will be removed in a future release
 */

/**
 * Get all stories
 * @returns A promise resolving to an array of stories
 */
export async function getAllStories(): Promise<Story[]> {
  // Forward to the new implementation
  return mockStories.sort((a, b) => {
    const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
    const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Get a story by its slug
 * @param slug - The story slug
 * @returns A promise resolving to a story or null if not found
 */
export async function getStoryBySlug(slug: string): Promise<Story | null> {
  try {
    const stories = await getAllStories();
    return stories.find(story => story.slug === slug) || null;
  } catch (error) {
    return null;
  }
}
