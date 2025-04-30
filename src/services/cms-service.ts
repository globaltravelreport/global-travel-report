/**
 * CMS Service for dynamic content management
 * 
 * This service provides an interface for fetching and managing content from various CMS sources.
 * It supports multiple content sources including:
 * - Local content (from the file system)
 * - Headless CMS (Contentful, Sanity, etc.)
 * - Custom API endpoints
 */

import { Story } from '@/types/Story';
import { mockStories } from '@/src/mocks/stories';
import config from '@/src/config';
import { logError } from '@/src/utils/error-handler';

/**
 * Content source types
 */
export enum ContentSourceType {
  LOCAL = 'local',
  CONTENTFUL = 'contentful',
  SANITY = 'sanity',
  STRAPI = 'strapi',
  CUSTOM_API = 'custom_api',
}

/**
 * Content source configuration
 */
export interface ContentSourceConfig {
  type: ContentSourceType;
  apiKey?: string;
  apiUrl?: string;
  spaceId?: string;
  projectId?: string;
  dataset?: string;
  environment?: string;
  previewSecret?: string;
}

/**
 * CMS Service class
 */
export class CMSService {
  private contentSource: ContentSourceType;
  private config: ContentSourceConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL: number;

  /**
   * Create a new CMS Service instance
   * @param config - Content source configuration
   * @param cacheTTL - Cache TTL in milliseconds (default: 5 minutes)
   */
  constructor(config: ContentSourceConfig, cacheTTL: number = 5 * 60 * 1000) {
    this.contentSource = config.type;
    this.config = config;
    this.cacheTTL = cacheTTL;
  }

  /**
   * Get all stories from the CMS
   * @returns Promise resolving to an array of stories
   */
  async getStories(): Promise<Story[]> {
    try {
      // Check cache first
      const cacheKey = 'all_stories';
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData as Story[];
      }
      
      // Fetch data based on content source
      let stories: Story[];
      
      switch (this.contentSource) {
        case ContentSourceType.LOCAL:
          stories = await this.getLocalStories();
          break;
        case ContentSourceType.CONTENTFUL:
          stories = await this.getContentfulStories();
          break;
        case ContentSourceType.SANITY:
          stories = await this.getSanityStories();
          break;
        case ContentSourceType.STRAPI:
          stories = await this.getStrapiStories();
          break;
        case ContentSourceType.CUSTOM_API:
          stories = await this.getCustomApiStories();
          break;
        default:
          stories = await this.getLocalStories();
      }
      
      // Cache the data
      this.cacheData(cacheKey, stories);
      
      return stories;
    } catch (error) {
      logError(error, { context: 'CMSService.getStories' });
      return [];
    }
  }

  /**
   * Get a story by slug
   * @param slug - The story slug
   * @returns Promise resolving to a story or null if not found
   */
  async getStoryBySlug(slug: string): Promise<Story | null> {
    try {
      // Check cache first
      const cacheKey = `story_${slug}`;
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData as Story;
      }
      
      // Fetch data based on content source
      let story: Story | null;
      
      switch (this.contentSource) {
        case ContentSourceType.LOCAL:
          story = await this.getLocalStoryBySlug(slug);
          break;
        case ContentSourceType.CONTENTFUL:
          story = await this.getContentfulStoryBySlug(slug);
          break;
        case ContentSourceType.SANITY:
          story = await this.getSanityStoryBySlug(slug);
          break;
        case ContentSourceType.STRAPI:
          story = await this.getStrapiStoryBySlug(slug);
          break;
        case ContentSourceType.CUSTOM_API:
          story = await this.getCustomApiStoryBySlug(slug);
          break;
        default:
          story = await this.getLocalStoryBySlug(slug);
      }
      
      // Cache the data if found
      if (story) {
        this.cacheData(cacheKey, story);
      }
      
      return story;
    } catch (error) {
      logError(error, { context: 'CMSService.getStoryBySlug', slug });
      return null;
    }
  }

  /**
   * Get stories by category
   * @param category - The category to filter by
   * @returns Promise resolving to an array of stories
   */
  async getStoriesByCategory(category: string): Promise<Story[]> {
    try {
      // Get all stories and filter by category
      const stories = await this.getStories();
      return stories.filter(story => 
        story.category.toLowerCase() === category.toLowerCase()
      );
    } catch (error) {
      logError(error, { context: 'CMSService.getStoriesByCategory', category });
      return [];
    }
  }

  /**
   * Get stories by country
   * @param country - The country to filter by
   * @returns Promise resolving to an array of stories
   */
  async getStoriesByCountry(country: string): Promise<Story[]> {
    try {
      // Get all stories and filter by country
      const stories = await this.getStories();
      return stories.filter(story => 
        story.country.toLowerCase() === country.toLowerCase()
      );
    } catch (error) {
      logError(error, { context: 'CMSService.getStoriesByCountry', country });
      return [];
    }
  }

  /**
   * Get stories by tag
   * @param tag - The tag to filter by
   * @returns Promise resolving to an array of stories
   */
  async getStoriesByTag(tag: string): Promise<Story[]> {
    try {
      // Get all stories and filter by tag
      const stories = await this.getStories();
      return stories.filter(story => 
        story.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      );
    } catch (error) {
      logError(error, { context: 'CMSService.getStoriesByTag', tag });
      return [];
    }
  }

  /**
   * Get featured stories
   * @param limit - Maximum number of stories to return
   * @returns Promise resolving to an array of featured stories
   */
  async getFeaturedStories(limit: number = 5): Promise<Story[]> {
    try {
      // Get all stories and filter by featured flag
      const stories = await this.getStories();
      return stories
        .filter(story => story.featured)
        .sort((a, b) => {
          const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
          const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, limit);
    } catch (error) {
      logError(error, { context: 'CMSService.getFeaturedStories' });
      return [];
    }
  }

  /**
   * Get editor's pick stories
   * @param limit - Maximum number of stories to return
   * @returns Promise resolving to an array of editor's pick stories
   */
  async getEditorsPickStories(limit: number = 5): Promise<Story[]> {
    try {
      // Get all stories and filter by editor's pick flag
      const stories = await this.getStories();
      return stories
        .filter(story => story.editorsPick)
        .sort((a, b) => {
          const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
          const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, limit);
    } catch (error) {
      logError(error, { context: 'CMSService.getEditorsPickStories' });
      return [];
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cached data
   * @param key - Cache key
   * @returns Cached data or undefined if not found or expired
   */
  private getCachedData(key: string): any | undefined {
    const cachedItem = this.cache.get(key);
    
    if (cachedItem) {
      const now = Date.now();
      
      if (now - cachedItem.timestamp < this.cacheTTL) {
        return cachedItem.data;
      }
      
      // Remove expired item
      this.cache.delete(key);
    }
    
    return undefined;
  }

  /**
   * Cache data
   * @param key - Cache key
   * @param data - Data to cache
   */
  private cacheData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get stories from local source (mock data or file system)
   * @returns Promise resolving to an array of stories
   */
  private async getLocalStories(): Promise<Story[]> {
    // For now, return mock stories
    // In a real implementation, this would read from the file system
    return mockStories;
  }

  /**
   * Get a story by slug from local source
   * @param slug - The story slug
   * @returns Promise resolving to a story or null if not found
   */
  private async getLocalStoryBySlug(slug: string): Promise<Story | null> {
    // For now, find in mock stories
    // In a real implementation, this would read from the file system
    const story = mockStories.find(story => story.slug === slug);
    return story || null;
  }

  /**
   * Get stories from Contentful
   * @returns Promise resolving to an array of stories
   */
  private async getContentfulStories(): Promise<Story[]> {
    if (!this.config.apiKey || !this.config.spaceId) {
      throw new Error('Contentful API key or space ID not provided');
    }
    
    try {
      // This is a simplified example
      // In a real implementation, you would use the Contentful SDK
      const response = await fetch(
        `https://cdn.contentful.com/spaces/${this.config.spaceId}/environments/${this.config.environment || 'master'}/entries?content_type=story&access_token=${this.config.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from Contentful: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform Contentful response to Story objects
      return this.transformContentfulToStories(data);
    } catch (error) {
      logError(error, { context: 'CMSService.getContentfulStories' });
      return [];
    }
  }

  /**
   * Get a story by slug from Contentful
   * @param slug - The story slug
   * @returns Promise resolving to a story or null if not found
   */
  private async getContentfulStoryBySlug(slug: string): Promise<Story | null> {
    if (!this.config.apiKey || !this.config.spaceId) {
      throw new Error('Contentful API key or space ID not provided');
    }
    
    try {
      // This is a simplified example
      // In a real implementation, you would use the Contentful SDK
      const response = await fetch(
        `https://cdn.contentful.com/spaces/${this.config.spaceId}/environments/${this.config.environment || 'master'}/entries?content_type=story&fields.slug=${slug}&access_token=${this.config.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from Contentful: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform Contentful response to Story objects
      const stories = this.transformContentfulToStories(data);
      
      return stories.length > 0 ? stories[0] : null;
    } catch (error) {
      logError(error, { context: 'CMSService.getContentfulStoryBySlug', slug });
      return null;
    }
  }

  /**
   * Transform Contentful response to Story objects
   * @param data - Contentful response data
   * @returns Array of Story objects
   */
  private transformContentfulToStories(data: any): Story[] {
    // This is a simplified example
    // In a real implementation, you would handle linked assets and entries
    return data.items.map((item: any) => {
      const fields = item.fields;
      
      return {
        id: item.sys.id,
        slug: fields.slug,
        title: fields.title,
        excerpt: fields.excerpt,
        content: fields.content,
        publishedAt: new Date(fields.publishedAt),
        updatedAt: item.sys.updatedAt,
        author: fields.author,
        category: fields.category,
        country: fields.country,
        tags: fields.tags || [],
        featured: fields.featured || false,
        editorsPick: fields.editorsPick || false,
        imageUrl: fields.imageUrl,
      };
    });
  }

  /**
   * Get stories from Sanity
   * @returns Promise resolving to an array of stories
   */
  private async getSanityStories(): Promise<Story[]> {
    if (!this.config.projectId || !this.config.dataset) {
      throw new Error('Sanity project ID or dataset not provided');
    }
    
    try {
      // This is a simplified example
      // In a real implementation, you would use the Sanity SDK
      const query = encodeURIComponent('*[_type == "story"]');
      const response = await fetch(
        `https://${this.config.projectId}.api.sanity.io/v1/data/query/${this.config.dataset}?query=${query}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from Sanity: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform Sanity response to Story objects
      return this.transformSanityToStories(data);
    } catch (error) {
      logError(error, { context: 'CMSService.getSanityStories' });
      return [];
    }
  }

  /**
   * Get a story by slug from Sanity
   * @param slug - The story slug
   * @returns Promise resolving to a story or null if not found
   */
  private async getSanityStoryBySlug(slug: string): Promise<Story | null> {
    if (!this.config.projectId || !this.config.dataset) {
      throw new Error('Sanity project ID or dataset not provided');
    }
    
    try {
      // This is a simplified example
      // In a real implementation, you would use the Sanity SDK
      const query = encodeURIComponent(`*[_type == "story" && slug.current == "${slug}"][0]`);
      const response = await fetch(
        `https://${this.config.projectId}.api.sanity.io/v1/data/query/${this.config.dataset}?query=${query}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from Sanity: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.result) {
        return null;
      }
      
      // Transform Sanity response to Story object
      return this.transformSanityToStory(data.result);
    } catch (error) {
      logError(error, { context: 'CMSService.getSanityStoryBySlug', slug });
      return null;
    }
  }

  /**
   * Transform Sanity response to Story objects
   * @param data - Sanity response data
   * @returns Array of Story objects
   */
  private transformSanityToStories(data: any): Story[] {
    // This is a simplified example
    return data.result.map((item: any) => this.transformSanityToStory(item));
  }

  /**
   * Transform Sanity item to Story object
   * @param item - Sanity item
   * @returns Story object
   */
  private transformSanityToStory(item: any): Story {
    return {
      id: item._id,
      slug: item.slug.current,
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      publishedAt: new Date(item.publishedAt),
      updatedAt: item._updatedAt,
      author: item.author,
      category: item.category,
      country: item.country,
      tags: item.tags || [],
      featured: item.featured || false,
      editorsPick: item.editorsPick || false,
      imageUrl: item.imageUrl,
    };
  }

  /**
   * Get stories from Strapi
   * @returns Promise resolving to an array of stories
   */
  private async getStrapiStories(): Promise<Story[]> {
    if (!this.config.apiUrl) {
      throw new Error('Strapi API URL not provided');
    }
    
    try {
      // This is a simplified example
      const response = await fetch(
        `${this.config.apiUrl}/stories?populate=*`,
        {
          headers: this.config.apiKey ? {
            Authorization: `Bearer ${this.config.apiKey}`,
          } : {},
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from Strapi: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform Strapi response to Story objects
      return this.transformStrapiToStories(data);
    } catch (error) {
      logError(error, { context: 'CMSService.getStrapiStories' });
      return [];
    }
  }

  /**
   * Get a story by slug from Strapi
   * @param slug - The story slug
   * @returns Promise resolving to a story or null if not found
   */
  private async getStrapiStoryBySlug(slug: string): Promise<Story | null> {
    if (!this.config.apiUrl) {
      throw new Error('Strapi API URL not provided');
    }
    
    try {
      // This is a simplified example
      const response = await fetch(
        `${this.config.apiUrl}/stories?filters[slug][$eq]=${slug}&populate=*`,
        {
          headers: this.config.apiKey ? {
            Authorization: `Bearer ${this.config.apiKey}`,
          } : {},
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from Strapi: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform Strapi response to Story objects
      const stories = this.transformStrapiToStories(data);
      
      return stories.length > 0 ? stories[0] : null;
    } catch (error) {
      logError(error, { context: 'CMSService.getStrapiStoryBySlug', slug });
      return null;
    }
  }

  /**
   * Transform Strapi response to Story objects
   * @param data - Strapi response data
   * @returns Array of Story objects
   */
  private transformStrapiToStories(data: any): Story[] {
    // This is a simplified example
    return data.data.map((item: any) => {
      const attributes = item.attributes;
      
      return {
        id: item.id,
        slug: attributes.slug,
        title: attributes.title,
        excerpt: attributes.excerpt,
        content: attributes.content,
        publishedAt: new Date(attributes.publishedAt),
        updatedAt: attributes.updatedAt,
        author: attributes.author,
        category: attributes.category,
        country: attributes.country,
        tags: attributes.tags || [],
        featured: attributes.featured || false,
        editorsPick: attributes.editorsPick || false,
        imageUrl: attributes.image?.data?.attributes?.url || '',
      };
    });
  }

  /**
   * Get stories from custom API
   * @returns Promise resolving to an array of stories
   */
  private async getCustomApiStories(): Promise<Story[]> {
    if (!this.config.apiUrl) {
      throw new Error('Custom API URL not provided');
    }
    
    try {
      // This is a simplified example
      const response = await fetch(
        `${this.config.apiUrl}/stories`,
        {
          headers: this.config.apiKey ? {
            Authorization: `Bearer ${this.config.apiKey}`,
          } : {},
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from custom API: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Assuming the API returns data in the expected format
      return data;
    } catch (error) {
      logError(error, { context: 'CMSService.getCustomApiStories' });
      return [];
    }
  }

  /**
   * Get a story by slug from custom API
   * @param slug - The story slug
   * @returns Promise resolving to a story or null if not found
   */
  private async getCustomApiStoryBySlug(slug: string): Promise<Story | null> {
    if (!this.config.apiUrl) {
      throw new Error('Custom API URL not provided');
    }
    
    try {
      // This is a simplified example
      const response = await fetch(
        `${this.config.apiUrl}/stories/${slug}`,
        {
          headers: this.config.apiKey ? {
            Authorization: `Bearer ${this.config.apiKey}`,
          } : {},
        }
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch from custom API: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Assuming the API returns data in the expected format
      return data;
    } catch (error) {
      logError(error, { context: 'CMSService.getCustomApiStoryBySlug', slug });
      return null;
    }
  }
}

/**
 * Create a CMS service instance based on configuration
 * @returns CMS service instance
 */
export function createCMSService(): CMSService {
  // Get CMS configuration from environment variables or config
  const cmsType = (process.env.CMS_TYPE || config.cms?.type || 'local') as ContentSourceType;
  
  // Create configuration based on CMS type
  const cmsConfig: ContentSourceConfig = {
    type: cmsType,
  };
  
  // Add additional configuration based on CMS type
  switch (cmsType) {
    case ContentSourceType.CONTENTFUL:
      cmsConfig.apiKey = process.env.CONTENTFUL_API_KEY || config.cms?.contentful?.apiKey;
      cmsConfig.spaceId = process.env.CONTENTFUL_SPACE_ID || config.cms?.contentful?.spaceId;
      cmsConfig.environment = process.env.CONTENTFUL_ENVIRONMENT || config.cms?.contentful?.environment || 'master';
      break;
    case ContentSourceType.SANITY:
      cmsConfig.projectId = process.env.SANITY_PROJECT_ID || config.cms?.sanity?.projectId;
      cmsConfig.dataset = process.env.SANITY_DATASET || config.cms?.sanity?.dataset || 'production';
      break;
    case ContentSourceType.STRAPI:
      cmsConfig.apiUrl = process.env.STRAPI_API_URL || config.cms?.strapi?.apiUrl;
      cmsConfig.apiKey = process.env.STRAPI_API_KEY || config.cms?.strapi?.apiKey;
      break;
    case ContentSourceType.CUSTOM_API:
      cmsConfig.apiUrl = process.env.CUSTOM_API_URL || config.cms?.customApi?.apiUrl;
      cmsConfig.apiKey = process.env.CUSTOM_API_KEY || config.cms?.customApi?.apiKey;
      break;
  }
  
  // Create and return CMS service instance
  return new CMSService(cmsConfig);
}

// Export singleton instance
export const cmsService = createCMSService();
