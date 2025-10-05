/**
 * Centralized Story Service for Global Travel Report
 *
 * This service handles all story-related operations, including:
 * - Loading stories from the file system
 * - Filtering and sorting stories
 * - Story metadata management
 * - Story validation
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Story } from '@/types/Story';
import seoEnhancer from '@/utils/seoEnhancer';
import errorService, { ErrorCategory } from './errorService';

// Constants
const CONTENT_DIR = path.join(process.cwd(), 'content/articles');
const STORIES_PER_PAGE = 10;

/**
 * Load all stories from the file system
 * @returns Array of stories
 */
export async function getAllStories(): Promise<Story[]> {
  try {
    // Create content directory if it doesn't exist
    if (!fs.existsSync(CONTENT_DIR)) {
      fs.mkdirSync(CONTENT_DIR, { recursive: true });
      return [];
    }

    // Get all markdown files
    const files = fs.readdirSync(CONTENT_DIR);
    const storyFiles = files.filter(file => file.endsWith('.md'));

    // Load each story
    const stories: Story[] = [];
    for (const file of storyFiles) {
      try {
        const filePath = path.join(CONTENT_DIR, file);
        const story = loadStoryFromFile(filePath);
        if (story) {
          stories.push(story);
        }
      } catch (_error) {
        errorService.logError(
          `Failed to load story file: ${file}`,
          errorService.ErrorSeverity.WARNING,
          ErrorCategory.CONTENT,
          { action: 'getAllStories', additionalData: { file } }
        );
      }
    }

    // Sort stories by publication date (newest first)
    return sortStoriesByDate(stories);
  } catch (_error) {
    errorService.logError(
      `Failed to load stories: ${_error instanceof Error ? _error.message : String(_error)}`,
      errorService.ErrorSeverity.ERROR,
      ErrorCategory.CONTENT,
      { action: 'getAllStories' }
    );
    return [];
  }
}

/**
 * Load a story from a file
 * @param filePath Path to the story file
 * @returns Story object or null if not found
 */
export function loadStoryFromFile(filePath: string): Story | null {
  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      errorService.logError(
        `Story file not found: ${filePath}`,
        errorService.ErrorSeverity.WARNING,
        ErrorCategory.CONTENT,
        { action: 'loadStoryFromFile', additionalData: { filePath } }
      );
      return null;
    }

    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Parse frontmatter
    const { data, content } = matter(fileContent);

    // Get the slug from the filename
    const slug = path.basename(filePath, '.md');

    // Ensure required fields
    if (!data.title) {
      errorService.logError(
        `Story is missing a title: ${filePath}`,
        errorService.ErrorSeverity.WARNING,
        ErrorCategory.CONTENT,
        { action: 'loadStoryFromFile', additionalData: { filePath } }
      );
    }

    // Handle dates properly
    let publishedAt = data.publishedAt || data.date || new Date().toISOString();
    if (typeof publishedAt === 'object' && publishedAt instanceof Date) {
      publishedAt = publishedAt.toISOString();
    }

    // Create the story object
    const story: Story = {
      id: data.id || slug,
      slug,
      title: data.title || 'Untitled Story',
      excerpt: data.excerpt || content.substring(0, 150) + '...',
      content,
      publishedAt,
      updatedAt: data.updatedAt || publishedAt,
      author: data.author || 'Global Travel Report Editorial Team',
      category: data.category || 'Travel',
      country: data.country || 'Global',
      tags: data.tags || [],
      featured: data.featured || false,
      editorsPick: data.editorsPick || false,
      imageUrl: data.imageUrl || data.image,
      postedToSocialMedia: data.postedToSocialMedia || false,
      postedToSocialMediaAt: data.postedToSocialMediaAt,
      imageCredit: data.imageCredit,
      imageCreditUrl: data.imageCreditUrl,
      imageAlt: data.imageAlt,
      rewritten: data.rewritten || false,
      processedAt: data.processedAt,
      focusKeywords: data.focusKeywords || [],
      source: data.source,
      sourceUrl: data.sourceUrl,
      // Aliases for compatibility
      image: data.imageUrl || data.image,
      date: publishedAt,
      type: data.category || 'Travel',
      keywords: data.tags || [],
      summary: data.excerpt || content.substring(0, 150) + '...',
    };

    // Add photographer data if available
    if (data.photographer) {
      if (typeof data.photographer === 'string') {
        story.photographer = {
          name: data.photographer,
        };
      } else {
        story.photographer = data.photographer;
      }
    }

    return story;
  } catch (_error) {
    errorService.logError(
      `Failed to load story from file: ${_error instanceof Error ? _error.message : String(_error)}`,
      errorService.ErrorSeverity.ERROR,
      ErrorCategory.CONTENT,
      { action: 'loadStoryFromFile', additionalData: { filePath } }
    );
    return null;
  }
}

/**
 * Save a story to a file
 * @param story Story to save
 * @returns Boolean indicating success
 */
export function saveStoryToFile(story: Story): boolean {
  try {
    // Ensure the story has a slug
    if (!story.slug) {
      story.slug = seoEnhancer.generateOptimizedSlug(story);
    }

    // Check if the file already exists to preserve original dates
    const filePath = path.join(CONTENT_DIR, `${story.slug}.md`);
    let existingPublishedAt = null;

    if (fs.existsSync(filePath)) {
      try {
        const existingContent = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(existingContent);

        // Preserve the original publishedAt date if it exists
        if (data.publishedAt) {
          existingPublishedAt = data.publishedAt;
        } else if (data.date) {
          existingPublishedAt = data.date;
        }
      } catch (_error) {
        // If there's an error reading the file, continue with the current date
        errorService.logError(
          `Failed to read existing story file: ${_error instanceof Error ? _error.message : String(_error)}`,
          errorService.ErrorSeverity.WARNING,
          ErrorCategory.CONTENT,
          { action: 'saveStoryToFile', additionalData: { storyTitle: story.title } }
        );
      }
    }

    // Prepare frontmatter data
    const frontmatterData = {
      id: story.id,
      title: story.title,
      excerpt: story.excerpt,
      // Use the existing publishedAt date if available, otherwise use the current one
      publishedAt: existingPublishedAt || story.publishedAt,
      updatedAt: story.updatedAt,
      author: story.author,
      category: story.category,
      country: story.country,
      tags: story.tags,
      featured: story.featured,
      editorsPick: story.editorsPick,
      imageUrl: story.imageUrl,
      postedToSocialMedia: story.postedToSocialMedia,
      postedToSocialMediaAt: story.postedToSocialMediaAt,
      imageCredit: story.imageCredit,
      imageCreditUrl: story.imageCreditUrl,
      imageAlt: story.imageAlt,
      rewritten: story.rewritten,
      processedAt: story.processedAt,
      focusKeywords: story.focusKeywords,
      source: story.source,
      sourceUrl: story.sourceUrl,
    };

    // Add photographer data if available
    if ('photographer' in story) {
      // Create a properly typed frontmatter data object with index signature
      const typedFrontmatterData = frontmatterData as Record<string, unknown>;

      // Ensure photographer is properly typed before adding to frontmatter
      if (typeof story.photographer === 'string') {
        typedFrontmatterData.photographer = { name: story.photographer };
      } else {
        typedFrontmatterData.photographer = story.photographer;
      }
    }

    // Create the file content
    const fileContent = matter.stringify(story.content, frontmatterData);

    // Create the directory if it doesn't exist
    if (!fs.existsSync(CONTENT_DIR)) {
      fs.mkdirSync(CONTENT_DIR, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(filePath, fileContent);

    return true;
  } catch (_error) {
    errorService.logError(
      `Failed to save story to file: ${_error instanceof Error ? _error.message : String(_error)}`,
      errorService.ErrorSeverity.ERROR,
      ErrorCategory.CONTENT,
      { action: 'saveStoryToFile', additionalData: { storyTitle: story.title } }
    );
    return false;
  }
}

/**
 * Get a story by slug
 * @param slug Story slug
 * @returns Story object or null if not found
 */
export async function getStoryBySlug(slug: string): Promise<Story | null> {
  try {
    const filePath = path.join(CONTENT_DIR, `${slug}.md`);
    return loadStoryFromFile(filePath);
  } catch (_error) {
    errorService.logError(
      `Failed to get story by slug: ${_error instanceof Error ? _error.message : String(_error)}`,
      errorService.ErrorSeverity.ERROR,
      ErrorCategory.CONTENT,
      { action: 'getStoryBySlug', additionalData: { slug } }
    );
    return null;
  }
}

/**
 * Sort stories by publication date (newest first)
 * @param stories Array of stories to sort
 * @returns Sorted array of stories
 */
export function sortStoriesByDate(stories: Story[]): Story[] {
  return [...stories].sort((a, b) => {
    try {
      const dateA = new Date(a.publishedAt || a.date || '');
      const dateB = new Date(b.publishedAt || b.date || '');

      // Check if dates are valid
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return 0;
      }

      return dateB.getTime() - dateA.getTime();
    } catch (_error) {
      errorService.logError(
        `Error sorting stories by date: ${_error instanceof Error ? _error.message : String(_error)}`,
        errorService.ErrorSeverity.WARNING,
        ErrorCategory.CONTENT,
        { action: 'sortStoriesByDate' }
      );
      return 0;
    }
  });
}

/**
 * Get paginated stories
 * @param page Page number (1-based)
 * @param pageSize Number of stories per page
 * @param filter Filter function
 * @returns Paginated stories
 */
export async function getPaginatedStories(
  page: number = 1,
  pageSize: number = STORIES_PER_PAGE,
  filter?: (story: Story) => boolean
): Promise<{
  stories: Story[];
  totalStories: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    // Get all stories
    let stories = await getAllStories();

    // Apply filter if provided
    if (filter) {
      stories = stories.filter(filter);
    }

    // Calculate pagination
    const totalStories = stories.length;
    const totalPages = Math.ceil(totalStories / pageSize);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Get stories for the current page
    const paginatedStories = stories.slice(startIndex, endIndex);

    return {
      stories: paginatedStories,
      totalStories,
      totalPages,
      currentPage,
    };
  } catch (_error) {
    errorService.logError(
      `Failed to get paginated stories: ${_error instanceof Error ? _error.message : String(_error)}`,
      errorService.ErrorSeverity.ERROR,
      ErrorCategory.CONTENT,
      { action: 'getPaginatedStories', additionalData: { page, pageSize } }
    );
    return {
      stories: [],
      totalStories: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

// Export the service as a default object
const storyService = {
  getAllStories,
  loadStoryFromFile,
  saveStoryToFile,
  getStoryBySlug,
  sortStoriesByDate,
  getPaginatedStories,
};

export default storyService;
