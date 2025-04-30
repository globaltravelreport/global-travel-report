/**
 * Date utility functions
 */

/**
 * Format a date for display
 * @param date - The date to format
 * @returns A formatted date string
 */
export function formatDate(date: string | Date): string {
  const dateObj = new Date(date);
  
  if (!isValidDate(dateObj)) {
    return 'Invalid Date';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Check if a date is valid
 * @param date - The date to check
 * @returns Boolean indicating if the date is valid
 */
export function isValidDate(date: string | Date): boolean {
  const dateObj = date instanceof Date ? date : new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Check if a date is within the last 7 days
 * @param date - The date to check
 * @returns Boolean indicating if the date is within the last 7 days
 */
export function isWithinLast7Days(date: string | Date): boolean {
  if (!isValidDate(date)) {
    return false;
  }
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  
  return dateObj >= sevenDaysAgo;
}
