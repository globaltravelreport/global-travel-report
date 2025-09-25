/**
 * Check if a date is within the last 7 days
 * @param date - The date to check
 * @returns True if the date is within the last 7 days
 */
export function isWithinLast7Days(date: Date | string): boolean {
  const dateToCheck = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return dateToCheck >= sevenDaysAgo && dateToCheck <= now;
}

/**
 * Format a date for display
 * @param date - The date to format
 * @param locale - The locale to use for formatting
 * @returns A formatted date string
 */
export function formatDate(date: Date | string, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Truncate a string to a specified length
 * @param str - The string to truncate
 * @param length - The maximum length
 * @returns The truncated string
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) {
    return str;
  }
  
  return str.slice(0, length) + '...';
}

/**
 * Generate a slug from a string
 * @param str - The string to convert to a slug
 * @returns A URL-friendly slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
