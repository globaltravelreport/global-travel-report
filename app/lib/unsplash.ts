import { logger } from './logger';

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
    const response = await fetch(`/api/unsplash/search?downloadLocation=${encodeURIComponent(downloadLocation)}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to track download: ${response.status} ${response.statusText}`);
    }
    
    logger.info('Successfully tracked Unsplash download');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to track Unsplash download:', message);
    throw error;
  }
} 