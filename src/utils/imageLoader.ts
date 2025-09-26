/**
 * Custom image loader for Next.js Image component
 * This loader optimizes images from various sources
 */

interface ImageLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Custom image loader for Next.js
 * @param params Image loader parameters
 * @returns Optimized image URL
 */
export function imageLoader({ src, width, quality = 75 }: ImageLoaderParams): string {
  // Don't modify data URLs
  if (src.startsWith('data:')) {
    return src;
  }

  // For Unsplash images
  if (src.includes('unsplash.com')) {
    // Check if the URL already has parameters
    const hasParams = src.includes('?');
    const separator = hasParams ? '&' : '?';

    // Add width, format and quality parameters
    return `${src}${separator}w=${width}&fm=webp&q=${quality}&auto=compress`;
  }

  // For Pexels images
  if (src.includes('pexels.com')) {
    // Check if the URL already has parameters
    const hasParams = src.includes('?');
    const separator = hasParams ? '&' : '?';

    // Add auto format and quality parameters
    // Pexels uses 'auto=compress' for automatic format selection
    return `${src}${separator}auto=compress&cs=tinysrgb&w=${width}&dpr=2&q=${quality}`;
  }

  // For Cloudinary images
  if (src.includes('cloudinary.com')) {
    // Cloudinary URLs are typically structured as:
    // https://res.cloudinary.com/[cloud_name]/image/upload/[transformations]/[public_id].[extension]

    // Check if the URL already has transformations
    if (src.includes('/image/upload/')) {
      // Insert transformations after '/image/upload/'
      const parts = src.split('/image/upload/');
      return `${parts[0]}/image/upload/f_auto,q_${quality},w_${width}/${parts[1]}`;
    }

    // If URL structure is different, add as query parameters
    const hasParams = src.includes('?');
    const separator = hasParams ? '&' : '?';
    return `${src}${separator}f_auto&q=${quality}&w=${width}`;
  }

  // For Imgix images
  if (src.includes('imgix.net')) {
    // Check if the URL already has parameters
    const hasParams = src.includes('?');
    const separator = hasParams ? '&' : '?';

    // Add format, width and quality parameters
    return `${src}${separator}fm=webp&w=${width}&q=${quality}&auto=compress`;
  }

  // For local images, Next.js will handle optimization
  return src;
}

/**
 * Get appropriate image sizes attribute based on layout
 * @param layout Image layout (full, half, third, etc.)
 * @returns Sizes attribute for responsive images
 */
export function getImageSizes(layout: 'full' | 'half' | 'third' | 'quarter' | 'custom' = 'full', customSizes?: string): string {
  if (layout === 'custom' && customSizes) {
    return customSizes;
  }

  switch (layout) {
    case 'full':
      return '(max-width: 768px) 100vw, 100vw';
    case 'half':
      return '(max-width: 768px) 100vw, 50vw';
    case 'third':
      return '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';
    case 'quarter':
      return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
    default:
      return '(max-width: 768px) 100vw, 100vw';
  }
}

/**
 * Generate a blur data URL for an image
 * @param color Background color for the blur image
 * @param width Width of the blur image
 * @param height Height of the blur image
 * @returns Data URL for the blur image
 */
export function generateBlurDataURL(color = '#f3f4f6', width = 400, height = 300): string {
  // Create a simple SVG placeholder with the specified color
  return `data:image/svg+xml;charset=utf-8,<svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${encodeURIComponent(color)}"/></svg>`;
}

/**
 * Get a fallback image URL based on category or content
 * @param category Content category or keywords
 * @returns Fallback image URL
 */
export function getFallbackImage(category: string = ''): string {
  const lowerCategory = category.toLowerCase();

  if (lowerCategory.includes('cruise') || lowerCategory.includes('ship')) {
    return 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&q=80&w=2400';
  } else if (lowerCategory.includes('food') || lowerCategory.includes('dining')) {
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&q=80&w=2400';
  } else if (lowerCategory.includes('hotel') || lowerCategory.includes('resort')) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&q=80&w=2400';
  } else if (lowerCategory.includes('airline') || lowerCategory.includes('flight')) {
    return 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&q=80&w=2400';
  } else if (lowerCategory.includes('beach') || lowerCategory.includes('ocean')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&q=80&w=2400';
  } else if (lowerCategory.includes('mountain') || lowerCategory.includes('hiking')) {
    return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&q=80&w=2400';
  } else if (lowerCategory.includes('city') || lowerCategory.includes('urban')) {
    return 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&q=80&w=2400';
  } else if (lowerCategory.includes('adventure') || lowerCategory.includes('outdoor')) {
    return 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?auto=format&q=80&w=2400';
  } else if (lowerCategory.includes('culture') || lowerCategory.includes('history')) {
    return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&q=80&w=2400';
  } else {
    // Default travel image
    return 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&q=80&w=2400';
  }
}

export default {
  imageLoader,
  getImageSizes,
  generateBlurDataURL,
  getFallbackImage
};
