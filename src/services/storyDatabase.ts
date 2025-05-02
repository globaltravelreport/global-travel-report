import { Story } from '@/types/Story';
import { mockStories } from '@/src/mocks/stories';
import { getStoriesCollection } from '@/src/utils/mongodb';

/**
 * StoryDatabase using MongoDB Atlas for persistent storage
 * This provides robust, scalable storage for stories
 */
export class StoryDatabase {
  private static instance: StoryDatabase | null = null;
  private stories: Story[] = [];
  private initialized: boolean = false;
  private useMongoDB: boolean = false;

  private constructor() {
    // Check if MongoDB is available
    this.useMongoDB = typeof process !== 'undefined' &&
                      typeof process.env !== 'undefined' &&
                      !!process.env.MONGODB_URI;

    console.log(`StoryDatabase initialized with MongoDB: ${this.useMongoDB ? 'enabled' : 'disabled'}`);
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
      if (this.useMongoDB) {
        // Try to load stories from MongoDB
        try {
          const storiesCollection = await getStoriesCollection();
          const mongoStories = await storiesCollection.find({}).toArray();

          if (mongoStories && mongoStories.length > 0) {
            this.stories = mongoStories;
            console.log(`Loaded ${this.stories.length} stories from MongoDB`);
          } else {
            // If no stories in MongoDB, use mock stories
            this.stories = [...mockStories];

            // Add a timestamp to each story to make them appear recent
            const now = new Date();
            this.stories = this.stories.map((story, index) => ({
              ...story,
              publishedAt: new Date(now.getTime() - index * 24 * 60 * 60 * 1000) // Each story is one day older
            }));

            // Save mock stories to MongoDB
            await storiesCollection.insertMany(this.stories);
            console.log(`Initialized MongoDB with ${this.stories.length} mock stories`);
          }
        } catch (mongoError) {
          console.error('Error accessing MongoDB:', mongoError);
          // Fall back to mock stories if MongoDB access fails
          this.stories = [...mockStories];
          console.log(`Falling back to ${this.stories.length} mock stories due to MongoDB error`);
        }
      } else {
        // Use mock stories if MongoDB is not available
        this.stories = [...mockStories];

        // Add a timestamp to each story to make them appear recent
        const now = new Date();
        this.stories = this.stories.map((story, index) => ({
          ...story,
          publishedAt: new Date(now.getTime() - index * 24 * 60 * 60 * 1000) // Each story is one day older
        }));

        console.log(`Using ${this.stories.length} mock stories (MongoDB not available)`);
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

    // If MongoDB is available, save the story
    if (this.useMongoDB) {
      try {
        const storiesCollection = await getStoriesCollection();

        if (existingIndex !== -1) {
          // Update the existing story in MongoDB
          await storiesCollection.updateOne(
            { id: story.id },
            { $set: story }
          );
          console.log(`Updated story "${story.title}" in MongoDB`);
        } else {
          // Insert the new story in MongoDB
          await storiesCollection.insertOne(story);
          console.log(`Inserted story "${story.title}" into MongoDB`);
        }
      } catch (error) {
        console.error('Error saving story to MongoDB:', error);
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

    // Process stories for in-memory storage and MongoDB operations
    const newStories: Story[] = [];
    const updateOperations: { id: string, story: Story }[] = [];

    // Categorize stories as new or updates
    for (const story of stories) {
      const existingIndex = this.stories.findIndex(s => s.id === story.id);

      if (existingIndex !== -1) {
        // Update existing story in memory
        this.stories[existingIndex] = story;
        updateOperations.push({ id: story.id, story });
      } else {
        // Add new story to memory
        this.stories.push(story);
        newStories.push(story);
      }
    }

    // If MongoDB is available, save the stories
    if (this.useMongoDB && (newStories.length > 0 || updateOperations.length > 0)) {
      try {
        const storiesCollection = await getStoriesCollection();

        // Insert new stories in bulk if any
        if (newStories.length > 0) {
          await storiesCollection.insertMany(newStories);
          console.log(`Inserted ${newStories.length} new stories into MongoDB`);
        }

        // Update existing stories one by one
        for (const op of updateOperations) {
          await storiesCollection.updateOne(
            { id: op.id },
            { $set: op.story }
          );
        }

        if (updateOperations.length > 0) {
          console.log(`Updated ${updateOperations.length} existing stories in MongoDB`);
        }
      } catch (error) {
        console.error('Error saving stories to MongoDB:', error);
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

    // If MongoDB is available, delete the story
    if (this.useMongoDB) {
      try {
        const storiesCollection = await getStoriesCollection();
        await storiesCollection.deleteOne({ id });
        console.log(`Deleted story with ID ${id} from MongoDB`);
      } catch (error) {
        console.error('Error deleting story from MongoDB:', error);
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

    // If MongoDB is available and we want to use MongoDB's search capabilities
    if (this.useMongoDB) {
      try {
        const storiesCollection = await getStoriesCollection();

        // Use MongoDB text search if a text index is set up
        // Otherwise, fall back to a simple query
        const results = await storiesCollection.find({
          $or: [
            { title: { $regex: lowerQuery, $options: 'i' } },
            { content: { $regex: lowerQuery, $options: 'i' } },
            { excerpt: { $regex: lowerQuery, $options: 'i' } },
            { category: { $regex: lowerQuery, $options: 'i' } },
            { country: { $regex: lowerQuery, $options: 'i' } }
          ]
        }).toArray();

        return results;
      } catch (error) {
        console.error('Error searching stories in MongoDB:', error);
        // Fall back to in-memory search
      }
    }

    // In-memory search
    return this.stories.filter(story =>
      (story.title && story.title.toLowerCase().includes(lowerQuery)) ||
      (story.content && story.content.toLowerCase().includes(lowerQuery)) ||
      (story.excerpt && story.excerpt.toLowerCase().includes(lowerQuery)) ||
      (story.category && story.category.toLowerCase().includes(lowerQuery)) ||
      (story.country && story.country.toLowerCase().includes(lowerQuery))
    );
  }
}
