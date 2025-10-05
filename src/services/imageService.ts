/**
 * Centralized Image Service for Global Travel Report
 * 
 * This service handles all image-related operations, including:
 * - Fetching images from Unsplash
 * - Managing image attribution
 * - Preventing duplicate images
 * - Optimizing images for SEO
 * - Handling fallback images
 */

import { createApi } from 'unsplash-js';
import type { Story } from '@/types/Story';
import imageManager from '@/utils/imageManager';
import imageSeoOptimizer from '@/utils/imageSeoOptimizer';
import pageImageTracker from '@/utils/pageImageTracker';

// Initialize Unsplash API client
const unsplash = (() => {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey || accessKey === 'your_unsplash_access_key_here' || accessKey.length < 20) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Unsplash access key is not properly configured. Image service will use fallback images.');
    }
    return null;
  }
  try {
    return createApi({
      accessKey,
    });
  } catch (_error) {
    console.error('Failed to initialize Unsplash client:', error);
    return null;
  }
})();

// Cache for Unsplash API requests
const imageCache = new Map<string, any>();

/**
 * Get a random image from Unsplash based on a search query
 * @param query Search query for Unsplash
 * @param options Additional options
 * @returns Image data or null if not found
 */
export async function getRandomImage(
  query: string,
  options: {
    orientation?: 'landscape' | 'portrait' | 'squarish';
    count?: number;
    skipCache?: boolean;
  } = {}
): Promise<{
  url: string;
  photographer: {
    name: string;
    username: string;
    profileUrl: string;
  };
  alt: string;
} | null> {
  try {
    const cacheKey = `unsplash-${query}-${options.orientation || 'landscape'}`;
    
    // Check cache first unless skipCache is true
    if (!options.skipCache && imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey);
    }
    
    // Check if Unsplash client is available
    if (!unsplash) {
      console.warn('Unsplash client not initialized. Using fallback image.');
      return null;
    }

    // Fetch from Unsplash API
    const result = await unsplash.photos.getRandom({
      query,
      orientation: options.orientation || 'landscape',
      count: options.count || 1,
    });
    
    if (result.errors) {
      console.error('Unsplash API error:', result.errors);
      return null;
    }
    
    // Get the first photo
    const photo = Array.isArray(result.response) 
      ? result.response[0] 
      : result.response;
    
    if (!photo) {
      console.warn(`No images found for query: ${query}`);
      return null;
    }
    
    // Format the response
    const imageData = {
      url: photo.urls.regular,
      photographer: {
        name: photo.user.name,
        username: photo.user.username,
        profileUrl: photo.user.links.html,
      },
      alt: photo.alt_description || query,
    };
    
    // Cache the result
    imageCache.set(cacheKey, imageData);
    
    return imageData;
  } catch (_error) {
    console.error('Error fetching image from Unsplash:', error);
    return null;
  }
}

/**
 * Get a random image for a story based on its category and tags
 * @param story Story to get an image for
 * @returns Image data or null if not found
 */
export async function getImageForStory(story: Story): Promise<{
  url: string;
  photographer: {
    name: string;
    username: string;
    profileUrl: string;
  };
  alt: string;
} | null> {
  try {
    // Try to get an image based on the story's category and country
    let searchQuery = story.category;
    
    // Add country to search query if it's not "Global"
    if (story.country && story.country !== 'Global') {
      searchQuery += ` ${story.country}`;
    }
    
    // Try to get an image
    let image = await getRandomImage(searchQuery);
    
    // If no image found, try with just the category
    if (!image && story.category) {
      image = await getRandomImage(story.category);
    }
    
    // If still no image, try with the first tag
    if (!image && story.tags && story.tags.length > 0) {
      image = await getRandomImage(story.tags[0]);
    }
    
    // If still no image, use a generic travel image
    if (!image) {
      image = await getRandomImage('travel landscape');
    }
    
    // If all else fails, use a fallback image
    if (!image) {
      const fallbackImage = imageManager.getRandomImage();
      if (fallbackImage) {
        return {
          url: fallbackImage.url,
          photographer: {
            name: fallbackImage.photographer,
            username: 'unknown',
            profileUrl: 'https://unsplash.com',
          },
          alt: story.title || 'Travel image',
        };
      }
    }
    
    return image;
  } catch (_error) {
    console.error('Error getting image for story:', error);
    return null;
  }
}

/**
 * Optimize an image for SEO
 * @param story Story containing the image
 * @returns Optimized image data
 */
export function optimizeImageForSeo(story: Story): {
  url: string;
  alt: string;
  caption: string;
} {
  const optimized = imageSeoOptimizer.optimizeStoryImageForSeo(story);
  
  return {
    url: optimized.imageUrl || story.imageUrl || '',
    alt: optimized.altText,
    caption: optimized.caption,
  };
}

/**
 * Track image usage on a page to prevent duplicates
 * @param imageUrl URL of the image
 * @param pageId Identifier for the page
 * @returns Boolean indicating if the image is already used
 */
export function trackImageUsage(imageUrl: string, pageId: string): boolean {
  if (pageImageTracker.isImageUsedOnPage(imageUrl, pageId)) {
    return false; // Image is already used
  }
  
  pageImageTracker.markImageAsUsed(imageUrl, pageId);
  return true; // Image is now tracked
}

/**
 * Clear image usage tracking for a page
 * @param pageId Identifier for the page
 */
export function clearImageTracking(pageId: string): void {
  pageImageTracker.clearUsedImages(pageId);
}

/**
 * Get a unique image for a story that hasn't been used on the current page
 * @param story Story to get an image for
 * @param pageId Identifier for the page
 * @returns Image data or null if not found
 */
export async function getUniqueImageForStory(
  story: Story,
  pageId: string
): Promise<{
  url: string;
  photographer: {
    name: string;
    username: string;
    profileUrl: string;
  };
  alt: string;
} | null> {
  // Try up to 5 times to get a unique image
  for (let i = 0; i < 5; i++) {
    const image = await getImageForStory(story);
    
    if (!image) {
      return null;
    }
    
    // Check if this image is already used on the page
    if (trackImageUsage(image.url, pageId)) {
      return image;
    }
  }
  
  // If we couldn't get a unique image after 5 tries, return the last one anyway
  return getImageForStory(story);
}

// Export the service as a default object
const imageService = {
  getRandomImage,
  getImageForStory,
  optimizeImageForSeo,
  trackImageUsage,
  clearImageTracking,
  getUniqueImageForStory,
};

export default imageService;
