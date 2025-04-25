import axios from 'axios'
import { logger } from './logger'

interface UnsplashResponse {
  results: Array<UnsplashImageResult>;
}

interface UnsplashError {
  errors?: string[];
  message?: string;
}

interface UnsplashImageResult {
  width: number;
  height: number;
  description: string;
  alt_description: string;
  urls: {
    regular: string;
  };
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
    download_location: string;
  };
}

/**
 * Get UTM parameters for Unsplash attribution links
 */
export function getUnsplashUtmParams(): string {
  return new URLSearchParams({
    utm_source: 'globaltravelreport',
    utm_medium: 'referral',
    utm_campaign: 'api-credit'
  }).toString();
}

/**
 * Format Unsplash attribution links
 */
export function formatUnsplashAttribution(photographer: { username: string; name: string }): {
  photographerUrl: string;
  unsplashUrl: string;
} {
  const utmParams = getUnsplashUtmParams();
  return {
    photographerUrl: `https://unsplash.com/@${photographer.username}?${utmParams}`,
    unsplashUrl: `https://unsplash.com/?${utmParams}`
  };
}

/**
 * Track Unsplash image download
 */
export async function trackUnsplashDownload(downloadLocation: string): Promise<void> {
  try {
    await axios.get(downloadLocation, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    });
  } catch (error) {
    logger.error('Error tracking Unsplash download:', error);
  }
}

export async function fetchUnsplashImage(query: string, country: string): Promise<{
  url: string
  alt: string
  photographer: string
  photographerUsername: string
  link: string
  downloadLocation: string
} | null> {
  try {
    // Construct a more specific search query
    const searchQuery = `${country} ${query} travel photo landscape destination`;
    
    const response = await axios.get<UnsplashResponse>(
      `https://api.unsplash.com/search/photos`,
      {
        params: {
          query: searchQuery,
          orientation: 'landscape',
          per_page: 30,
          content_filter: 'high'
        },
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (response.data.results.length === 0) {
      return null;
    }

    // Filter and sort results
    const filteredResults = response.data.results
      .filter((image) => {
        // Ensure landscape orientation
        const aspectRatio = image.width / image.height;
        return aspectRatio >= 1.5;
      })
      .filter((image) => {
        // Filter out generic nature shots unless they match the destination
        const description = (image.description || '').toLowerCase();
        const altDescription = (image.alt_description || '').toLowerCase();
        const countryLower = country.toLowerCase();
        
        const isDestinationSpecific = 
          description.includes(countryLower) ||
          altDescription.includes(countryLower) ||
          description.includes('travel') ||
          altDescription.includes('travel');

        return isDestinationSpecific;
      });

    if (filteredResults.length === 0) {
      return null;
    }

    // Select the best match
    const bestMatch = filteredResults[0];
    
    return {
      url: bestMatch.urls.regular,
      alt: bestMatch.alt_description || `Travel photo of ${country}`,
      photographer: bestMatch.user.name,
      photographerUsername: bestMatch.user.username,
      link: bestMatch.links.html,
      downloadLocation: bestMatch.links.download_location
    };
  } catch (error) {
    logger.error('Error fetching Unsplash image:', error);
    return null;
  }
}

async function searchUnsplash(query: string): Promise<UnsplashResponse> {
  // ... existing code ...
}

function handleUnsplashError(error: UnsplashError): never {
  // ... existing code ...
} 