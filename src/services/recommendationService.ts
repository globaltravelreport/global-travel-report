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
    } else {
      // Check for related categories (e.g., "Cruise Ships" and "Cruises")
      const category1 = story1.category.toLowerCase();
      const category2 = story2.category.toLowerCase();

      // Check if categories are related
      if (
        (category1.includes('cruise') && category2.includes('cruise')) ||
        (category1.includes('hotel') && category2.includes('hotel')) ||
        (category1.includes('airline') && category2.includes('airline')) ||
        (category1.includes('destination') && category2.includes('destination'))
      ) {
        score += 3;
      }
    }

    // Same country is a strong signal
    if (story1.country.toLowerCase() === story2.country.toLowerCase()) {
      score += 4;
    } else {
      // Check for regional relationships
      const regions: { [key: string]: string[] } = {
        'europe': ['france', 'italy', 'spain', 'germany', 'united kingdom', 'greece', 'portugal', 'switzerland'],
        'asia': ['japan', 'china', 'thailand', 'vietnam', 'singapore', 'malaysia', 'indonesia', 'india'],
        'oceania': ['australia', 'new zealand', 'fiji', 'samoa', 'vanuatu'],
        'north america': ['united states', 'canada', 'mexico'],
        'caribbean': ['jamaica', 'bahamas', 'cuba', 'dominican republic', 'puerto rico'],
        'middle east': ['uae', 'dubai', 'qatar', 'saudi arabia', 'oman', 'israel']
      };

      // Check if countries are in the same region
      const country1 = story1.country.toLowerCase();
      const country2 = story2.country.toLowerCase();

      for (const [region, countries] of Object.entries(regions)) {
        if (countries.includes(country1) && countries.includes(country2)) {
          score += 2; // Countries in the same region
          break;
        }
      }
    }

    // Shared tags with weighted importance
    const story1Tags = story1.tags.map(tag => tag.toLowerCase());
    const story2Tags = story2.tags.map(tag => tag.toLowerCase());

    const sharedTags = story1Tags.filter(tag => story2Tags.includes(tag));

    // More weight for important travel-related tags
    const importantTags = ['luxury', 'budget', 'family', 'adventure', 'beach', 'mountain', 'city', 'food'];
    const importantSharedTags = sharedTags.filter(tag =>
      importantTags.some(important => tag.includes(important))
    );

    score += sharedTags.length * 1.5; // Base score for shared tags
    score += importantSharedTags.length * 1; // Extra boost for important shared tags

    // Title and content similarity (basic keyword matching)
    const title1Words = this.getSignificantWords(story1.title);
    const title2Words = this.getSignificantWords(story2.title);
    const sharedTitleWords = title1Words.filter(word => title2Words.includes(word));

    // More weight for title matches
    score += sharedTitleWords.length * 1.5;

    // Content similarity if excerpt is available
    if (story1.excerpt && story2.excerpt) {
      const excerpt1Words = this.getSignificantWords(story1.excerpt);
      const excerpt2Words = this.getSignificantWords(story2.excerpt);
      const sharedExcerptWords = excerpt1Words.filter(word => excerpt2Words.includes(word));

      score += sharedExcerptWords.length * 0.5;
    }

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

    // Seasonal relevance (stories from the same season get a small boost)
    const month1 = date1.getMonth();
    const month2 = date2.getMonth();
    const sameQuarter = Math.floor(month1 / 3) === Math.floor(month2 / 3);

    if (sameQuarter) {
      score += 0.5;
    }

    return score;
  }

  /**
   * Extract significant words from text (remove common words, keep only meaningful terms)
   * @param text - The text to process
   * @returns Array of significant words
   * @private
   */
  private getSignificantWords(text: string): string[] {
    if (!text) return [];

    // Common words to filter out
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
      'by', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between',
      'out', 'of', 'from', 'up', 'down', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
      'should', 'can', 'could', 'may', 'might', 'must', 'this', 'that', 'these',
      'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'their', 'his', 'her',
      'its', 'our', 'your', 'my', 'mine', 'yours', 'hers', 'ours', 'theirs'
    ]);

    // Extract words, convert to lowercase, and filter out stop words and short words
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/) // Split by whitespace
      .filter(word =>
        word.length > 3 && // Only words longer than 3 characters
        !stopWords.has(word) && // Not a stop word
        !(/^\d+$/.test(word)) // Not just a number
      );
  }
}
