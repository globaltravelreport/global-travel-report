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
    return `${siteUrl}/og/facebook-home-20260509`;
  }

  // Handle external URLs (Unsplash, etc.)
  if (originalImageUrl.startsWith('http')) {
    // Try to convert WebP to JPEG for better Facebook compatibility
    const optimizedUrl = originalImageUrl.replace(/\.webp$/i, '.jpg');

    // If it's still WebP after conversion attempt, use fallback
    if (optimizedUrl.endsWith('.webp') || optimizedUrl.includes('webp')) {
      return fallbackToCleanImage ? `${siteUrl}/og/facebook-home-20260509` : optimizedUrl;
    }

    return optimizedUrl;
  }

  // Handle internal URLs
  const fullImageUrl = `${siteUrl}${originalImageUrl.startsWith('/') ? originalImageUrl : `/${originalImageUrl}`}`;
  const optimizedUrl = fullImageUrl.replace(/\.webp$/i, '.jpg');

  // If conversion didn't work or still WebP, use fallback
  if (optimizedUrl.endsWith('.webp') || optimizedUrl.includes('webp')) {
    return fallbackToCleanImage ? `${siteUrl}/og/facebook-home-20260509` : optimizedUrl;
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

/**
 * Validate Facebook Open Graph meta tags on a page
 */
export function validateFacebookMetaTags(): {
  isValid: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check for required Open Graph tags
  const requiredTags = [
    { property: 'og:title', name: 'Title' },
    { property: 'og:description', name: 'Description' },
    { property: 'og:image', name: 'Image' },
    { property: 'og:url', name: 'URL' },
    { property: 'og:type', name: 'Type' }
  ];

  requiredTags.forEach(({ property, name }) => {
    const tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag || !tag.getAttribute('content')) {
      issues.push(`Missing or empty ${name} (${property})`);
    }
  });

  // Check for site name
  const siteNameTag = document.querySelector('meta[property="og:site_name"]');
  if (!siteNameTag || !siteNameTag.getAttribute('content')) {
    warnings.push('Missing site name (og:site_name) - recommended for better branding');
  }

  // Check image compatibility
  const imageTag = document.querySelector('meta[property="og:image"]');
  if (imageTag) {
    const imageUrl = imageTag.getAttribute('content');
    if (imageUrl && !isFacebookCompatibleImage(imageUrl)) {
      issues.push('Image may not be Facebook-compatible (consider using JPG/PNG format)');
    }

    // Check for image dimensions
    const widthTag = document.querySelector('meta[property="og:image:width"]');
    const heightTag = document.querySelector('meta[property="og:image:height"]');
    if (!widthTag || !heightTag) {
      warnings.push('Missing image dimensions - recommended for better preview control');
    }
  }

  // Check for duplicate tags
  const allOgTags = document.querySelectorAll('meta[property^="og:"]');
  const tagCounts: Record<string, number> = {};

  allOgTags.forEach(tag => {
    const property = tag.getAttribute('property');
    if (property) {
      tagCounts[property] = (tagCounts[property] || 0) + 1;
    }
  });

  Object.entries(tagCounts).forEach(([property, count]) => {
    if (count > 1) {
      issues.push(`Duplicate Open Graph tag found: ${property} (${count} times)`);
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
    warnings
  };
}

/**
 * Debug function to log current Facebook meta tags
 */
export function debugFacebookMetaTags(): void {
  console.group('🔍 Facebook Open Graph Debug Info');
  console.log('Current URL:', window.location.href);

  const ogTags = document.querySelectorAll('meta[property^="og:"]');
  console.log(`Found ${ogTags.length} Open Graph tags:`);

  ogTags.forEach(tag => {
    const property = tag.getAttribute('property');
    const content = tag.getAttribute('content');
    console.log(`${property}: ${content}`);
  });

  const validation = validateFacebookMetaTags();
  console.log('Validation:', validation);

  console.groupEnd();
}

/**
 * Generate Facebook Sharing Debugger URL for testing
 */
export function generateFacebookDebuggerUrl(url: string): string {
  return `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(url)}`;
}

/**
 * Test Facebook meta tags and return detailed report
 */
export function testFacebookMetaTags(url?: string): {
  url: string;
  metaTags: Record<string, string>;
  validation: ReturnType<typeof validateFacebookMetaTags>;
  debuggerUrl: string;
  recommendations: string[];
} {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const metaTags: Record<string, string> = {};

  // Collect all Open Graph tags
  const ogTags = document.querySelectorAll('meta[property^="og:"]');
  ogTags.forEach(tag => {
    const property = tag.getAttribute('property');
    const content = tag.getAttribute('content');
    if (property && content) {
      metaTags[property] = content;
    }
  });

  const validation = validateFacebookMetaTags();

  // Generate recommendations
  const recommendations: string[] = [];

  if (validation.warnings.length > 0) {
    recommendations.push(...validation.warnings);
  }

  if (!metaTags['og:image:width'] || !metaTags['og:image:height']) {
    recommendations.push('Add image dimensions (og:image:width and og:image:height) for better preview control');
  }

  if (!metaTags['og:image:alt']) {
    recommendations.push('Add image alt text (og:image:alt) for accessibility');
  }

  if (Object.keys(metaTags).length === 0) {
    recommendations.push('No Open Graph tags found - this will result in poor Facebook previews');
  }

  return {
    url: currentUrl,
    metaTags,
    validation,
    debuggerUrl: generateFacebookDebuggerUrl(currentUrl),
    recommendations
  };
}
