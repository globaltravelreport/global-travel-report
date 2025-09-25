/**
 * Centralized date utility functions for Global Travel Report
 * This file contains all date-related operations to ensure consistent date handling across the application
 */

import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns';

/**
 * Format a date string or Date object to a human-readable format
 * @param date Date string or Date object
 * @param formatString Optional format string (default: 'MMMM d, yyyy')
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, formatString: string = 'MMMM d, yyyy'): string {
  try {
    // Handle string dates
    if (typeof date === 'string') {
      // Try to parse the date string
      const parsedDate = parseISO(date);
      if (!isValid(parsedDate)) {
        throw new Error(`Invalid date string: ${date}`);
      }
      return format(parsedDate, formatString);
    }
    
    // Handle Date objects
    if (date instanceof Date) {
      if (!isValid(date)) {
        throw new Error('Invalid Date object');
      }
      return format(date, formatString);
    }
    
    throw new Error(`Unsupported date type: ${typeof date}`);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Parse a date string to a Date object
 * @param dateString Date string to parse
 * @returns Date object or null if invalid
 */
export function parseDate(dateString: string): Date | null {
  try {
    const parsedDate = parseISO(dateString);
    return isValid(parsedDate) ? parsedDate : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Get a relative time string (e.g., "2 days ago")
 * @param date Date string or Date object
 * @returns Relative time string
 */
export function getRelativeTime(date: string | Date): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) {
      throw new Error('Invalid date');
    }
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  } catch (error) {
    console.error('Error getting relative time:', error);
    return 'Invalid date';
  }
}

/**
 * Convert a Date object to ISO string format
 * @param date Date object or string
 * @returns ISO string
 */
export function toISOString(date: Date | string): string {
  try {
    if (typeof date === 'string') {
      const parsedDate = parseISO(date);
      if (!isValid(parsedDate)) {
        throw new Error(`Invalid date string: ${date}`);
      }
      return parsedDate.toISOString();
    }
    
    if (date instanceof Date) {
      if (!isValid(date)) {
        throw new Error('Invalid Date object');
      }
      return date.toISOString();
    }
    
    throw new Error(`Unsupported date type: ${typeof date}`);
  } catch (error) {
    console.error('Error converting to ISO string:', error);
    return new Date().toISOString(); // Fallback to current date
  }
}

/**
 * Get the current date as an ISO string
 * @returns Current date as ISO string
 */
export function getCurrentDateISO(): string {
  return new Date().toISOString();
}

/**
 * Check if a date is valid
 * @param date Date string or Date object
 * @returns Boolean indicating if the date is valid
 */
export function isValidDate(date: string | Date): boolean {
  try {
    if (typeof date === 'string') {
      return isValid(parseISO(date));
    }
    return isValid(date);
  } catch (error) {
    return false;
  }
}

/**
 * Get a date from N days ago
 * @param days Number of days ago
 * @returns Date object from N days ago
 */
export function getDateDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Format a date for use in URLs and filenames
 * @param date Date string or Date object
 * @returns Date formatted as YYYY-MM-DD
 */
export function formatDateForUrl(date: string | Date): string {
  return formatDate(date, 'yyyy-MM-dd');
}

/**
 * Safely handle date conversion for story objects
 * @param publishedAt Date string or Date object
 * @returns ISO string date
 */
export function safelyFormatStoryDate(publishedAt: string | Date): string {
  try {
    return toISOString(publishedAt);
  } catch (error) {
    console.error('Error formatting story date:', error);
    return getCurrentDateISO();
  }
}

// Export a default object for convenience
const dateUtils = {
  formatDate,
  parseDate,
  getRelativeTime,
  toISOString,
  getCurrentDateISO,
  isValidDate,
  getDateDaysAgo,
  formatDateForUrl,
  safelyFormatStoryDate
};

export default dateUtils;
