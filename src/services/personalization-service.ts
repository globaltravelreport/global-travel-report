/**
 * Personalization Service
 * 
 * This service provides personalized content recommendations based on user preferences and behavior.
 */

import { Story } from '@/types/Story';
import { logError } from '@/src/utils/error-handler';

/**
 * User preference types
 */
export enum PreferenceType {
  COUNTRY = 'country',
  CATEGORY = 'category',
  TAG = 'tag',
}

/**
 * User preference
 */
export interface UserPreference {
  type: PreferenceType;
  value: string;
  weight: number; // 0-1, higher means stronger preference
}

/**
 * User interaction types
 */
export enum InteractionType {
  VIEW = 'view',
  LIKE = 'like',
  SHARE = 'share',
  BOOKMARK = 'bookmark',
  COMMENT = 'comment',
}

/**
 * User interaction
 */
export interface UserInteraction {
  storyId: string;
  type: InteractionType;
  timestamp: Date;
}

/**
 * User profile
 */
export interface UserProfile {
  id: string;
  preferences: UserPreference[];
  interactions: UserInteraction[];
  viewHistory: string[]; // Array of story IDs
}

/**
 * Recommendation result
 */
export interface RecommendationResult {
  stories: Story[];
  reason: string;
}

/**
 * Personalization Service class
 */
export class PersonalizationService {
  private userProfiles: Map<string, UserProfile> = new Map();
  
  /**
   * Get or create a user profile
   * @param userId - User ID
   * @returns User profile
   */
  getUserProfile(userId: string): UserProfile {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        id: userId,
        preferences: [],
        interactions: [],
        viewHistory: [],
      });
    }
    
    return this.userProfiles.get(userId)!;
  }
  
  /**
   * Add a user preference
   * @param userId - User ID
   * @param preference - User preference
   */
  addUserPreference(userId: string, preference: UserPreference): void {
    const profile = this.getUserProfile(userId);
    
    // Check if preference already exists
    const existingIndex = profile.preferences.findIndex(
      p => p.type === preference.type && p.value === preference.value
    );
    
    if (existingIndex >= 0) {
      // Update existing preference
      profile.preferences[existingIndex].weight = preference.weight;
    } else {
      // Add new preference
      profile.preferences.push(preference);
    }
    
    this.userProfiles.set(userId, profile);
  }
  
  /**
   * Remove a user preference
   * @param userId - User ID
   * @param type - Preference type
   * @param value - Preference value
   */
  removeUserPreference(userId: string, type: PreferenceType, value: string): void {
    const profile = this.getUserProfile(userId);
    
    profile.preferences = profile.preferences.filter(
      p => !(p.type === type && p.value === value)
    );
    
    this.userProfiles.set(userId, profile);
  }
  
  /**
   * Add a user interaction
   * @param userId - User ID
   * @param interaction - User interaction
   */
  addUserInteraction(userId: string, interaction: UserInteraction): void {
    const profile = this.getUserProfile(userId);
    
    profile.interactions.push(interaction);
    
    // Add to view history if it's a view interaction
    if (interaction.type === InteractionType.VIEW && !profile.viewHistory.includes(interaction.storyId)) {
      profile.viewHistory.push(interaction.storyId);
    }
    
    this.userProfiles.set(userId, profile);
  }
  
  /**
   * Get personalized recommendations for a user
   * @param userId - User ID
   * @param stories - Available stories
   * @param limit - Maximum number of recommendations
   * @returns Recommended stories with reason
   */
  getRecommendations(userId: string, stories: Story[], limit: number = 5): RecommendationResult {
    try {
      const profile = this.getUserProfile(userId);
      
      // Filter out stories the user has already viewed
      const unseenStories = stories.filter(story => !profile.viewHistory.includes(story.id));
      
      // If no preferences or interactions, return random recommendations
      if (profile.preferences.length === 0 && profile.interactions.length === 0) {
        const randomStories = this.getRandomStories(unseenStories, limit);
        return {
          stories: randomStories,
          reason: 'Discover something new',
        };
      }
      
      // Calculate scores for each story based on user preferences and interactions
      const scoredStories = unseenStories.map(story => {
        const score = this.calculateStoryScore(story, profile);
        return { story, score };
      });
      
      // Sort by score (descending)
      scoredStories.sort((a, b) => b.score - a.score);
      
      // Get top N stories
      const recommendedStories = scoredStories.slice(0, limit).map(item => item.story);
      
      // Determine recommendation reason
      const reason = this.getRecommendationReason(recommendedStories, profile);
      
      return {
        stories: recommendedStories,
        reason,
      };
    } catch (error) {
      logError(error, { context: 'PersonalizationService.getRecommendations', userId });
      
      // Fallback to random recommendations
      return {
        stories: this.getRandomStories(stories, limit),
        reason: 'Discover something new',
      };
    }
  }
  
  /**
   * Get similar stories to a given story
   * @param storyId - Story ID
   * @param stories - Available stories
   * @param limit - Maximum number of similar stories
   * @returns Similar stories
   */
  getSimilarStories(storyId: string, stories: Story[], limit: number = 3): Story[] {
    try {
      // Find the reference story
      const referenceStory = stories.find(story => story.id === storyId);
      
      if (!referenceStory) {
        return this.getRandomStories(stories, limit);
      }
      
      // Filter out the reference story
      const otherStories = stories.filter(story => story.id !== storyId);
      
      // Calculate similarity scores
      const scoredStories = otherStories.map(story => {
        const score = this.calculateSimilarityScore(referenceStory, story);
        return { story, score };
      });
      
      // Sort by score (descending)
      scoredStories.sort((a, b) => b.score - a.score);
      
      // Get top N stories
      return scoredStories.slice(0, limit).map(item => item.story);
    } catch (error) {
      logError(error, { context: 'PersonalizationService.getSimilarStories', storyId });
      
      // Fallback to random recommendations
      return this.getRandomStories(stories.filter(story => story.id !== storyId), limit);
    }
  }
  
  /**
   * Get trending stories based on user interactions
   * @param stories - Available stories
   * @param limit - Maximum number of trending stories
   * @returns Trending stories
   */
  getTrendingStories(stories: Story[], limit: number = 5): Story[] {
    try {
      // Count interactions for each story
      const storyInteractions = new Map<string, number>();
      
      for (const profile of this.userProfiles.values()) {
        for (const interaction of profile.interactions) {
          const count = storyInteractions.get(interaction.storyId) || 0;
          storyInteractions.set(interaction.storyId, count + 1);
        }
      }
      
      // Score stories based on interaction count
      const scoredStories = stories.map(story => {
        const score = storyInteractions.get(story.id) || 0;
        return { story, score };
      });
      
      // Sort by score (descending)
      scoredStories.sort((a, b) => b.score - a.score);
      
      // Get top N stories
      return scoredStories.slice(0, limit).map(item => item.story);
    } catch (error) {
      logError(error, { context: 'PersonalizationService.getTrendingStories' });
      
      // Fallback to random recommendations
      return this.getRandomStories(stories, limit);
    }
  }
  
  /**
   * Calculate a score for a story based on user preferences and interactions
   * @param story - Story to score
   * @param profile - User profile
   * @returns Score (higher is better)
   */
  private calculateStoryScore(story: Story, profile: UserProfile): number {
    let score = 0;
    
    // Score based on preferences
    for (const preference of profile.preferences) {
      switch (preference.type) {
        case PreferenceType.COUNTRY:
          if (story.country.toLowerCase() === preference.value.toLowerCase()) {
            score += preference.weight;
          }
          break;
        case PreferenceType.CATEGORY:
          if (story.category.toLowerCase() === preference.value.toLowerCase()) {
            score += preference.weight;
          }
          break;
        case PreferenceType.TAG:
          if (story.tags.some(tag => tag.toLowerCase() === preference.value.toLowerCase())) {
            score += preference.weight;
          }
          break;
      }
    }
    
    // Score based on interactions with similar stories
    const interactedStoryIds = new Set(
      profile.interactions.map(interaction => interaction.storyId)
    );
    
    for (const interactedStoryId of interactedStoryIds) {
      const interactedStory = { id: interactedStoryId } as Story; // Placeholder
      const similarityScore = this.calculateSimilarityScore(interactedStory, story);
      score += similarityScore * 0.5; // Lower weight for similarity
    }
    
    return score;
  }
  
  /**
   * Calculate similarity score between two stories
   * @param story1 - First story
   * @param story2 - Second story
   * @returns Similarity score (0-1)
   */
  private calculateSimilarityScore(story1: Story, story2: Story): number {
    let score = 0;
    
    // Same country
    if (story1.country && story2.country && 
        story1.country.toLowerCase() === story2.country.toLowerCase()) {
      score += 0.3;
    }
    
    // Same category
    if (story1.category && story2.category && 
        story1.category.toLowerCase() === story2.category.toLowerCase()) {
      score += 0.3;
    }
    
    // Common tags
    if (story1.tags && story2.tags) {
      const commonTags = story1.tags.filter(tag => 
        story2.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      );
      
      score += commonTags.length * 0.1;
    }
    
    // Same author
    if (story1.author && story2.author && 
        story1.author.toLowerCase() === story2.author.toLowerCase()) {
      score += 0.2;
    }
    
    // Normalize score to 0-1 range
    return Math.min(score, 1);
  }
  
  /**
   * Get random stories
   * @param stories - Available stories
   * @param limit - Maximum number of stories
   * @returns Random stories
   */
  private getRandomStories(stories: Story[], limit: number): Story[] {
    // Shuffle array
    const shuffled = [...stories].sort(() => 0.5 - Math.random());
    
    // Get first N elements
    return shuffled.slice(0, limit);
  }
  
  /**
   * Get recommendation reason based on recommended stories and user profile
   * @param stories - Recommended stories
   * @param profile - User profile
   * @returns Recommendation reason
   */
  private getRecommendationReason(stories: Story[], profile: UserProfile): string {
    if (stories.length === 0) {
      return 'Discover something new';
    }
    
    // Check if recommendations are based on country preference
    const countries = new Set(stories.map(story => story.country.toLowerCase()));
    
    for (const preference of profile.preferences) {
      if (preference.type === PreferenceType.COUNTRY && 
          countries.has(preference.value.toLowerCase())) {
        return `Based on your interest in ${preference.value}`;
      }
    }
    
    // Check if recommendations are based on category preference
    const categories = new Set(stories.map(story => story.category.toLowerCase()));
    
    for (const preference of profile.preferences) {
      if (preference.type === PreferenceType.CATEGORY && 
          categories.has(preference.value.toLowerCase())) {
        return `Because you like ${preference.value} stories`;
      }
    }
    
    // Check if recommendations are based on tag preference
    const tags = new Set(stories.flatMap(story => story.tags.map(tag => tag.toLowerCase())));
    
    for (const preference of profile.preferences) {
      if (preference.type === PreferenceType.TAG && 
          tags.has(preference.value.toLowerCase())) {
        return `Tagged with ${preference.value} for you`;
      }
    }
    
    return 'Recommended for you';
  }
}

// Export singleton instance
export const personalizationService = new PersonalizationService();
