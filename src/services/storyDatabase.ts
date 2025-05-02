import { Story } from '@/types/Story';
import { mockStories } from '@/src/mocks/stories';
import fs from 'fs';
import path from 'path';

/**
 * StoryDatabase using simple file-based storage
 * This provides a straightforward way to store and retrieve stories
 */
export class StoryDatabase {
  private static instance: StoryDatabase | null = null;
  private stories: Story[] = [];
  private initialized: boolean = false;
  private storiesDir: string = '';

  private constructor() {
    // Set up the stories directory path
    // This will be used for server-side operations only
    if (typeof process !== 'undefined' && process.cwd) {
      this.storiesDir = path.join(process.cwd(), 'content', 'stories');
    }

    console.log(`StoryDatabase initialized with simple file storage`);
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
      // First, try to load stories from the file system (if we're in a Node.js environment)
      let loadedFromFiles = false;

      if (this.storiesDir && typeof fs.promises !== 'undefined') {
        try {
          // Create the stories directory if it doesn't exist
          if (!fs.existsSync(this.storiesDir)) {
            fs.mkdirSync(this.storiesDir, { recursive: true });
          }

          // Check if we have any story files
          const files = fs.readdirSync(this.storiesDir).filter(file => file.endsWith('.json'));

          if (files.length > 0) {
            // Load stories from files
            const fileStories: Story[] = [];

            for (const file of files) {
              try {
                const content = fs.readFileSync(path.join(this.storiesDir, file), 'utf8');
                const story = JSON.parse(content);
                fileStories.push(story);
              } catch (err) {
                console.error(`Error reading story file ${file}:`, err);
              }
            }

            if (fileStories.length > 0) {
              this.stories = fileStories;
              loadedFromFiles = true;
              console.log(`Loaded ${this.stories.length} stories from files`);
            }
          }
        } catch (fsError) {
          console.error('Error accessing file system:', fsError);
        }
      }

      // If we couldn't load from files, use mock stories
      if (!loadedFromFiles) {
        this.stories = [...mockStories];

        // Add a timestamp to each story to make them appear recent
        const now = new Date();
        this.stories = this.stories.map((story, index) => ({
          ...story,
          publishedAt: new Date(now.getTime() - index * 24 * 60 * 60 * 1000) // Each story is one day older
        }));

        console.log(`Using ${this.stories.length} mock stories`);

        // Try to save mock stories to files for future use
        if (this.storiesDir && typeof fs.promises !== 'undefined') {
          try {
            for (const story of this.stories) {
              const filePath = path.join(this.storiesDir, `${story.slug}.json`);
              fs.writeFileSync(filePath, JSON.stringify(story, null, 2));
            }
            console.log(`Saved ${this.stories.length} mock stories to files`);
          } catch (fsError) {
            console.error('Error saving mock stories to files:', fsError);
          }
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing story database:', error);
      throw new Error('Failed to initialize story database');
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
   * Get stories by category
   * @param category - The category to filter by
   * @returns An array of stories in the specified category
   */
  public async getStoriesByCategory(category: string): Promise<Story[]> {
    await this.initialize();
    return this.stories.filter(story =>
      story.category && story.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get stories by country
   * @param country - The country to filter by
   * @returns An array of stories for the specified country
   */
  public async getStoriesByCountry(country: string): Promise<Story[]> {
    await this.initialize();
    return this.stories.filter(story =>
      story.country && story.country.toLowerCase() === country.toLowerCase()
    );
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
      // Update the existing story in memory
      this.stories[existingIndex] = story;
    } else {
      // Add the new story to memory
      this.stories.push(story);
    }

    // Try to save the story to a file
    if (this.storiesDir && typeof fs.promises !== 'undefined') {
      try {
        // Create the stories directory if it doesn't exist
        if (!fs.existsSync(this.storiesDir)) {
          fs.mkdirSync(this.storiesDir, { recursive: true });
        }

        // Save the story to a file
        const filePath = path.join(this.storiesDir, `${story.slug}.json`);
        fs.writeFileSync(filePath, JSON.stringify(story, null, 2));
        console.log(`Saved story "${story.title}" to file: ${filePath}`);
      } catch (error) {
        console.error('Error saving story to file:', error);
      }
    }

    return story;
  }

  /**
   * Add multiple stories to the database
   * @param stories - The stories to add
   * @returns The added stories
   */
  public async addStories(stories: Story[]): Promise<Story[]> {
    await this.initialize();

    // Process stories for in-memory storage
    const newStories: Story[] = [];
    const updatedStories: Story[] = [];

    // Categorize stories as new or updates
    for (const story of stories) {
      const existingIndex = this.stories.findIndex(s => s.id === story.id);

      if (existingIndex !== -1) {
        // Update existing story in memory
        this.stories[existingIndex] = story;
        updatedStories.push(story);
      } else {
        // Add new story to memory
        this.stories.push(story);
        newStories.push(story);
      }
    }

    // Try to save the stories to files
    if (this.storiesDir && typeof fs.promises !== 'undefined') {
      try {
        // Create the stories directory if it doesn't exist
        if (!fs.existsSync(this.storiesDir)) {
          fs.mkdirSync(this.storiesDir, { recursive: true });
        }

        // Save all stories to files
        for (const story of [...newStories, ...updatedStories]) {
          const filePath = path.join(this.storiesDir, `${story.slug}.json`);
          fs.writeFileSync(filePath, JSON.stringify(story, null, 2));
        }

        console.log(`Saved ${newStories.length} new and ${updatedStories.length} updated stories to files`);
      } catch (error) {
        console.error('Error saving stories to files:', error);
      }
    }

    return stories;
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

    // Get the story slug before deleting it
    const storySlug = this.stories[index].slug;

    // Delete the story from the in-memory array
    this.stories.splice(index, 1);

    // Try to delete the story file
    if (this.storiesDir && typeof fs.promises !== 'undefined' && storySlug) {
      try {
        const filePath = path.join(this.storiesDir, `${storySlug}.json`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted story file: ${filePath}`);
        }
      } catch (error) {
        console.error('Error deleting story file:', error);
      }
    }

    return true;
  }

  /**
   * Search for stories
   * @param query - The search query
   * @returns An array of stories matching the query
   */
  public async searchStories(query: string): Promise<Story[]> {
    await this.initialize();

    if (!query) {
      return this.stories;
    }

    const lowerQuery = query.toLowerCase();

    // Simple in-memory search
    return this.stories.filter(story =>
      (story.title && story.title.toLowerCase().includes(lowerQuery)) ||
      (story.content && story.content.toLowerCase().includes(lowerQuery)) ||
      (story.excerpt && story.excerpt.toLowerCase().includes(lowerQuery)) ||
      (story.category && story.category.toLowerCase().includes(lowerQuery)) ||
      (story.country && story.country.toLowerCase().includes(lowerQuery)) ||
      (story.tags && story.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }
}
