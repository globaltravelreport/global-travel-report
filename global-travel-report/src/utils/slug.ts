/**
 * Utility functions for generating and working with slugs
 */

/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
    .trim() // Remove leading and trailing whitespace
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

/**
 * Check if a slug is valid
 * @param slug - The slug to validate
 * @returns True if the slug is valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  // A valid slug should:
  // - Be at least 3 characters long
  // - Contain only lowercase letters, numbers, and hyphens
  // - Not start or end with a hyphen
  // - Not contain consecutive hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slug.length >= 3 && slugRegex.test(slug);
}

/**
 * Ensure a slug is unique by appending a number if necessary
 * @param slug - The base slug
 * @param existingSlugs - An array of existing slugs to check against
 * @returns A unique slug
 */
export function ensureUniqueSlug(slug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(slug)) {
    return slug;
  }

  let counter = 1;
  let uniqueSlug = `${slug}-${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }

  return uniqueSlug;
}
