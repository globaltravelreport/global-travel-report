/**
 * URL utilities for consistent URL handling
 */

/**
 * Convert a string to a URL-friendly slug
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a story URL
 * @param slug - The story slug
 * @param absolute - Whether to return an absolute URL
 * @returns The story URL
 */
export function getStoryUrl(slug: string, absolute: boolean = false): string {
  const base = absolute ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com') : '';
  return `${base}/stories/${slug}`;
}

/**
 * Generate a category URL
 * @param category - The category name
 * @param absolute - Whether to return an absolute URL
 * @returns The category URL
 */
export function getCategoryUrl(category: string, absolute: boolean = false): string {
  const base = absolute ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com') : '';
  return `${base}/categories/${slugify(category)}`;
}

/**
 * Generate a country URL
 * @param country - The country name
 * @param absolute - Whether to return an absolute URL
 * @returns The country URL
 */
export function getCountryUrl(country: string, absolute: boolean = false): string {
  const base = absolute ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com') : '';
  return `${base}/countries/${slugify(country)}`;
}

/**
 * Generate a tag URL
 * @param tag - The tag name
 * @param absolute - Whether to return an absolute URL
 * @returns The tag URL
 */
export function getTagUrl(tag: string, absolute: boolean = false): string {
  const base = absolute ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com') : '';
  return `${base}/tags/${slugify(tag)}`;
}

/**
 * Generate an author URL
 * @param author - The author name
 * @param absolute - Whether to return an absolute URL
 * @returns The author URL
 */
export function getAuthorUrl(author: string, absolute: boolean = false): string {
  const base = absolute ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com') : '';
  return `${base}/authors/${slugify(author)}`;
}

/**
 * Generate a search URL with query parameters
 * @param params - The search parameters
 * @param absolute - Whether to return an absolute URL
 * @returns The search URL
 */
export function getSearchUrl(
  params: { query?: string; category?: string; country?: string; tag?: string; page?: number },
  absolute: boolean = false
): string {
  const base = absolute ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com') : '';
  const url = new URL(`${base}/search`);
  
  if (params.query) url.searchParams.set('q', params.query);
  if (params.category) url.searchParams.set('category', slugify(params.category));
  if (params.country) url.searchParams.set('country', slugify(params.country));
  if (params.tag) url.searchParams.set('tag', slugify(params.tag));
  if (params.page && params.page > 1) url.searchParams.set('page', params.page.toString());
  
  return url.toString().replace(url.origin, base);
}

/**
 * Generate a canonical URL for the current page
 * @param path - The current path
 * @returns The canonical URL
 */
export function getCanonicalUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';
  return `${base}${path}`;
}
