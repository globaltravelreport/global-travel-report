/**
 * Facebook Open Graph Image Optimizer
 *
 * This utility ensures optimal Facebook link previews by:
 * - Converting WebP images to JPEG for better compatibility
 * - Providing clean fallback images without embedded text
 * - Ensuring proper image dimensions for Facebook previews
 */

export interface FacebookImageOptions {
  originalImageUrl?: string;
  title: string;
  description: string;
  siteUrl?: string;
  fallbackToCleanImage?: boolean;
}

/**
 * Generate Facebook-optimized image URL
 */
export function generateFacebookImage({
  originalImageUrl,
  title,
  description,
  siteUrl = 'https://www.globaltravelreport.com',
  fallbackToCleanImage = true
}: FacebookImageOptions): string {
  // If no image provided, use clean branded image
  if (!originalImageUrl) {
    return `${siteUrl}/og/home-1200x630.jpg`;
  }

  // Handle external URLs (Unsplash, etc.)
  if (originalImageUrl.startsWith('http')) {
    // Try to convert WebP to JPEG for better Facebook compatibility
    const optimizedUrl = originalImageUrl.replace(/\.webp$/i, '.jpg');

    // If it's still WebP after conversion attempt, use fallback
    if (optimizedUrl.endsWith('.webp') || optimizedUrl.includes('webp')) {
      return fallbackToCleanImage ? `${siteUrl}/og/home-1200x630.jpg` : optimizedUrl;
    }

    return optimizedUrl;
  }

  // Handle internal URLs
  const fullImageUrl = `${siteUrl}${originalImageUrl.startsWith('/') ? originalImageUrl : `/${originalImageUrl}`}`;
  const optimizedUrl = fullImageUrl.replace(/\.webp$/i, '.jpg');

  // If conversion didn't work or still WebP, use fallback
  if (optimizedUrl.endsWith('.webp') || optimizedUrl.includes('webp')) {
    return fallbackToCleanImage ? `${siteUrl}/og/home-1200x630.jpg` : optimizedUrl;
  }

  return optimizedUrl;
}

/**
 * Generate Facebook-optimized metadata
 */
export function generateFacebookMeta({
  title,
  description,
  imageUrl,
  url,
  type = 'article',
  siteName = 'Global Travel Report',
  siteUrl = 'https://www.globaltravelreport.com'
}: {
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
  type?: 'website' | 'article';
  siteName?: string;
  siteUrl?: string;
}) {
  const optimizedImage = generateFacebookImage({
    originalImageUrl: imageUrl,
    title,
    description,
    siteUrl
  });

  return {
    title,
    description,
    image: optimizedImage,
    url,
    type,
    siteName,
    // Ensure description is optimized for Facebook (under 200 chars)
    optimizedDescription: description.length > 200
      ? description.substring(0, 197) + '...'
      : description
  };
}

/**
 * Validate if an image URL is Facebook-compatible
 */
export function isFacebookCompatibleImage(imageUrl: string): boolean {
  // Check for WebP format (Facebook has limited WebP support)
  if (imageUrl.toLowerCase().includes('.webp')) {
    return false;
  }

  // Check for HTTPS
  if (!imageUrl.startsWith('https://')) {
    return false;
  }

  // Check file extension
  const validExtensions = ['.jpg', '.jpeg', '.png'];
  const hasValidExtension = validExtensions.some(ext =>
    imageUrl.toLowerCase().includes(ext)
  );

  return hasValidExtension;
}