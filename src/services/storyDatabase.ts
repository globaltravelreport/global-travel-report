import { Story } from '../../types/Story';
import { UserSubmission } from '../../types/UserSubmission';
import { mockStories } from '../mocks/stories';
import { getSafeDateString } from '../utils/date-utils';

/**
 * StoryDatabase using in-memory storage with mock data
 * This provides a straightforward way to store and retrieve stories
 */
export class StoryDatabase {
  private static instance: StoryDatabase | null = null;
  private stories: Story[] = [];
  private submissions: UserSubmission[] = [];
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
   * Update an existing story in the database
   * @param id - The ID of the story to update
   * @param updates - The partial story data to update
   * @returns The updated story, or null if not found
   */
  public async updateStory(id: string, updates: Partial<Story>): Promise<Story | null> {
    await this.initialize();

    const storyIndex = this.stories.findIndex(s => s.id === id);
    if (storyIndex === -1) {
      return null;
    }

    // Update the story with the new data
    this.stories[storyIndex] = { ...this.stories[storyIndex], ...updates };

    console.log(`Updated story "${this.stories[storyIndex].title}" in in-memory storage`);

    return this.stories[storyIndex];
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

 /**
  * Get paginated stories
  * @param page - Page number (1-based)
  * @param limit - Number of stories per page
  * @param options - Additional filtering options
  * @returns Paginated stories with metadata
  */
 public async getPaginatedStories(
   page: number = 1,
   limit: number = 10,
   options: {
     category?: string;
     country?: string;
     featured?: boolean;
     editorsPick?: boolean;
     sortBy?: 'publishedAt' | 'title' | 'category';
     sortOrder?: 'asc' | 'desc';
   } = {}
 ): Promise<{
   stories: Story[];
   pagination: {
     page: number;
     limit: number;
     total: number;
     totalPages: number;
     hasNext: boolean;
     hasPrev: boolean;
   };
 }> {
   await this.initialize();

   let filteredStories = [...this.stories];

   // Apply filters
   if (options.category) {
     filteredStories = filteredStories.filter(story =>
       story.category?.toLowerCase() === options.category?.toLowerCase()
     );
   }

   if (options.country) {
     filteredStories = filteredStories.filter(story =>
       story.country?.toLowerCase() === options.country?.toLowerCase()
     );
   }

   if (options.featured !== undefined) {
     filteredStories = filteredStories.filter(story => story.featured === options.featured);
   }

   if (options.editorsPick !== undefined) {
     filteredStories = filteredStories.filter(story => story.editorsPick === options.editorsPick);
   }

   // Apply sorting
   const sortBy = options.sortBy || 'publishedAt';
   const sortOrder = options.sortOrder || 'desc';

   filteredStories.sort((a, b) => {
     let aValue: any;
     let bValue: any;

     switch (sortBy) {
       case 'title':
         aValue = a.title?.toLowerCase() || '';
         bValue = b.title?.toLowerCase() || '';
         break;
       case 'category':
         aValue = a.category?.toLowerCase() || '';
         bValue = b.category?.toLowerCase() || '';
         break;
       case 'publishedAt':
       default:
         aValue = new Date(a.publishedAt || '').getTime();
         bValue = new Date(b.publishedAt || '').getTime();
         break;
     }

     if (sortOrder === 'asc') {
       return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
     } else {
       return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
     }
   });

   // Apply pagination
   const total = filteredStories.length;
   const totalPages = Math.ceil(total / limit);
   const startIndex = (page - 1) * limit;
   const endIndex = startIndex + limit;
   const paginatedStories = filteredStories.slice(startIndex, endIndex);

   return {
     stories: paginatedStories,
     pagination: {
       page,
       limit,
       total,
       totalPages,
       hasNext: page < totalPages,
       hasPrev: page > 1
     }
   };
 }

 /**
  * Archive old stories (older than specified days)
  * @param daysOld - Archive stories older than this many days
  * @returns Number of stories archived
  */
 public async archiveOldStories(daysOld: number = 90): Promise<number> {
   await this.initialize();

   const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
   const storiesToArchive: Story[] = [];
   const remainingStories: Story[] = [];

   for (const story of this.stories) {
     const storyDate = new Date(story.publishedAt || '');
     if (storyDate < cutoffDate) {
       storiesToArchive.push(story);
     } else {
       remainingStories.push(story);
     }
   }

   // In a real implementation, you might move to a separate archive collection
   // For now, we'll just remove them from active stories
   const archivedCount = storiesToArchive.length;
   this.stories = remainingStories;

   if (archivedCount > 0) {
     console.log(`Archived ${archivedCount} stories older than ${daysOld} days`);
   }

   return archivedCount;
 }

 /**
  * Get stories that need to be archived (preview mode)
  * @param daysOld - Stories older than this many days
  * @returns Stories that would be archived
  */
 public async getStoriesToArchive(daysOld: number = 90): Promise<Story[]> {
   await this.initialize();

   const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

   return this.stories.filter(story => {
     const storyDate = new Date(story.publishedAt || '');
     return storyDate < cutoffDate;
   });
 }

 /**
  * Clean up old archived stories and optimize storage
  * @returns Cleanup statistics
  */
 public async cleanupStorage(): Promise<{
   archivedCount: number;
   totalStories: number;
   storageOptimized: boolean;
 }> {
   const archivedCount = await this.archiveOldStories(90);
   const totalStories = this.stories.length;

   return {
     archivedCount,
     totalStories,
     storageOptimized: archivedCount > 0
   };
 }

 /**
  * Store a user submission
  * @param submission - The user submission to store
  * @returns The stored submission
  */
 public async storeSubmission(submission: UserSubmission): Promise<UserSubmission> {
   await this.initialize();

   // Check if submission already exists
   const existingIndex = this.submissions.findIndex(s => s.id === submission.id);

   if (existingIndex !== -1) {
     // Update existing submission
     this.submissions[existingIndex] = submission;
   } else {
     // Add new submission
     this.submissions.push(submission);
   }

   console.log(`Stored submission "${submission.title}" by ${submission.name}`);
   return submission;
 }

 /**
  * Get all user submissions
  * @param status - Optional status filter ('pending', 'approved', 'rejected')
  * @returns Array of user submissions
  */
 public async getAllSubmissions(status?: 'pending' | 'approved' | 'rejected'): Promise<UserSubmission[]> {
   await this.initialize();

   if (status) {
     return this.submissions.filter(submission => submission.status === status);
   }

   return [...this.submissions];
 }

 /**
  * Get a user submission by ID
  * @param id - The ID of the submission to get
  * @returns The submission with the specified ID, or null if not found
  */
 public async getSubmissionById(id: string): Promise<UserSubmission | null> {
   await this.initialize();
   return this.submissions.find(submission => submission.id === id) || null;
 }

 /**
  * Update submission status
  * @param id - The ID of the submission to update
  * @param updates - The status updates to apply
  * @returns The updated submission, or null if not found
  */
 public async updateSubmissionStatus(
   id: string,
   updates: { status: 'approved' | 'rejected'; reviewedBy?: string; rejectionReason?: string; approvedStoryId?: string }
 ): Promise<UserSubmission | null> {
   await this.initialize();

   const submissionIndex = this.submissions.findIndex(s => s.id === id);
   if (submissionIndex === -1) {
     return null;
   }

   // Update the submission
   this.submissions[submissionIndex] = {
     ...this.submissions[submissionIndex],
     ...updates,
     updatedAt: new Date().toISOString(),
     reviewedAt: new Date().toISOString(),
   };

   console.log(`Updated submission "${this.submissions[submissionIndex].title}" status to ${updates.status}`);
   return this.submissions[submissionIndex];
 }

 /**
  * Get submission statistics
  * @returns Statistics about user submissions
  */
 public async getSubmissionStats(): Promise<{
   total: number;
   pending: number;
   approved: number;
   rejected: number;
 }> {
   await this.initialize();

   const total = this.submissions.length;
   const pending = this.submissions.filter(s => s.status === 'pending').length;
   const approved = this.submissions.filter(s => s.status === 'approved').length;
   const rejected = this.submissions.filter(s => s.status === 'rejected').length;

   return { total, pending, approved, rejected };
 }

 /**
  * Convert approved submission to published story
  * @param submissionId - The ID of the submission to convert
  * @param storyData - Additional story data for publishing
  * @returns The created story, or null if submission not found
  */
 public async approveSubmissionToStory(
   submissionId: string,
   storyData: Partial<Story>
 ): Promise<Story | null> {
   await this.initialize();

   const submission = await this.getSubmissionById(submissionId);
   if (!submission || submission.status !== 'pending') {
     return null;
   }

   // Create a new story from the submission
   const story: Story = {
     id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
     slug: submission.title
       .toLowerCase()
       .replace(/[^a-z0-9\s-]/g, '')
       .replace(/\s+/g, '-')
       .replace(/-+/g, '-')
       .trim(),
     title: submission.title,
     excerpt: submission.content.substring(0, 200) + (submission.content.length > 200 ? '...' : ''),
     content: submission.content,
     publishedAt: new Date().toISOString(),
     author: submission.name,
     category: submission.category,
     country: submission.country,
     tags: submission.tags,
     featured: false,
     editorsPick: false,
     imageUrl: storyData.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=800&h=600',
     ...storyData,
   };

   // Update submission status
   await this.updateSubmissionStatus(submissionId, {
     status: 'approved',
     approvedStoryId: story.id,
   });

   // Add story to main collection
   await this.addStory(story);

   console.log(`Converted submission "${submission.title}" to published story "${story.title}"`);
   return story;
 }
}
