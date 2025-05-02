import { Story } from '@/types/Story';
import { mockStories } from '@/src/mocks/stories';
import { kv } from '@vercel/kv';

/**
 * StoryDatabase using Vercel KV for persistent storage
 * This is compatible with Edge Runtime and provides persistent storage
 */
export class StoryDatabase {
  private static instance: StoryDatabase | null = null;
  private stories: Story[] = [];
  private initialized: boolean = false;
  private useKv: boolean = false;

  private constructor() {
    // Check if Vercel KV is available
    this.useKv = typeof kv !== 'undefined' &&
                 typeof process !== 'undefined' &&
                 typeof process.env !== 'undefined' &&
                 !!process.env.KV_REST_API_URL &&
                 !!process.env.KV_REST_API_TOKEN;

    console.log(`StoryDatabase initialized with KV: ${this.useKv ? 'enabled' : 'disabled'}`);
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
      if (this.useKv) {
        // Try to load stories from Vercel KV
        try {
          const kvStories = await kv.get<Story[]>('stories');
          if (kvStories && Array.isArray(kvStories) && kvStories.length > 0) {
            this.stories = kvStories;
            console.log(`Loaded ${this.stories.length} stories from Vercel KV`);
          } else {
            // If no stories in KV, use mock stories
            this.stories = [...mockStories];

            // Add a timestamp to each story to make them appear recent
            const now = new Date();
            this.stories = this.stories.map((story, index) => ({
              ...story,
              publishedAt: new Date(now.getTime() - index * 24 * 60 * 60 * 1000) // Each story is one day older
            }));

            // Save mock stories to KV
            await kv.set('stories', this.stories);
            console.log(`Initialized Vercel KV with ${this.stories.length} mock stories`);
          }
        } catch (kvError) {
          console.error('Error accessing Vercel KV:', kvError);
          // Fall back to mock stories if KV access fails
          this.stories = [...mockStories];
          console.log(`Falling back to ${this.stories.length} mock stories due to KV error`);
        }
      } else {
        // Use mock stories if KV is not available
        this.stories = [...mockStories];

        // Add a timestamp to each story to make them appear recent
        const now = new Date();
        this.stories = this.stories.map((story, index) => ({
          ...story,
          publishedAt: new Date(now.getTime() - index * 24 * 60 * 60 * 1000) // Each story is one day older
        }));

        console.log(`Using ${this.stories.length} mock stories (KV not available)`);
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
      // Update the existing story
      this.stories[existingIndex] = story;
    } else {
      // Add the new story
      this.stories.push(story);
    }

    // If Vercel KV is available, save the updated stories array
    if (this.useKv) {
      try {
        await kv.set('stories', this.stories);
        console.log(`Saved ${this.stories.length} stories to Vercel KV after adding/updating "${story.title}"`);
      } catch (error) {
        console.error('Error saving stories to Vercel KV:', error);
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

    // Add or update each story
    for (const story of stories) {
      const existingIndex = this.stories.findIndex(s => s.id === story.id);
      if (existingIndex !== -1) {
        this.stories[existingIndex] = story;
      } else {
        this.stories.push(story);
      }
    }

    // If Vercel KV is available, save the updated stories array
    if (this.useKv) {
      try {
        await kv.set('stories', this.stories);
        console.log(`Saved ${this.stories.length} stories to Vercel KV after adding ${stories.length} stories`);
      } catch (error) {
        console.error('Error saving stories to Vercel KV:', error);
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

    // Delete the story from the in-memory array
    this.stories.splice(index, 1);

    // If Vercel KV is available, save the updated stories array
    if (this.useKv) {
      try {
        await kv.set('stories', this.stories);
        console.log(`Saved ${this.stories.length} stories to Vercel KV after deleting a story`);
      } catch (error) {
        console.error('Error saving stories to Vercel KV:', error);
      }
    }

    return true;
  }
}
