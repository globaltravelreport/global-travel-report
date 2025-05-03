/**
 * File-based Storage Utility
 *
 * This is a simple implementation that uses file-based storage.
 * It provides a similar interface to what would be expected from a database,
 * but doesn't require any external database dependencies.
 */

import { Story } from '@/types/Story';
import { mockStories } from '@/src/mocks/stories';
import fs from 'fs';
import path from 'path';
import { validateDate, getSafeDateString } from '@/src/utils/date-utils';

/**
 * Safely convert a date string to an ISO string
 * @param dateStr - The date string to convert
 * @returns A valid ISO date string
 */
function safeToISOString(dateStr: string | Date | undefined): string {
  if (!dateStr) {
    return new Date().toISOString();
  }

  return getSafeDateString(dateStr);
}

// In-memory storage for stories
const storiesData = [...mockStories];

// Get the content directory path
const getContentDir = () => {
  if (typeof process !== 'undefined' && process.cwd) {
    return path.join(process.cwd(), 'content');
  }
  return '';
};

// Get the articles directory path
const getArticlesDir = () => {
  const contentDir = getContentDir();
  if (contentDir) {
    return path.join(contentDir, 'articles');
  }
  return '';
};

/**
 * Collection interface for compatibility with existing code
 */
export interface Collection<T> {
  find: (query?: any) => { toArray: () => Promise<T[]> };
  findOne: (query: any) => Promise<T | null>;
  insertOne: (doc: T) => Promise<any>;
  insertMany: (docs: T[]) => Promise<any>;
  updateOne: (filter: any, update: any, options?: any) => Promise<any>;
  deleteOne: (filter: any) => Promise<any>;
  countDocuments: () => Promise<number>;
}

/**
 * Db interface for compatibility with existing code
 */
export interface Db {
  collection: <T>(name: string) => Collection<T>;
}

// Mock stories collection
const storiesCollection: Collection<Story> = {
  find: (query?: any) => ({
    toArray: async () => {
      console.log('FileStorage: find() called with query:', query);
      return await getAllStories();
    }
  }),
  findOne: async (query: any) => {
    console.log('FileStorage: findOne() called with query:', query);
    if (query.slug) {
      return await getStoryBySlug(query.slug);
    }
    if (query.id) {
      const stories = await getAllStories();
      return stories.find(s => s.id === query.id) || null;
    }
    return null;
  },
  insertOne: async (doc: Story) => {
    console.log('FileStorage: insertOne() called with doc:', doc.title);
    await saveStory(doc);
    return { acknowledged: true, insertedId: doc.id };
  },
  insertMany: async (docs: Story[]) => {
    console.log(`FileStorage: insertMany() called with ${docs.length} docs`);
    for (const doc of docs) {
      await saveStory(doc);
    }
    return { acknowledged: true, insertedCount: docs.length };
  },
  updateOne: async (filter: any, update: any) => {
    console.log('FileStorage: updateOne() called with filter:', filter);
    if (filter.slug) {
      const story = await getStoryBySlug(filter.slug);
      if (story && update.$set) {
        await saveStory({ ...story, ...update.$set });
        return { acknowledged: true, modifiedCount: 1 };
      }
    }
    return { acknowledged: true, modifiedCount: 0 };
  },
  deleteOne: async (filter: any) => {
    console.log('FileStorage: deleteOne() called with filter:', filter);
    if (filter.slug) {
      await deleteStory(filter.slug);
      return { acknowledged: true, deletedCount: 1 };
    }
    return { acknowledged: true, deletedCount: 0 };
  },
  countDocuments: async () => {
    const stories = await getAllStories();
    return stories.length;
  }
};

// Mock DB instance
const mockDb: Db = {
  collection: <T>(name: string): Collection<T> => {
    console.log(`FileStorage: Getting collection: ${name}`);
    if (name === 'stories') {
      return storiesCollection as unknown as Collection<T>;
    }
    throw new Error(`Collection ${name} not implemented in file storage`);
  }
};

/**
 * Get all stories from the file system
 * @returns A promise that resolves to an array of stories
 */
export async function getAllStories(): Promise<Story[]> {
  try {
    const articlesDir = getArticlesDir();

    // If we can't access the file system, return the in-memory stories
    if (!articlesDir || typeof fs.promises === 'undefined') {
      return storiesData;
    }

    // Check if the articles directory exists
    if (!fs.existsSync(articlesDir)) {
      return storiesData;
    }

    // Get all markdown files in the articles directory
    const files = fs.readdirSync(articlesDir).filter(file => file.endsWith('.md'));

    if (files.length === 0) {
      return storiesData;
    }

    // Load stories from files
    const stories: Story[] = [];

    for (const file of files) {
      try {
        const filePath = path.join(articlesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Parse the frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          const storyContent = frontmatterMatch[2];

          // Parse the frontmatter into key-value pairs
          const frontmatterLines = frontmatter.split('\n');
          const storyData: Record<string, any> = {};
          let inPhotographerBlock = false;
          let photographerData: { name?: string; url?: string } = {};

          for (const line of frontmatterLines) {
            // Check if we're entering the photographer block
            if (line.trim() === 'photographer:') {
              inPhotographerBlock = true;
              continue;
            }

            // If we're in the photographer block, parse the photographer data
            if (inPhotographerBlock) {
              // Check if the line is indented (part of the photographer block)
              if (line.startsWith('  ')) {
                const match = line.match(/^\s+(\w+):\s*(.*)$/);
                if (match) {
                  const [, key, value] = match;
                  photographerData[key] = value.replace(/^"(.*)"$/, '$1'); // Remove quotes if present
                }
              } else {
                // We've exited the photographer block
                inPhotographerBlock = false;
              }
            }

            // Parse regular key-value pairs
            if (!inPhotographerBlock) {
              const match = line.match(/^(\w+):\s*(.*)$/);
              if (match) {
                const [, key, value] = match;
                storyData[key] = value.replace(/^"(.*)"$/, '$1'); // Remove quotes if present
              }
            }
          }

          // Add the photographer data to storyData
          if (Object.keys(photographerData).length > 0) {
            storyData.photographer = photographerData;
          }

          // Clean up the imageUrl if it exists
          let cleanImageUrl = '';
          if (storyData.imageUrl) {
            // Remove any >- YAML markers and trim whitespace
            cleanImageUrl = storyData.imageUrl.replace('>-', '').trim();

            // Ensure the URL is properly formatted
            if (!cleanImageUrl.startsWith('http')) {
              console.warn(`Invalid image URL in ${file}: ${cleanImageUrl}`);
              cleanImageUrl = ''; // Reset invalid URLs
            }
          }

          // Create a story object
          const story: Story = {
            id: file.replace('.md', ''),
            slug: storyData.slug || file.replace('.md', ''),
            title: storyData.title || 'Untitled',
            content: storyContent.trim(),
            excerpt: storyData.summary || '',
            author: 'Global Travel Report Editorial Team',
            publishedAt: safeToISOString(storyData.date),
            category: storyData.type || 'Article',
            country: storyData.country || 'Global',
            imageUrl: cleanImageUrl,
            featured: storyData.featured === 'true',
            editorsPick: false,
            tags: storyData.tags ? storyData.tags.split(',').map((tag: string) => tag.trim()) : []
          };

          // Add photographer information if available
          if (storyData.photographer) {
            story.photographer = storyData.photographer;
          } else if (storyData.imageCredit || storyData.imageLink) {
            // Fallback to imageCredit and imageLink if photographer is not available
            story.photographer = {
              name: storyData.imageCredit || 'Unsplash Photographer',
              url: storyData.imageLink || 'https://unsplash.com'
            };
          }

          // If we still don't have a valid image URL, use a default based on category
          if (!story.imageUrl) {
            const defaultImages = {
              'Travel': 'https://images.unsplash.com/photo-1488085061387-422e29b40080',
              'Cruise': 'https://images.unsplash.com/photo-1548574505-5e239809ee19',
              'Destination': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
              'Adventure': 'https://images.unsplash.com/photo-1551632811-561732d1e306',
              'Culture': 'https://images.unsplash.com/photo-1493707553966-283afac8c358',
              'Food & Wine': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836'
            };

            // Find a matching category or use Travel as default
            const category = story.category.split(',')[0].trim();
            story.imageUrl = defaultImages[category] || defaultImages['Travel'];

            // Add default photographer if none exists
            if (!story.photographer) {
              story.photographer = {
                name: 'Unsplash Photographer',
                url: 'https://unsplash.com'
              };
            }
          }

          stories.push(story);
        }
      } catch (error) {
        console.error(`Error reading story file ${file}:`, error);
      }
    }

    return stories.length > 0 ? stories : storiesData;
  } catch (error) {
    console.error('Error getting stories:', error);
    return storiesData;
  }
}

/**
 * Get a story by slug
 * @param slug - The slug of the story to get
 * @returns A promise that resolves to the story or null if not found
 */
export async function getStoryBySlug(slug: string): Promise<Story | null> {
  const stories = await getAllStories();
  return stories.find(story => story.slug === slug) || null;
}

/**
 * Save a story to the file system
 * @param story - The story to save
 * @returns A promise that resolves when the story is saved
 */
export async function saveStory(story: Story): Promise<void> {
  try {
    const articlesDir = getArticlesDir();

    // If we can't access the file system, just update the in-memory story
    if (!articlesDir || typeof fs.promises === 'undefined') {
      const index = storiesData.findIndex(s => s.id === story.id);
      if (index !== -1) {
        storiesData[index] = story;
      } else {
        storiesData.push(story);
      }
      return;
    }

    // Create the articles directory if it doesn't exist
    if (!fs.existsSync(articlesDir)) {
      fs.mkdirSync(articlesDir, { recursive: true });
    }

    // Ensure the image URL is valid
    const imageUrl = story.imageUrl && story.imageUrl.startsWith('http')
      ? story.imageUrl
      : '';

    // Create the frontmatter
    let frontmatter = `---
title: "${story.title}"
summary: "${story.excerpt || ''}"
date: "${safeToISOString(story.publishedAt)}"
country: "${story.country || 'Global'}"
type: "${story.category || 'Article'}"
imageUrl: "${imageUrl}"
featured: ${story.featured ? 'true' : 'false'}
tags: "${story.tags ? story.tags.join(', ') : ''}"`;

    // Add photographer information if available
    if (story.photographer) {
      frontmatter += `
photographer:
  name: "${story.photographer.name || 'Unsplash Photographer'}"
  url: "${story.photographer.url || 'https://unsplash.com'}"`;
    }

    // Close the frontmatter and add the content
    frontmatter += `
---

${story.content || ''}`;

    // Save the story to a file
    const filePath = path.join(articlesDir, `${story.slug}.md`);
    fs.writeFileSync(filePath, frontmatter);

    // Update the in-memory story
    const index = storiesData.findIndex(s => s.id === story.id);
    if (index !== -1) {
      storiesData[index] = story;
    } else {
      storiesData.push(story);
    }
  } catch (error) {
    console.error('Error saving story:', error);
  }
}

/**
 * Delete a story from the file system
 * @param slug - The slug of the story to delete
 * @returns A promise that resolves when the story is deleted
 */
export async function deleteStory(slug: string): Promise<void> {
  try {
    const articlesDir = getArticlesDir();

    // If we can't access the file system, just update the in-memory story
    if (!articlesDir || typeof fs.promises === 'undefined') {
      const index = storiesData.findIndex(s => s.slug === slug);
      if (index !== -1) {
        storiesData.splice(index, 1);
      }
      return;
    }

    // Delete the story file
    const filePath = path.join(articlesDir, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update the in-memory story
    const index = storiesData.findIndex(s => s.slug === slug);
    if (index !== -1) {
      storiesData.splice(index, 1);
    }
  } catch (error) {
    console.error('Error deleting story:', error);
  }
}

/**
 * Connect to the file storage system (stub implementation for compatibility)
 * @returns A promise that resolves to the mock database instance
 */
export async function connectToMongoDB(): Promise<Db> {
  console.log('FileStorage: connectToMongoDB() called');
  return mockDb;
}

/**
 * Get the stories collection (stub implementation for compatibility)
 * @returns A promise that resolves to the mock stories collection
 */
export async function getStoriesCollection(): Promise<Collection<Story>> {
  console.log('FileStorage: getStoriesCollection() called');
  return storiesCollection;
}

/**
 * Close the file storage connection (stub implementation for compatibility)
 */
export async function closeMongoDB(): Promise<void> {
  console.log('FileStorage: closeMongoDB() called');
}
