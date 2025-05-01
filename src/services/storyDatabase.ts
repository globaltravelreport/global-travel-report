import { Story } from '@/types/Story';
import fs from 'fs/promises';
import path from 'path';

/**
 * Simple file-based database for stories
 * In a production environment, this would be replaced with a real database like MongoDB or PostgreSQL
 */
export class StoryDatabase {
  private static instance: StoryDatabase | null = null;
  private dbPath: string;
  private stories: Story[] = [];
  private initialized: boolean = false;

  private constructor() {
    // Set the database path to the data directory
    this.dbPath = path.join(process.cwd(), 'data', 'stories.json');
  }

  /**
   * Get the singleton instance of StoryDatabase
   * @returns The singleton instance
   */
  public static getInstance(): StoryDatabase {
    if (!StoryDatabase.instance) {
      StoryDatabase.instance = new StoryDatabase();
    }
    return StoryDatabase.instance;
  }

  /**
   * Initialize the database
   * @returns A promise that resolves when initialization is complete
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Create the data directory if it doesn't exist
      const dataDir = path.dirname(this.dbPath);
      await fs.mkdir(dataDir, { recursive: true });

      // Load stories from the database file
      try {
        const data = await fs.readFile(this.dbPath, 'utf-8');
        this.stories = JSON.parse(data);
      } catch (error) {
        // If the file doesn't exist or is invalid, create an empty database
        this.stories = [];
        await this.saveToFile();
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing story database:', error);
      throw new Error('Failed to initialize story database');
    }
  }

  /**
   * Save stories to the database file
   * @returns A promise that resolves when saving is complete
   * @private
   */
  private async saveToFile(): Promise<void> {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(this.stories, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving stories to file:', error);
      throw new Error('Failed to save stories to file');
    }
  }

  /**
   * Get all stories
   * @returns All stories in the database
   */
  public async getAllStories(): Promise<Story[]> {
    await this.initialize();
    return [...this.stories];
  }

  /**
   * Get stories by category
   * @param category - The category to filter by
   * @returns Stories in the specified category
   */
  public async getStoriesByCategory(category: string): Promise<Story[]> {
    await this.initialize();
    return this.stories.filter(story => 
      story.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get stories by date range
   * @param startDate - The start date
   * @param endDate - The end date
   * @returns Stories in the specified date range
   */
  public async getStoriesByDateRange(startDate: Date, endDate: Date): Promise<Story[]> {
    await this.initialize();
    return this.stories.filter(story => {
      const publishedAt = story.publishedAt instanceof Date 
        ? story.publishedAt 
        : new Date(story.publishedAt);
      
      return publishedAt >= startDate && publishedAt <= endDate;
    });
  }

  /**
   * Get a story by ID
   * @param id - The ID of the story to get
   * @returns The story with the specified ID, or null if not found
   */
  public async getStoryById(id: string): Promise<Story | null> {
    await this.initialize();
    return this.stories.find(story => story.id === id) || null;
  }

  /**
   * Get a story by slug
   * @param slug - The slug of the story to get
   * @returns The story with the specified slug, or null if not found
   */
  public async getStoryBySlug(slug: string): Promise<Story | null> {
    await this.initialize();
    return this.stories.find(story => story.slug === slug) || null;
  }

  /**
   * Add a story to the database
   * @param story - The story to add
   * @returns The added story
   */
  public async addStory(story: Story): Promise<Story> {
    await this.initialize();
    
    // Check if a story with the same ID already exists
    const existingIndex = this.stories.findIndex(s => s.id === story.id);
    
    if (existingIndex !== -1) {
      // Update the existing story
      this.stories[existingIndex] = story;
    } else {
      // Add the new story
      this.stories.push(story);
    }
    
    // Save to file
    await this.saveToFile();
    
    return story;
  }

  /**
   * Update a story in the database
   * @param id - The ID of the story to update
   * @param story - The updated story
   * @returns The updated story, or null if not found
   */
  public async updateStory(id: string, story: Partial<Story>): Promise<Story | null> {
    await this.initialize();
    
    const index = this.stories.findIndex(s => s.id === id);
    
    if (index === -1) {
      return null;
    }
    
    // Update the story
    this.stories[index] = {
      ...this.stories[index],
      ...story
    };
    
    // Save to file
    await this.saveToFile();
    
    return this.stories[index];
  }

  /**
   * Delete a story from the database
   * @param id - The ID of the story to delete
   * @returns True if the story was deleted, false if not found
   */
  public async deleteStory(id: string): Promise<boolean> {
    await this.initialize();
    
    const index = this.stories.findIndex(s => s.id === id);
    
    if (index === -1) {
      return false;
    }
    
    // Remove the story
    this.stories.splice(index, 1);
    
    // Save to file
    await this.saveToFile();
    
    return true;
  }
}
