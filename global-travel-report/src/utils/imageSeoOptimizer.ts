/**
 * Image SEO Optimizer
 *
 * A utility for optimizing images for SEO, including generating
 * descriptive alt text, proper file naming, and image metadata.
 */

import { Story } from '@/types/Story';
import { slugify } from './url';

/**
 * Generate SEO-friendly alt text for a story image
 * @param story The story the image belongs to
 * @returns SEO-optimized alt text
 */
export function generateSeoAltText(story: Story): string {
  // Start with the title
  let altText = story.title;

  // Add country if not in the title and not Global
  if (story.country && story.country !== 'Global' && !altText.toLowerCase().includes(story.country.toLowerCase())) {
    altText = `${altText} in ${story.country}`;
  }

  // Add category if not in the title
  if (story.category && !altText.toLowerCase().includes(story.category.toLowerCase())) {
    altText = `${altText} - ${story.category} Guide`;
  }

  // Add photographer attribution
  if (story.photographer && story.photographer.name) {
    altText = `${altText} | Photo by ${story.photographer.name}`;
  }

  // Ensure alt text is not too long (max 125 characters)
  if (altText.length > 125) {
    altText = altText.substring(0, 122) + '...';
  }

  return altText;
}

/**
 * Generate SEO-friendly image filename
 * @param story The story the image belongs to
 * @param extension The image file extension (default: jpg)
 * @returns SEO-optimized filename
 */
export function generateSeoFilename(story: Story, extension: string = 'jpg'): string {
  // Start with the slug or generate one from the title
  const baseSlug = story.slug || slugify(story.title);

  // Add country if not Global and not in the slug
  const countrySlug = story.country && story.country !== 'Global'
    ? slugify(story.country)
    : '';

  const hasCountry = baseSlug.includes(countrySlug);

  // Add category if not in the slug
  const categorySlug = story.category
    ? slugify(story.category)
    : '';

  const hasCategory = baseSlug.includes(categorySlug);

  // Combine elements
  let filename = baseSlug;

  if (countrySlug && !hasCountry) {
    filename = `${filename}-${countrySlug}`;
  }

  if (categorySlug && !hasCategory) {
    filename = `${filename}-${categorySlug}`;
  }

  // Add global-travel-report prefix for branding
  filename = `global-travel-report-${filename}`;

  // Ensure filename is not too long (max 60 characters)
  if (filename.length > 60) {
    filename = filename.substring(0, 60);
  }

  // Add extension
  return `${filename}.${extension.replace(/^\./, '')}`;
}

/**
 * Generate image caption with SEO benefits
 * @param story The story the image belongs to
 * @returns SEO-friendly image caption
 */
export function generateSeoCaption(story: Story): string {
  // Start with the title
  let caption = story.title;

  // Add country if not in the caption
  if (story.country && story.country !== 'Global' && !caption.includes(story.country)) {
    caption = `${caption} in ${story.country}`;
  }

  // Add photographer attribution
  if (story.photographer && story.photographer.name) {
    caption = `${caption} | Photo: ${story.photographer.name}`;

    // Add photographer URL if available
    if (story.photographer.url) {
      caption = `${caption} (${story.photographer.url.replace('https://unsplash.com/@', '@')})`;
    }
  }

  return caption;
}

/**
 * Generate structured image metadata for SEO
 * @param story The story the image belongs to
 * @param siteUrl The base URL of the site
 * @returns Structured image metadata
 */
export function generateImageMetadata(story: Story, siteUrl: string = 'https://www.globaltravelreport.com'): any {
  const imageUrl = story.imageUrl?.startsWith('http')
    ? story.imageUrl
    : `${siteUrl}${story.imageUrl || '/images/default-story.jpg'}`;

  const altText = generateSeoAltText(story);
  const caption = generateSeoCaption(story);

  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    'contentUrl': imageUrl,
    'name': altText,
    'description': caption,
    'creditText': story.photographer?.name ? `Photo by ${story.photographer.name}` : undefined,
    'copyrightNotice': story.photographer?.name ? `© ${story.photographer.name}` : undefined,
    'license': 'https://unsplash.com/license',
    'acquireLicensePage': story.photographer?.url || 'https://unsplash.com',
    'creator': {
      '@type': 'Person',
      'name': story.photographer?.name || 'Unknown',
      'url': story.photographer?.url || undefined
    },
    'copyrightYear': new Date(story.publishedAt).getFullYear(),
    'encodingFormat': imageUrl.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
    'width': '1200',
    'height': '630',
    'representativeOfPage': true
  };
}

/**
 * Check if an image URL is SEO-friendly
 * @param imageUrl The image URL to check
 * @returns Object with check results
 */
export function checkImageSeoFriendliness(imageUrl: string): {
  isSeoFriendly: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check if URL is valid
  if (!imageUrl) {
    issues.push('Missing image URL');
    suggestions.push('Add a descriptive image URL');
    return { isSeoFriendly: false, issues, suggestions };
  }

  // Check if URL is too long
  if (imageUrl.length > 100) {
    issues.push('Image URL is too long');
    suggestions.push('Shorten the image URL to less than 100 characters');
  }

  // Check if URL contains descriptive keywords
  const urlParts = imageUrl.split('/').pop()?.split('.')[0].split('-') || [];
  if (urlParts.length < 3) {
    issues.push('Image URL lacks descriptive keywords');
    suggestions.push('Use 3+ descriptive keywords in the image filename');
  }

  // Check if URL contains random strings/numbers
  const hasRandomStrings = urlParts.some(part => /^[a-z0-9]{8,}$/.test(part));
  if (hasRandomStrings) {
    issues.push('Image URL contains random strings or numbers');
    suggestions.push('Replace random strings with descriptive keywords');
  }

  // Check file format
  const fileExtension = imageUrl.split('.').pop()?.toLowerCase();
  if (!fileExtension || !['jpg', 'jpeg', 'png', 'webp'].includes(fileExtension)) {
    issues.push('Image format may not be optimal');
    suggestions.push('Use WebP format for best performance, with JPEG/PNG fallbacks');
  }

  return {
    isSeoFriendly: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * Optimize an image URL for SEO
 * @param imageUrl The original image URL
 * @param story The story the image belongs to
 * @returns Optimized image URL if possible, or the original
 */
export function optimizeImageUrl(imageUrl: string, story: Story): string {
  // If it's an Unsplash URL, we can't change it
  if (imageUrl.includes('unsplash.com')) {
    return imageUrl;
  }

  // If it's a relative URL, we can optimize it
  if (!imageUrl.startsWith('http')) {
    const seoFilename = generateSeoFilename(story);
    return `/images/stories/${seoFilename}`;
  }

  // For other URLs, return as is
  return imageUrl;
}

/**
 * Fully optimize a story's image for SEO
 * @param story The story to optimize
 * @returns Object with optimized image properties
 */
export function optimizeStoryImageForSeo(story: Story): {
  imageUrl: string;
  altText: string;
  caption: string;
  metadata: Record<string, string>;
} {
  const optimizedUrl = story.imageUrl ? optimizeImageUrl(story.imageUrl, story) : '';
  const altText = generateSeoAltText(story);
  const caption = generateSeoCaption(story);
  const metadata = generateImageMetadata(story);

  return {
    imageUrl: optimizedUrl,
    altText,
    caption,
    metadata
  };
}

const imageSeoOptimizer = {
  generateSeoAltText,
  generateSeoFilename,
  generateSeoCaption,
  generateImageMetadata,
  checkImageSeoFriendliness,
  optimizeImageUrl,
  optimizeStoryImageForSeo
};

export default imageSeoOptimizer;
