/**
 * File-based Storage Utility
 *
 * This is a simple implementation that uses file-based storage.
 * It provides a similar interface to what would be expected from a database,
 * but doesn't require any external database dependencies.
 */

import { Story } from '@/types/Story';
import { mockStories } from '@/src/mocks/stories';
// Note: fs and path are only available on server-side
// Use require conditionally to avoid bundling issues on the client
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs: any = typeof window === 'undefined' ? require('fs') : null;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path: any = typeof window === 'undefined' ? require('path') : null;
import { validateDate, getSafeDateString } from '@/utils/date-utils';

/**
 * Safely convert a date string to an ISO string
 * @param dateStr - The date string to convert
 * @param preserveFutureDates - Whether to preserve future dates (default: true)
 * @returns A valid ISO date string
 */
function safeToISOString(dateStr: string | Date | undefined, preserveFutureDates: boolean = true): string {
  // Special handling for dates with year 2025 or later - always preserve them exactly as they are
  if (typeof dateStr === 'string' && dateStr.includes('2025')) {
    try {
      // Try to create a Date object to validate it
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        // It's a valid date, return the original string to preserve exact format
        return dateStr;
      }
    } catch (e) {
      // If there's an error, continue with normal validation
    }
  }

  // Use our improved date handling function with preserveFutureDates set to true by default
  return getSafeDateString(dateStr, false, preserveFutureDates);
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
          const photographerData: { name?: string; url?: string } = {};

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
              // Don't log warnings for invalid URLs, just reset them
              // console.warn(`Invalid image URL in ${file}: ${cleanImageUrl}`);
              cleanImageUrl = ''; // Reset invalid URLs
            }
            // Valid URL, no need to log anything
          }

          // Clean up the content - remove "Content:" prefix and "Metadata in JSON format:" suffix if present
          let cleanContent = storyContent.trim();
          if (cleanContent.startsWith('Content:')) {
            cleanContent = cleanContent.substring('Content:'.length).trim();
          }

          // Remove metadata suffix if present
          const metadataIndex = cleanContent.lastIndexOf('Metadata in JSON format:');
          if (metadataIndex !== -1) {
            cleanContent = cleanContent.substring(0, metadataIndex).trim();
          }

          // Special handling for 2025 dates - preserve them exactly as they are
          let publishedDate = storyData.date;

          // If it's not a 2025 date, use our safe conversion
          if (typeof storyData.date !== 'string' || !storyData.date.includes('2025')) {
            publishedDate = safeToISOString(storyData.date, true);
          }

          // Create a story object
          const story: Story = {
            id: file.replace('.md', ''),
            slug: storyData.slug || file.replace('.md', ''),
            title: storyData.title || 'Untitled',
            content: cleanContent,
            excerpt: storyData.summary || '',
            author: 'Global Travel Report Editorial Team',
            // Use our processed date
            publishedAt: publishedDate,
            // Keep the original date string for reference
            date: storyData.date,
            category: storyData.type || 'Article',
            country: storyData.country || 'Global',
            imageUrl: cleanImageUrl,
            featured: storyData.featured === 'true',
            editorsPick: false,
            tags: storyData.tags
              ? storyData.tags.split(',').map((tag: string) => tag.trim())
              : storyData.keywords
                ? storyData.keywords.split(',').map((tag: string) => tag.trim())
                : []
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

          // If we still don't have a valid image URL, use a default based on category and story title
          if (!story.imageUrl) {
            // Category-specific default images with multiple options for variety
            const defaultImages = {
              'Travel': [
                'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&q=80&w=2400'
              ],
              'Cruise': [
                'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1548690396-1fae5d6a3f8a?auto=format&q=80&w=2400'
              ],
              'Destination': [
                'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&q=80&w=2400'
              ],
              'Adventure': [
                'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&q=80&w=2400'
              ],
              'Culture': [
                'https://images.unsplash.com/photo-1493707553966-283afac8c358?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1577083552431-6e5fd01988a5?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&q=80&w=2400'
              ],
              'Food & Wine': [
                'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1543352634-99a5d50ae78e?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1533777324565-a040eb52facd?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&q=80&w=2400'
              ],
              'Airline': [
                'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&q=80&w=2400'
              ],
              'Hotel': [
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&q=80&w=2400',
                'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&q=80&w=2400'
              ]
            };

            // Find a matching category or use Travel as default
            const category = story.category.split(',')[0].trim();
            const imageArray = defaultImages[category] || defaultImages['Travel'];

            // Use the story title to deterministically select an image from the array
            const titleHash = story.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const index = titleHash % imageArray.length;

            story.imageUrl = imageArray[index];

            // Add default photographer if none exists
            if (!story.photographer) {
              // Different photographers for different categories
              const photographers = {
                'Travel': { name: 'Travel Photographer', url: 'https://unsplash.com/@travelphoto' },
                'Cruise': { name: 'Ocean Explorer', url: 'https://unsplash.com/@oceanexplorer' },
                'Destination': { name: 'Destination Guide', url: 'https://unsplash.com/@destguide' },
                'Adventure': { name: 'Adventure Seeker', url: 'https://unsplash.com/@adventureseeker' },
                'Culture': { name: 'Culture Enthusiast', url: 'https://unsplash.com/@cultureenthusiast' },
                'Food & Wine': { name: 'Food Photographer', url: 'https://unsplash.com/@foodphoto' },
                'Airline': { name: 'Aviation Photographer', url: 'https://unsplash.com/@aviationphoto' },
                'Hotel': { name: 'Hotel Photographer', url: 'https://unsplash.com/@hotelphoto' }
              };

              story.photographer = photographers[category] || { name: 'Unsplash Photographer', url: 'https://unsplash.com' };
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
  try {
    console.log(`[fileStorage.getStoryBySlug] Looking for story with slug: ${slug}`);

    // Normalize the slug for comparison
    const normalizedSlug = slug.trim().toLowerCase();

    // Get all stories
    const stories = await getAllStories();

    // Try exact match first
    let story = stories.find(s => s.slug === slug);

    // If not found, try case-insensitive match
    if (!story) {
      story = stories.find(s => s.slug.toLowerCase() === normalizedSlug);
    }

    // If still not found, try partial match (for slugs that might have been truncated)
    if (!story && slug.length > 5) {
      story = stories.find(s =>
        s.slug.toLowerCase().includes(normalizedSlug) ||
        normalizedSlug.includes(s.slug.toLowerCase())
      );
    }

    // If still not found, try to load the file directly
    if (!story) {
      console.log(`[fileStorage.getStoryBySlug] Story not found in memory, trying to load file directly`);
      const articlesDir = getArticlesDir();

      if (articlesDir && fs.existsSync(articlesDir)) {
        // Try with exact slug
        let filePath = path.join(articlesDir, `${slug}.md`);

        // If file doesn't exist, try to find a file with a similar name
        if (!fs.existsSync(filePath)) {
          const files = fs.readdirSync(articlesDir).filter(file => file.endsWith('.md'));
          const matchingFile = files.find(file =>
            file.toLowerCase().includes(normalizedSlug) ||
            normalizedSlug.includes(file.toLowerCase().replace('.md', ''))
          );

          if (matchingFile) {
            filePath = path.join(articlesDir, matchingFile);
          }
        }

        // If we found a file, try to parse it
        if (fs.existsSync(filePath)) {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

            if (frontmatterMatch) {
              const frontmatter = frontmatterMatch[1];
              const storyContent = frontmatterMatch[2];

              // Parse the frontmatter into key-value pairs
              const frontmatterLines = frontmatter.split('\n');
              const storyData: Record<string, any> = {};
              let inPhotographerBlock = false;
              const photographerData: { name?: string; url?: string } = {};

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

              // Clean up the content
              let cleanContent = storyContent.trim();
              if (cleanContent.startsWith('Content:')) {
                cleanContent = cleanContent.substring('Content:'.length).trim();
              }

              // Remove metadata suffix if present
              const metadataIndex = cleanContent.lastIndexOf('Metadata in JSON format:');
              if (metadataIndex !== -1) {
                cleanContent = cleanContent.substring(0, metadataIndex).trim();
              }

              // Special handling for 2025 dates - preserve them exactly as they are
              let publishedDate = storyData.date;

              // If it's not a 2025 date, use our safe conversion
              if (typeof storyData.date !== 'string' || !storyData.date.includes('2025')) {
                publishedDate = safeToISOString(storyData.date, true);
              }

              // Create a story object
              const fileName = path.basename(filePath, '.md');
              story = {
                id: fileName,
                slug: storyData.slug || fileName,
                title: storyData.title || 'Untitled',
                content: cleanContent,
                excerpt: storyData.summary || '',
                author: 'Global Travel Report Editorial Team',
                publishedAt: publishedDate,
                date: storyData.date, // Preserve the original date string
                category: storyData.type || 'Article',
                country: storyData.country || 'Global',
                imageUrl: storyData.imageUrl || '',
                featured: storyData.featured === 'true',
                editorsPick: false,
                tags: storyData.tags
                  ? storyData.tags.split(',').map((tag: string) => tag.trim())
                  : storyData.keywords
                    ? storyData.keywords.split(',').map((tag: string) => tag.trim())
                    : []
              };

              // Add photographer information if available
              if (storyData.photographer) {
                story.photographer = storyData.photographer;
              }

              console.log(`[fileStorage.getStoryBySlug] Successfully loaded story from file: ${story.title}`);
            }
          } catch (error) {
            console.error(`[fileStorage.getStoryBySlug] Error parsing file ${filePath}:`, error);
          }
        }
      }
    }

    if (story) {
      console.log(`[fileStorage.getStoryBySlug] Found story: ${story.title}`);
    } else {
      console.log(`[fileStorage.getStoryBySlug] Story not found for slug: ${slug}`);
    }

    return story || null;
  } catch (error) {
    console.error(`[fileStorage.getStoryBySlug] Error getting story by slug ${slug}:`, error);
    return null;
  }
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

    // Check if the file already exists to preserve original dates
    const filePath = path.join(articlesDir, `${story.slug}.md`);
    let existingDate = null;

    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          const frontmatterLines = frontmatter.split('\n');

          // Look for date or publishedAt in the frontmatter
          for (const line of frontmatterLines) {
            const dateMatch = line.match(/^date:\s*"(.+)"$/);
            const publishedAtMatch = line.match(/^publishedAt:\s*"(.+)"$/);

            if (dateMatch) {
              existingDate = dateMatch[1];
              break;
            } else if (publishedAtMatch) {
              existingDate = publishedAtMatch[1];
              break;
            }
          }
        }
      } catch (error) {
        console.error(`Error reading existing story file ${filePath}:`, error);
      }
    }

    // Ensure the image URL is valid
    const imageUrl = story.imageUrl && story.imageUrl.startsWith('http')
      ? story.imageUrl
      : '';

    // Create the frontmatter
    let frontmatter = `---
title: "${story.title}"
summary: "${story.excerpt || ''}"
date: "${existingDate || story.date || safeToISOString(story.publishedAt, true)}"
publishedAt: "${existingDate || story.date || safeToISOString(story.publishedAt, true)}"
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

${story.content || ''}`;

    // Save the story to a file
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
