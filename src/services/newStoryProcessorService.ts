/**
 * New Story Processor Service
 *
 * This service orchestrates the entire story processing workflow using the new dailyStoryGenerator.js script:
 * 1. Fetching stories from RSS feeds
 * 2. Rewriting them using OpenAI
 * 3. Enhancing them with images from Unsplash
 * 4. Saving them as markdown files
 */

import { Story } from '@/types/Story';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

interface ProcessingStats {
  storiesFetched: number;
  storiesRewritten: number;
  storiesSaved: number;
  errors: {
    fetching: number;
    rewriting: number;
    images: number;
    saving: number;
  };
  startTime: string;
  endTime: string | null;
  elapsedTimeMs: number | null;
}

export class NewStoryProcessorService {
  private static instance: NewStoryProcessorService | null = null;
  private stats: ProcessingStats;
  private isProcessing: boolean;
  private lastProcessingTime: string | null;

  private constructor() {
    this.stats = this.createEmptyStats();
    this.isProcessing = false;
    this.lastProcessingTime = null;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): NewStoryProcessorService {
    if (!NewStoryProcessorService.instance) {
      NewStoryProcessorService.instance = new NewStoryProcessorService();
    }
    return NewStoryProcessorService.instance;
  }

  /**
   * Create empty processing stats
   */
  private createEmptyStats(): ProcessingStats {
    return {
      storiesFetched: 0,
      storiesRewritten: 0,
      storiesSaved: 0,
      errors: {
        fetching: 0,
        rewriting: 0,
        images: 0,
        saving: 0
      },
      startTime: new Date().toISOString(),
      endTime: null,
      elapsedTimeMs: null
    };
  }

  /**
   * Check if processing is currently running
   */
  public isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }

  /**
   * Get the last processing time
   */
  public getLastProcessingTime(): string | null {
    return this.lastProcessingTime;
  }

  /**
   * Get the current processing stats
   */
  public getProcessingStats(): ProcessingStats {
    return { ...this.stats };
  }

  /**
   * Process stories using the dailyStoryGenerator.js script
   */
  public async processStories(count: number = 8, cruiseCount: number = 2): Promise<Story[]> {
    if (this.isProcessing) {
      throw new Error('Story processing is already running');
    }

    this.isProcessing = true;
    this.stats = this.createEmptyStats();
    const processedStories: Story[] = [];

    try {
      console.log(`Processing ${count} stories (including ${cruiseCount} cruise stories)...`);

      // Path to the script
      const scriptPath = path.join(process.cwd(), 'scripts', 'dailyStoryGenerator.js');

      // Check if the script exists
      try {
        await fs.access(scriptPath);
      } catch (_error) {
        throw new Error('Story generator script not found');
      }

      // Execute the script
      const { stdout, stderr } = await execAsync(
        `node ${scriptPath} --count=${count} --cruise-count=${cruiseCount}`
      );

      // Log the output
      console.log('Story generator output:', stdout);
      if (stderr) {
        console.error('Story generator errors:', stderr);
      }

      // Parse the results
      const storiesGenerated = stdout.includes('Daily story generation completed successfully');

      if (!storiesGenerated) {
        throw new Error('Failed to generate stories');
      }

      // Try to extract stats from the output
      try {
        const fetchedMatch = stdout.match(/Stories fetched: (\d+)/);
        const rewrittenMatch = stdout.match(/Stories rewritten: (\d+)/);
        const savedMatch = stdout.match(/Stories saved: (\d+)/);

        if (fetchedMatch) this.stats.storiesFetched = parseInt(fetchedMatch[1], 10);
        if (rewrittenMatch) this.stats.storiesRewritten = parseInt(rewrittenMatch[1], 10);
        if (savedMatch) this.stats.storiesSaved = parseInt(savedMatch[1], 10);

        // Extract error counts if available
        const errorsMatch = stdout.match(/Errors: (\d+)/);
        if (errorsMatch) {
          const totalErrors = parseInt(errorsMatch[1], 10);
          // Distribute errors evenly (we don't have detailed breakdown)
          const errorPerType = Math.floor(totalErrors / 4);
          this.stats.errors = {
            fetching: errorPerType,
            rewriting: errorPerType,
            images: errorPerType,
            saving: errorPerType
          };
        }
      } catch (_error) {
        console.warn('Could not parse stats from output');
      }

      // Read the content directory to get the generated stories
      const contentDir = path.join(process.cwd(), 'content/articles');
      try {
        const files = await fs.readdir(contentDir);

        // Get only the most recent files (based on the number of stories saved)
        const recentFiles = files
          .filter(file => file.endsWith('.md'))
          .sort((a, b) => {
            // Sort by filename (which should include a timestamp)
            return b.localeCompare(a);
          })
          .slice(0, this.stats.storiesSaved);

        // Read each file and parse it
        for (const file of recentFiles) {
          try {
            const content = await fs.readFile(path.join(contentDir, file), 'utf8');

            // Parse frontmatter and content
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
            if (frontmatterMatch) {
              const frontmatterStr = frontmatterMatch[1];
              const contentStr = frontmatterMatch[2];

              // Parse frontmatter
              const frontmatter: Record<string, string> = {};
              frontmatterStr.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length > 0) {
                  frontmatter[key.trim()] = valueParts.join(':').trim();
                }
              });

              // Create a story object
              const story: Story = {
                id: frontmatter['slug'] || file.replace('.md', ''),
                title: frontmatter['title'] || 'Untitled',
                slug: frontmatter['slug'] || file.replace('.md', ''),
                excerpt: frontmatter['excerpt'] || '',
                content: contentStr.trim(),
                author: frontmatter['author'] || 'Global Travel Report Editorial Team',
                category: frontmatter['category'] || 'Travel',
                country: frontmatter['country'] || 'Global',
                tags: frontmatter['keywords'] ? frontmatter['keywords'].split(',').map(k => k.trim()) : [],
                featured: false,
                editorsPick: false,
                // Preserve the exact original date string
                publishedAt: frontmatter['date'] || new Date().toISOString(),
                imageUrl: frontmatter['imageUrl'] || '',
                photographer: {
                  name: frontmatter['photographer.name'] || 'Unsplash',
                  url: frontmatter['photographer.url'] || 'https://unsplash.com'
                }
              };

              processedStories.push(story);
            }
          } catch (_error) {
            console.error(`Error parsing story file ${file}:`, error);
          }
        }
      } catch (_error) {
        console.error('Error reading content directory:', error);
      }

      // Revalidate the pages to show the new stories
      try {
        console.log('Revalidating pages...');
        // Revalidate homepage
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com'}/api/revalidate?path=/`);
        // Revalidate stories page
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com'}/api/revalidate?path=/stories`);
        console.log('Pages revalidated successfully');
      } catch (revalidateError) {
        console.error('Error revalidating pages:', revalidateError);
        // Non-critical error, continue
      }

      console.log('Story processing completed successfully');
      return processedStories;
    } catch (_error) {
      console.error('Error processing stories:', error);
      throw error;
    } finally {
      // Update stats
      this.stats.endTime = new Date().toISOString();
      this.stats.elapsedTimeMs = new Date().getTime() - new Date(this.stats.startTime).getTime();
      this.lastProcessingTime = new Date().toISOString();
      this.isProcessing = false;
    }
  }
}
