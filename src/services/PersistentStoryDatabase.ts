/**
 * Persistent Story Database
 *
 * Replaces in-memory storage with persistent database using Vercel KV
 * Provides scalability and data persistence across deployments
 */

import { Story } from '@/types/Story';
import { UserSubmission } from '@/types/UserSubmission';

export interface DatabaseConfig {
  useVercelKV: boolean;
  useSupabase: boolean;
  usePlanetScale: boolean;
  fallbackToMemory: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: 'publishedAt' | 'title' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class PersistentStoryDatabase {
  private static instance: PersistentStoryDatabase | null = null;
  private config: DatabaseConfig;
  private memoryFallback: Map<string, any> = new Map();

  private constructor() {
    this.config = {
      useVercelKV: true,
      useSupabase: false,
      usePlanetScale: false,
      fallbackToMemory: true,
    };
  }

  public static getInstance(): PersistentStoryDatabase {
    if (!PersistentStoryDatabase.instance) {
      PersistentStoryDatabase.instance = new PersistentStoryDatabase();
    }
    return PersistentStoryDatabase.instance;
  }

  /**
   * Configure database settings
   */
  public configure(config: Partial<DatabaseConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Store story with persistence
   */
  public async storeStory(story: Story): Promise<Story> {
    try {
      if (this.config.useVercelKV) {
        return await this.storeStoryVercelKV(story);
      }

      if (this.config.fallbackToMemory) {
        return this.storeStoryMemory(story);
      }

      throw new Error('No database configured');
    } catch (error) {
      console.error('Error storing story:', error);

      if (this.config.fallbackToMemory) {
        return this.storeStoryMemory(story);
      }

      throw error;
    }
  }

  /**
   * Get story by ID with persistence
   */
  public async getStoryById(id: string): Promise<Story | null> {
    try {
      if (this.config.useVercelKV) {
        return await this.getStoryByIdVercelKV(id);
      }

      if (this.config.fallbackToMemory) {
        return this.getStoryByIdMemory(id);
      }

      return null;
    } catch (error) {
      console.error('Error getting story:', error);

      if (this.config.fallbackToMemory) {
        return this.getStoryByIdMemory(id);
      }

      return null;
    }
  }

  /**
   * Get all stories with pagination
   */
  public async getAllStories(options: PaginationOptions = { page: 1, limit: 50 }): Promise<PaginatedResult<Story>> {
    try {
      if (this.config.useVercelKV) {
        return await this.getAllStoriesVercelKV(options);
      }

      if (this.config.fallbackToMemory) {
        return this.getAllStoriesMemory(options);
      }

      return { data: [], pagination: this.getEmptyPagination(options) };
    } catch (error) {
      console.error('Error getting all stories:', error);

      if (this.config.fallbackToMemory) {
        return this.getAllStoriesMemory(options);
      }

      return { data: [], pagination: this.getEmptyPagination(options) };
    }
  }

  /**
   * Store user submission
   */
  public async storeSubmission(submission: UserSubmission): Promise<UserSubmission> {
    try {
      if (this.config.useVercelKV) {
        return await this.storeSubmissionVercelKV(submission);
      }

      if (this.config.fallbackToMemory) {
        return this.storeSubmissionMemory(submission);
      }

      throw new Error('No database configured');
    } catch (error) {
      console.error('Error storing submission:', error);

      if (this.config.fallbackToMemory) {
        return this.storeSubmissionMemory(submission);
      }

      throw error;
    }
  }

  /**
   * Get all submissions with pagination
   */
  public async getAllSubmissions(status?: 'pending' | 'approved' | 'rejected', options: PaginationOptions = { page: 1, limit: 20 }): Promise<PaginatedResult<UserSubmission>> {
    try {
      if (this.config.useVercelKV) {
        return await this.getAllSubmissionsVercelKV(status, options);
      }

      if (this.config.fallbackToMemory) {
        return this.getAllSubmissionsMemory(status, options);
      }

      return { data: [], pagination: this.getEmptyPagination(options) };
    } catch (error) {
      console.error('Error getting submissions:', error);

      if (this.config.fallbackToMemory) {
        return this.getAllSubmissionsMemory(status, options);
      }

      return { data: [], pagination: this.getEmptyPagination(options) };
    }
  }

  // Vercel KV Implementation
  private async storeStoryVercelKV(story: Story): Promise<Story> {
    if (typeof window !== 'undefined') {
      throw new Error('Vercel KV not available on client side');
    }

    try {
      const { kv } = await import('@vercel/kv');
      const key = `story:${story.id}`;

      await kv.set(key, JSON.stringify(story));
      await kv.sadd('stories:all', story.id);

      // Add to category index
      if (story.category) {
        await kv.sadd(`stories:category:${story.category}`, story.id);
      }

      // Add to country index
      if (story.country) {
        await kv.sadd(`stories:country:${story.country}`, story.id);
      }

      console.log(`✅ Stored story in Vercel KV: ${story.title}`);
      return story;
    } catch (error) {
      console.error('Error storing story in Vercel KV:', error);
      throw error;
    }
  }

  private async getStoryByIdVercelKV(id: string): Promise<Story | null> {
    if (typeof window !== 'undefined') {
      return null;
    }

    try {
      const { kv } = await import('@vercel/kv');
      const key = `story:${id}`;
      const storyData = await kv.get(key);

      if (!storyData) {
        return null;
      }

      return JSON.parse(storyData as string);
    } catch (error) {
      console.error('Error getting story from Vercel KV:', error);
      return null;
    }
  }

  private async getAllStoriesVercelKV(options: PaginationOptions): Promise<PaginatedResult<Story>> {
    if (typeof window !== 'undefined') {
      return { data: [], pagination: this.getEmptyPagination(options) };
    }

    try {
      const { kv } = await import('@vercel/kv');

      // Get all story IDs
      const storyIds = await kv.smembers('stories:all');

      if (storyIds.length === 0) {
        return { data: [], pagination: this.getEmptyPagination(options) };
      }

      // Get stories data
      const stories: Story[] = [];
      for (const id of storyIds) {
        const story = await this.getStoryByIdVercelKV(id);
        if (story) {
          stories.push(story);
        }
      }

      // Apply sorting
      stories.sort((a, b) => {
        const aValue = new Date(a.publishedAt || '').getTime();
        const bValue = new Date(b.publishedAt || '').getTime();
        return options.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });

      // Apply pagination
      const total = stories.length;
      const startIndex = (options.page - 1) * options.limit;
      const endIndex = startIndex + options.limit;
      const paginatedStories = stories.slice(startIndex, endIndex);

      return {
        data: paginatedStories,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          totalPages: Math.ceil(total / options.limit),
          hasNext: endIndex < total,
          hasPrev: options.page > 1,
        },
      };
    } catch (error) {
      console.error('Error getting stories from Vercel KV:', error);
      return { data: [], pagination: this.getEmptyPagination(options) };
    }
  }

  // Memory fallback implementations
  private storeStoryMemory(story: Story): Story {
    const key = `story:${story.id}`;
    this.memoryFallback.set(key, story);

    // Add to indexes
    if (!this.memoryFallback.has('stories:all')) {
      this.memoryFallback.set('stories:all', new Set());
    }
    const allStories = this.memoryFallback.get('stories:all') as Set<string>;
    allStories.add(story.id);

    console.log(`💾 Stored story in memory fallback: ${story.title}`);
    return story;
  }

  private getStoryByIdMemory(id: string): Story | null {
    const key = `story:${id}`;
    return this.memoryFallback.get(key) || null;
  }

  private getAllStoriesMemory(options: PaginationOptions): PaginatedResult<Story> {
    const allStoriesSet = this.memoryFallback.get('stories:all') as Set<string> || new Set();
    const stories: Story[] = [];

    for (const id of allStoriesSet) {
      const story = this.getStoryByIdMemory(id);
      if (story) {
        stories.push(story);
      }
    }

    // Apply sorting
    stories.sort((a, b) => {
      const aValue = new Date(a.publishedAt || '').getTime();
      const bValue = new Date(b.publishedAt || '').getTime();
      return options.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    // Apply pagination
    const total = stories.length;
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const paginatedStories = stories.slice(startIndex, endIndex);

    return {
      data: paginatedStories,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
        hasNext: endIndex < total,
        hasPrev: options.page > 1,
      },
    };
  }

  private storeSubmissionMemory(submission: UserSubmission): UserSubmission {
    const key = `submission:${submission.id}`;
    this.memoryFallback.set(key, submission);

    // Add to indexes
    if (!this.memoryFallback.has('submissions:all')) {
      this.memoryFallback.set('submissions:all', new Set());
    }
    const allSubmissions = this.memoryFallback.get('submissions:all') as Set<string>;
    allSubmissions.add(submission.id);

    console.log(`💾 Stored submission in memory fallback: ${submission.title}`);
    return submission;
  }

  private getAllSubmissionsMemory(status?: 'pending' | 'approved' | 'rejected', options: PaginationOptions = { page: 1, limit: 20 }): PaginatedResult<UserSubmission> {
    const allSubmissionsSet = this.memoryFallback.get('submissions:all') as Set<string> || new Set();
    const submissions: UserSubmission[] = [];

    for (const id of allSubmissionsSet) {
      const submission = this.memoryFallback.get(`submission:${id}`) as UserSubmission;
      if (submission && (!status || submission.status === status)) {
        submissions.push(submission);
      }
    }

    // Apply sorting
    submissions.sort((a, b) => {
      const aValue = new Date(a.createdAt || '').getTime();
      const bValue = new Date(b.createdAt || '').getTime();
      return options.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    // Apply pagination
    const total = submissions.length;
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const paginatedSubmissions = submissions.slice(startIndex, endIndex);

    return {
      data: paginatedSubmissions,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
        hasNext: endIndex < total,
        hasPrev: options.page > 1,
      },
    };
  }

  // Vercel KV submission methods
  private async storeSubmissionVercelKV(submission: UserSubmission): Promise<UserSubmission> {
    if (typeof window !== 'undefined') {
      throw new Error('Vercel KV not available on client side');
    }

    try {
      const { kv } = await import('@vercel/kv');
      const key = `submission:${submission.id}`;

      await kv.set(key, JSON.stringify(submission));
      await kv.sadd('submissions:all', submission.id);

      // Add to status index
      await kv.sadd(`submissions:status:${submission.status}`, submission.id);

      console.log(`✅ Stored submission in Vercel KV: ${submission.title}`);
      return submission;
    } catch (error) {
      console.error('Error storing submission in Vercel KV:', error);
      throw error;
    }
  }

  private async getAllSubmissionsVercelKV(status?: 'pending' | 'approved' | 'rejected', options: PaginationOptions = { page: 1, limit: 20 }): Promise<PaginatedResult<UserSubmission>> {
    if (typeof window !== 'undefined') {
      return { data: [], pagination: this.getEmptyPagination(options) };
    }

    try {
      const { kv } = await import('@vercel/kv');

      let submissionIds: string[];

      if (status) {
        submissionIds = await kv.smembers(`submissions:status:${status}`);
      } else {
        submissionIds = await kv.smembers('submissions:all');
      }

      if (submissionIds.length === 0) {
        return { data: [], pagination: this.getEmptyPagination(options) };
      }

      // Get submissions data
      const submissions: UserSubmission[] = [];
      for (const id of submissionIds) {
        const submission = await this.getSubmissionByIdVercelKV(id);
        if (submission) {
          submissions.push(submission);
        }
      }

      // Apply sorting
      submissions.sort((a, b) => {
        const aValue = new Date(a.createdAt || '').getTime();
        const bValue = new Date(b.createdAt || '').getTime();
        return options.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });

      // Apply pagination
      const total = submissions.length;
      const startIndex = (options.page - 1) * options.limit;
      const endIndex = startIndex + options.limit;
      const paginatedSubmissions = submissions.slice(startIndex, endIndex);

      return {
        data: paginatedSubmissions,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          totalPages: Math.ceil(total / options.limit),
          hasNext: endIndex < total,
          hasPrev: options.page > 1,
        },
      };
    } catch (error) {
      console.error('Error getting submissions from Vercel KV:', error);
      return { data: [], pagination: this.getEmptyPagination(options) };
    }
  }

  private async getSubmissionByIdVercelKV(id: string): Promise<UserSubmission | null> {
    if (typeof window !== 'undefined') {
      return null;
    }

    try {
      const { kv } = await import('@vercel/kv');
      const key = `submission:${id}`;
      const submissionData = await kv.get(key);

      if (!submissionData) {
        return null;
      }

      return JSON.parse(submissionData as string);
    } catch (error) {
      console.error('Error getting submission from Vercel KV:', error);
      return null;
    }
  }

  private getEmptyPagination(options: PaginationOptions) {
    return {
      page: options.page,
      limit: options.limit,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    };
  }

  /**
   * Get database statistics
   */
  public async getDatabaseStats(): Promise<{
    storiesCount: number;
    submissionsCount: number;
    pendingSubmissions: number;
    databaseType: string;
  }> {
    try {
      const storiesResult = await this.getAllStories({ page: 1, limit: 1 });
      const submissionsResult = await this.getAllSubmissions(undefined, { page: 1, limit: 1 });

      return {
        storiesCount: storiesResult.pagination.total,
        submissionsCount: submissionsResult.pagination.total,
        pendingSubmissions: 0, // Would calculate from submissions
        databaseType: this.config.useVercelKV ? 'Vercel KV' : 'Memory Fallback',
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {
        storiesCount: 0,
        submissionsCount: 0,
        pendingSubmissions: 0,
        databaseType: 'Error',
      };
    }
  }
}