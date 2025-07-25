import { Story } from '@/types/Story';
import { mockStories } from '@/src/mocks/stories';
import { getSafeDateString } from '@/utils/date-utils';

/**
 * StoryDatabase using in-memory storage with mock data
 * This provides a straightforward way to store and retrieve stories
 */
export class StoryDatabase {
  private static instance: StoryDatabase | null = null;
  private stories: Story[] = [];
  private initialized: boolean = false;

  private constructor() {
    console.log(`StoryDatabase initialized with in-memory storage`);
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
      // Use mock stories as the primary data source
      this.stories = [...mockStories];

      // Process all stories to ensure dates are valid
      // We want to preserve future dates, especially those from 2025
      this.stories = this.stories.map((story, index) => {
        // For dates that are strings and contain "2025", preserve them exactly as they are
        if (story.date && typeof story.date === 'string' && story.date.includes('2025')) {
          return {
            ...story,
            // Keep the original date string
            date: story.date,
            // Use the original date string for publishedAt as well
            publishedAt: story.date
          };
        }

        // For other dates, use our improved date validation
        const publishedDate = story.publishedAt ?
          getSafeDateString(story.publishedAt, true, true) :
          new Date().toISOString();

        return {
          ...story,
          publishedAt: publishedDate,
          // If date is explicitly set, keep it, otherwise use publishedAt
          date: story.date || publishedDate
        };
      });

      // Add a timestamp to each story to make them appear recent
      const now = new Date();
      this.stories = this.stories.map((story, index) => {
        const publishedAt = new Date(now.getTime() - index * 24 * 60 * 60 * 1000); // Each story is one day older
        return {
          ...story,
          publishedAt: story.publishedAt || publishedAt.toISOString(),
          date: story.date || publishedAt.toISOString()
        };
      });

      console.log(`Loaded ${this.stories.length} stories from mock data`);
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

    // Normalize the slug for comparison
    const normalizedSlug = slug.trim().toLowerCase();

    // Try exact match first
    let story = this.stories.find(s => s.slug === slug);

    // If not found, try case-insensitive match
    if (!story) {
      story = this.stories.find(s => s.slug.toLowerCase() === normalizedSlug);
    }

    // If still not found, try partial match (for slugs that might have been truncated)
    if (!story && slug.length > 5) {
      story = this.stories.find(s =>
        s.slug.toLowerCase().includes(normalizedSlug) ||
        normalizedSlug.includes(s.slug.toLowerCase())
      );
    }

    return story || null;
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

    console.log(`Saved story "${story.title}" to in-memory storage`);

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

    console.log(`Saved ${newStories.length} new and ${updatedStories.length} updated stories to in-memory storage`);

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

    console.log(`Deleted story from in-memory storage: ${storySlug}`);

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
