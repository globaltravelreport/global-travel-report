/**
 * Location-Accurate Image Service
 *
 * Enhanced image fetching service that prioritizes location accuracy
 * and category relevance for the Content Bot Pipeline
 */

import { Story } from '@/types/Story';
import { UnsplashService } from './unsplashService';

export interface ImageSearchResult {
  url: string;
  alt: string;
  photographer: {
    name: string;
    url?: string;
  };
  location?: string;
  relevanceScore: number;
}

export interface ImageSearchOptions {
  primaryLocation?: string;
  category?: string;
  keywords?: string[];
  orientation?: 'landscape' | 'portrait' | 'squarish';
  minRelevance?: number;
}

export class LocationAccurateImageService {
  private static instance: LocationAccurateImageService | null = null;
  private unsplashService: UnsplashService;
  private cache: Map<string, ImageSearchResult[]> = new Map();

  private constructor() {
    this.unsplashService = UnsplashService.getInstance();
  }

  public static getInstance(): LocationAccurateImageService {
    if (!LocationAccurateImageService.instance) {
      LocationAccurateImageService.instance = new LocationAccurateImageService();
    }
    return LocationAccurateImageService.instance;
  }

  /**
   * Find the best image for a story with location accuracy
   */
  public async findBestImageForStory(story: Story): Promise<ImageSearchResult | null> {
    try {
      console.log(`🖼️ Finding location-accurate image for: ${story.title}`);

      // Build search strategy based on story content
      const searchOptions = this.buildSearchStrategy(story);

      // Try searches in order of specificity
      for (const option of searchOptions) {
        try {
          const images = await this.searchImagesWithStrategy(option);

          if (images.length > 0) {
            // Return the most relevant image
            const bestImage = this.selectBestImage(images, story);
            console.log(`✅ Found image: ${bestImage.alt} by ${bestImage.photographer.name}`);
            return bestImage;
          }
        } catch (error) {
          console.error('Error in image search strategy:', error);
          continue;
        }
      }

      // Fallback to category-based search
      console.log('🔄 Using category-based fallback search...');
      return await this.fallbackImageSearch(story);

    } catch (error) {
      console.error('Error finding image for story:', error);
      return null;
    }
  }

  /**
   * Build search strategy based on story content
   */
  private buildSearchStrategy(story: Story): ImageSearchOptions[] {
    const strategies: ImageSearchOptions[] = [];

    // Strategy 1: Location + Category (most specific)
    if (story.country && story.country !== 'Global') {
      strategies.push({
        primaryLocation: story.country,
        category: story.category,
        orientation: 'landscape',
        minRelevance: 0.8,
      });
    }

    // Strategy 2: Location only
    if (story.country && story.country !== 'Global') {
      strategies.push({
        primaryLocation: story.country,
        orientation: 'landscape',
        minRelevance: 0.7,
      });
    }

    // Strategy 3: Category + Keywords
    if (story.category) {
      strategies.push({
        category: story.category,
        keywords: story.tags,
        orientation: 'landscape',
        minRelevance: 0.6,
      });
    }

    // Strategy 4: Title keywords
    const titleKeywords = this.extractKeywordsFromTitle(story.title);
    if (titleKeywords.length > 0) {
      strategies.push({
        keywords: titleKeywords,
        orientation: 'landscape',
        minRelevance: 0.5,
      });
    }

    return strategies;
  }

  /**
   * Search images with specific strategy
   */
  private async searchImagesWithStrategy(options: ImageSearchOptions): Promise<ImageSearchResult[]> {
    const { primaryLocation, category, keywords = [], orientation = 'landscape' } = options;

    // Build search query
    let query = '';

    if (primaryLocation) {
      query += primaryLocation;
    }

    if (category) {
      const categoryQuery = this.getCategoryImageQuery(category);
      query += query ? ` ${categoryQuery}` : categoryQuery;
    }

    if (keywords.length > 0) {
      const keywordQuery = keywords.slice(0, 2).join(' '); // Limit to 2 keywords
      query += query ? ` ${keywordQuery}` : keywordQuery;
    }

    if (!query) {
      query = 'travel destination';
    }

    try {
      // Search Unsplash
      const images = await this.unsplashService.searchImages(query, {
        orientation,
        perPage: 5,
      });

      // Convert to our format and calculate relevance
      return images.map(image => ({
        url: image.url,
        alt: image.alt,
        photographer: image.photographer,
        location: primaryLocation,
        relevanceScore: this.calculateRelevanceScore(image, options),
      }));

    } catch (error) {
      console.error('Error searching images:', error);
      return [];
    }
  }

  /**
   * Get category-specific image query
   */
  private getCategoryImageQuery(category: string): string {
    const categoryQueries = {
      'Cruises': 'cruise ship ocean sea luxury travel',
      'Hotels': 'luxury hotel resort accommodation interior',
      'Flights': 'airplane airport aviation sky travel',
      'Destinations': 'travel destination landmark tourism',
      'Food': 'restaurant cuisine food dining culinary',
      'Adventure': 'adventure outdoor nature landscape mountain',
      'Luxury': 'luxury premium elegant sophisticated',
      'Family': 'family vacation children kids parents',
      'Culture': 'culture historical architecture traditional',
      'Nature': 'nature landscape outdoor environment',
    };

    return categoryQueries[category as keyof typeof categoryQueries] || 'travel destination';
  }

  /**
   * Calculate relevance score for image
   */
  private calculateRelevanceScore(image: any, options: ImageSearchOptions): number {
    let score = 0.5; // Base score

    // Location relevance
    if (options.primaryLocation && image.alt.toLowerCase().includes(options.primaryLocation.toLowerCase())) {
      score += 0.3;
    }

    // Category relevance
    if (options.category) {
      const categoryKeywords = this.getCategoryImageQuery(options.category).split(' ');
      const altMatches = categoryKeywords.filter(keyword =>
        image.alt.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      score += (altMatches / categoryKeywords.length) * 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Select the best image from results
   */
  private selectBestImage(images: ImageSearchResult[], story: Story): ImageSearchResult {
    // Sort by relevance score
    images.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Return the highest scoring image
    return images[0];
  }

  /**
   * Fallback image search
   */
  private async fallbackImageSearch(story: Story): Promise<ImageSearchResult | null> {
    try {
      // Try category-based search
      const categoryQuery = this.getCategoryImageQuery(story.category);
      const images = await this.unsplashService.searchImages(categoryQuery, {
        orientation: 'landscape',
        perPage: 1,
      });

      if (images.length > 0) {
        return {
          url: images[0].url,
          alt: images[0].alt,
          photographer: images[0].photographer,
          relevanceScore: 0.5,
        };
      }

      // Final fallback to generic travel image
      return {
        url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=800&h=600',
        alt: 'Travel destination',
        photographer: { name: 'Unsplash' },
        relevanceScore: 0.3,
      };

    } catch (error) {
      console.error('Error in fallback image search:', error);
      return null;
    }
  }

  /**
   * Extract keywords from story title
   */
  private extractKeywordsFromTitle(title: string): string[] {
    const keywords: string[] = [];
    const commonTravelWords = [
      'cruise', 'hotel', 'flight', 'destination', 'travel', 'beach',
      'mountain', 'city', 'culture', 'food', 'adventure', 'luxury'
    ];

    const titleWords = title.toLowerCase().split(' ');
    commonTravelWords.forEach(keyword => {
      if (titleWords.some(word => word.includes(keyword) || keyword.includes(word))) {
        keywords.push(keyword);
      }
    });

    return keywords;
  }

  /**
   * Get image statistics
   */
  public async getImageStats(): Promise<{
    totalSearches: number;
    successfulSearches: number;
    averageRelevanceScore: number;
    topLocations: string[];
  }> {
    // This would track actual statistics in a real implementation
    return {
      totalSearches: 0,
      successfulSearches: 0,
      averageRelevanceScore: 0,
      topLocations: [],
    };
  }

  /**
   * Pre-fetch images for common locations (for performance)
   */
  public async prefetchCommonLocationImages(): Promise<void> {
    const commonLocations = [
      'Sydney', 'Melbourne', 'Tokyo', 'Paris', 'London',
      'New York', 'Dubai', 'Singapore', 'Hong Kong', 'Rome'
    ];

    console.log('🚀 Pre-fetching images for common locations...');

    for (const location of commonLocations) {
      try {
        await this.searchImagesWithStrategy({
          primaryLocation: location,
          orientation: 'landscape',
          minRelevance: 0.7,
        });
      } catch (error) {
        console.error(`Error pre-fetching images for ${location}:`, error);
      }
    }

    console.log('✅ Location image pre-fetching complete');
  }
}