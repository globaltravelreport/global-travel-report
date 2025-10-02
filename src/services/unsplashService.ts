/**
 * Unsplash Service
 *
 * This service handles interactions with the Unsplash API for fetching images
 * in a way that's compatible with Vercel's Edge Runtime.
 */

import { Story } from '@/types/Story';

interface UnsplashImage {
  url: string;
  smallUrl: string;
  thumbUrl: string;
  alt: string;
  photographer: {
    name: string;
    username: string;
    profileUrl: string;
    url?: string; // Alias for profileUrl for compatibility
  };
  downloadLocation: string;
}

export class UnsplashService {
  private static instance: UnsplashService | null = null;
  private accessKey: string;
  private maxRetries: number;
  private retryDelay: number;
  private requestsPerHour: number;
  private hourlyRequestCount: number;
  private lastResetHour: number;

  private constructor() {
    this.accessKey = process.env.UNSPLASH_ACCESS_KEY || '';
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.requestsPerHour = 50; // Unsplash free tier limit
    this.hourlyRequestCount = 0;
    this.lastResetHour = new Date().getHours();

    // Validate access key - only in development to avoid production noise
    if (process.env.NODE_ENV === 'development') {
      if (!this.accessKey || this.accessKey === 'your_unsplash_access_key_here' || this.accessKey.length < 20) {
        console.warn('Unsplash access key is not properly configured. Using fallback images.');
      } else {
        console.log('Unsplash access key is configured.');
      }
    }
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): UnsplashService {
    if (!UnsplashService.instance) {
      UnsplashService.instance = new UnsplashService();
    }
    return UnsplashService.instance;
  }

  /**
   * Check and reset the hourly counter if needed
   */
  private checkAndResetHourlyCounter(): void {
    const currentHour = new Date().getHours();
    if (currentHour !== this.lastResetHour) {
      this.hourlyRequestCount = 0;
      this.lastResetHour = currentHour;
    }
  }

  /**
   * Check if we can make more API requests this hour
   */
  public canMakeRequest(): boolean {
    // Check if access key is valid
    if (!this.accessKey || this.accessKey === 'your_unsplash_access_key_here' || this.accessKey.length < 20) {
      return false;
    }

    this.checkAndResetHourlyCounter();
    return this.hourlyRequestCount < this.requestsPerHour;
  }

  /**
   * Get remaining requests for this hour
   */
  public getRemainingRequests(): number {
    this.checkAndResetHourlyCounter();
    return this.requestsPerHour - this.hourlyRequestCount;
  }

  /**
   * Search for images on Unsplash
   */
  public async searchImages(query: string, options: {
    orientation?: 'landscape' | 'portrait' | 'squarish';
    perPage?: number;
    page?: number;
  } = {}): Promise<UnsplashImage[]> {
    if (!this.accessKey) {
      throw new Error('Unsplash access key is not configured');
    }

    if (!this.canMakeRequest()) {
      throw new Error('Hourly Unsplash API request limit reached');
    }

    const orientation = options.orientation || 'landscape';
    const perPage = options.perPage || 1;
    const page = options.page || 1;

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this.maxRetries) {
      try {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=${perPage}&page=${page}`,
          {
            headers: {
              'Authorization': `Client-ID ${this.accessKey}`
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Unsplash API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        this.hourlyRequestCount++;

        // Transform the response into our UnsplashImage format
        return data.results.map((result: any) => {
          // Get the photographer name, ensuring it's not empty
          const photographerName = result.user.name || result.user.username || 'Unsplash Photographer';

          return {
            url: result.urls.regular,
            smallUrl: result.urls.small,
            thumbUrl: result.urls.thumb,
            alt: result.alt_description || result.description || query,
            photographer: {
              name: photographerName,
              username: result.user.username,
              profileUrl: result.user.links.html
            },
            downloadLocation: result.links.download_location
          };
        });
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if we should retry
        if (attempt < this.maxRetries - 1) {
          // Exponential backoff
          const delay = this.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          attempt++;
        } else {
          break;
        }
      }
    }

    throw lastError || new Error('Failed to search Unsplash images after multiple attempts');
  }

  /**
   * Trigger a download (required by Unsplash API terms)
   */
  private async triggerDownload(downloadLocation: string): Promise<void> {
    try {
      await fetch(`${downloadLocation}?client_id=${this.accessKey}`);
    } catch (error) {
      console.error('Error triggering Unsplash download:', error);
      // Don't throw, as this is a background operation
    }
  }

  /**
   * Enhance a story with an image from Unsplash using the enhanced image tracker
   */
  public async enhanceStoryWithImage(story: Story): Promise<Story> {
    try {
      // Import the enhanced image tracker dynamically to avoid server/client mismatch
      const { getBestImageForStory } = await import('@/utils/enhancedImageTracker');

      // Extract keywords from the story
      const keywords = [];
      if (story.tags && Array.isArray(story.tags)) {
        keywords.push(...story.tags);
      }
      if (story.keywords && Array.isArray(story.keywords)) {
        keywords.push(...story.keywords);
      }
      if (story.country) {
        keywords.push(story.country);
      }

      // Get the best matching image for this story
      const { imageUrl, photographer } = getBestImageForStory(
        story.slug || `story-${Date.now()}`,
        story.category || 'Travel',
        story.title || '',
        story.content || '',
        keywords
      );

      // Return the enhanced story
      return {
        ...story,
        imageUrl: imageUrl,
        imageAlt: `${story.category} - ${story.title}`,
        // Add photographer information in the format expected by the UI components
        photographer: photographer,
        // Keep these for backward compatibility
        imageCredit: `Photo by ${photographer.name} on Unsplash`,
        imageCreditUrl: photographer.url
      };
    } catch (error) {
      console.error('Error enhancing story with image:', error);

      // If the enhanced image tracker fails, try the original image tracker
      try {
        // Import the original image tracker dynamically
        const { getImageForStory } = await import('@/utils/imageTracker');

        // Get a unique image and photographer for this story
        const { imageUrl, photographer } = getImageForStory(
          story.slug || `story-${Date.now()}`,
          story.category || 'Travel'
        );

        // Return the enhanced story
        return {
          ...story,
          imageUrl: imageUrl,
          imageAlt: `${story.category} - ${story.title}`,
          // Add photographer information in the format expected by the UI components
          photographer: photographer,
          // Keep these for backward compatibility
          imageCredit: `Photo by ${photographer.name} on Unsplash`,
          imageCreditUrl: photographer.url
        };
      } catch (trackerError) {
        console.error('Original image tracker also failed:', trackerError);

        // If both trackers fail, fall back to the API method
        try {
          // Build a search query based on the story
          let query = `${story.country} ${story.category}`;

          // Add more specific terms for better results
          if (story.category === 'Cruises') {
            query += ' cruise ship ocean';
          } else if (story.category === 'Food & Drink') {
            query += ' food cuisine restaurant';
          } else if (story.category === 'Adventure Travel') {
            query += ' adventure landscape nature';
          } else if (story.category === 'Luxury Travel') {
            query += ' luxury hotel resort';
          } else if (story.category === 'Family Travel') {
            query += ' family vacation';
          } else {
            query += ' travel tourism';
          }

          // Search for images
          const images = await this.searchImages(query);

          if (images.length === 0) {
            throw new Error('No images found');
          }

          const image = images[0];

          // Trigger a download (required by Unsplash API terms)
          await this.triggerDownload(image.downloadLocation);

          // Return the enhanced story
          return {
            ...story,
            imageUrl: image.url,
            imageAlt: image.alt,
            // Add photographer information in the format expected by the UI components
            photographer: {
              name: image.photographer.name,
              url: image.photographer.profileUrl
            },
            // Keep these for backward compatibility
            imageCredit: `Photo by ${image.photographer.name} on Unsplash`,
            imageCreditUrl: image.photographer.profileUrl
          };
        } catch (fallbackError) {
          console.error('All image enhancement methods failed:', fallbackError);
          // Return the original story if all methods fail
          return story;
        }
      }
    }
  }

  /**
   * Get a random image from Unsplash
   */
  public async getRandomImage(query: string): Promise<UnsplashImage | null> {
    try {
      if (!this.accessKey) {
        throw new Error('Unsplash access key is not configured');
      }

      if (!this.canMakeRequest()) {
        throw new Error('Hourly Unsplash API request limit reached');
      }

      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${this.accessKey}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Unsplash API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      this.hourlyRequestCount++;

      // Trigger a download (required by Unsplash API terms)
      await this.triggerDownload(result.links.download_location);

      // Get the photographer name, ensuring it's not empty
      const photographerName = result.user.name || result.user.username || 'Unsplash Photographer';

      return {
        url: result.urls.regular,
        smallUrl: result.urls.small,
        thumbUrl: result.urls.thumb,
        alt: result.alt_description || result.description || query,
        photographer: {
          name: photographerName,
          username: result.user.username,
          profileUrl: result.user.links.html,
          // Add url property for compatibility with UI components
          url: result.user.links.html
        },
        downloadLocation: result.links.download_location
      };
    } catch (error) {
      console.error('Error getting random image:', error);
      return null;
    }
  }
}
