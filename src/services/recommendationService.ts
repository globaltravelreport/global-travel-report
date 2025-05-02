import { Story } from '@/types/Story';

/**
 * Service for generating content recommendations
 */
export class RecommendationService {
  private static instance: RecommendationService | null = null;

  /**
   * Get the singleton instance of RecommendationService
   * @returns The singleton instance
   */
  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  /**
   * Get related stories based on the current story
   * @param currentStory - The current story
   * @param allStories - All available stories
   * @param limit - Maximum number of stories to return
   * @returns Array of related stories
   */
  public getRelatedStories(currentStory: Story, allStories: Story[], limit: number = 4): Story[] {
    // Filter out the current story
    const otherStories = allStories.filter(story => story.id !== currentStory.id);
    
    // Calculate relevance scores for each story
    const scoredStories = otherStories.map(story => ({
      story,
      score: this.calculateRelevanceScore(currentStory, story)
    }));
    
    // Sort by score (descending) and take the top N
    return scoredStories
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.story);
  }

  /**
   * Get popular stories based on featured and editor's pick flags
   * @param allStories - All available stories
   * @param limit - Maximum number of stories to return
   * @returns Array of popular stories
   */
  public getPopularStories(allStories: Story[], limit: number = 6): Story[] {
    // Sort stories by featured and editor's pick status
    return [...allStories]
      .sort((a, b) => {
        // Featured stories come first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        
        // Then editor's picks
        if (a.editorsPick && !b.editorsPick) return -1;
        if (!a.editorsPick && b.editorsPick) return 1;
        
        // Then by publish date (newest first)
        const dateA = new Date(a.publishedAt);
        const dateB = new Date(b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  }

  /**
   * Get stories by category
   * @param category - The category to filter by
   * @param allStories - All available stories
   * @param limit - Maximum number of stories to return
   * @returns Array of stories in the specified category
   */
  public getStoriesByCategory(category: string, allStories: Story[], limit: number = 4): Story[] {
    return allStories
      .filter(story => story.category.toLowerCase() === category.toLowerCase())
      .sort((a, b) => {
        // Featured stories come first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        
        // Then by publish date (newest first)
        const dateA = new Date(a.publishedAt);
        const dateB = new Date(b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  }

  /**
   * Get stories by country
   * @param country - The country to filter by
   * @param allStories - All available stories
   * @param limit - Maximum number of stories to return
   * @returns Array of stories about the specified country
   */
  public getStoriesByCountry(country: string, allStories: Story[], limit: number = 4): Story[] {
    return allStories
      .filter(story => story.country.toLowerCase() === country.toLowerCase())
      .sort((a, b) => {
        // Featured stories come first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        
        // Then by publish date (newest first)
        const dateA = new Date(a.publishedAt);
        const dateB = new Date(b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  }

  /**
   * Calculate relevance score between two stories
   * @param story1 - First story
   * @param story2 - Second story
   * @returns Relevance score (higher is more relevant)
   * @private
   */
  private calculateRelevanceScore(story1: Story, story2: Story): number {
    let score = 0;
    
    // Same category is a strong signal
    if (story1.category.toLowerCase() === story2.category.toLowerCase()) {
      score += 5;
    }
    
    // Same country is a strong signal
    if (story1.country.toLowerCase() === story2.country.toLowerCase()) {
      score += 4;
    }
    
    // Shared tags
    const story1Tags = story1.tags.map(tag => tag.toLowerCase());
    const story2Tags = story2.tags.map(tag => tag.toLowerCase());
    
    const sharedTags = story1Tags.filter(tag => story2Tags.includes(tag));
    score += sharedTags.length * 2;
    
    // Featured and editor's pick stories get a boost
    if (story2.featured) score += 2;
    if (story2.editorsPick) score += 1;
    
    // Recency boost (newer stories get a small boost)
    const date1 = new Date(story1.publishedAt);
    const date2 = new Date(story2.publishedAt);
    const daysDifference = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
    
    // Stories published within 30 days get a small boost
    if (daysDifference < 30) {
      score += (30 - daysDifference) / 30;
    }
    
    return score;
  }
}
