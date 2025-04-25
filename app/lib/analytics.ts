import { logger } from './logger';

/**
 * Tracks an Unsplash image download by calling the Unsplash API
 * @param downloadLocation The Unsplash download tracking URL
 */
export async function trackDownload(downloadLocation: string): Promise<void> {
  try {
    const response = await fetch(`/api/unsplash/search?downloadLocation=${encodeURIComponent(downloadLocation)}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to track download: ${response.status} ${response.statusText}`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to track download:', message);
    throw error;
  }
} 