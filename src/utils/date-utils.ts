/**
 * Unified date utility functions for consistent date handling
 *
 * This file contains utility functions for working with dates in the Global Travel Report.
 *
 * Usage examples:
 *
 * 1. Format a date for display:
 *    ```typescript
 *    const formatted = formatDisplayDate(new Date()); // e.g., 'March 24, 2024'
 *    ```
 *
 * 2. Format a date with time:
 *    ```typescript
 *    const formatted = formatDisplayDateTime(new Date()); // e.g., 'March 24, 2024, 10:30 AM'
 *    ```
 *
 * 3. Format a date for ISO string:
 *    ```typescript
 *    const iso = formatISODate(new Date()); // e.g., '2024-03-24'
 *    ```
 *
 * 4. Check if a date is in the past:
 *    ```typescript
 *    const isPast = isPastDate(new Date('2020-01-01')); // true
 *    ```
 *
 * 5. Get a date from N days ago:
 *    ```typescript
 *    const lastWeek = getDaysAgo(7); // Date object from 7 days ago
 *    ```
 *
 * 6. Check if a story is archived:
 *    ```typescript
 *    const isOld = isArchived(new Date('2020-01-01'), 30); // true if more than 30 days old
 *    ```
 */

/**
 * Format a date for display in the UI
 * @param date - The date to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns A formatted date string
 */
export function formatDisplayDate(date: Date | string, locale: string = 'en-US'): string {
  // If the date is invalid, return 'Unknown date'
  if (!date) {
    return 'Unknown date';
  }

  try {
    // Convert to Date object if it's a string
    const dateObj = date instanceof Date ? date : new Date(date);

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn(`Invalid date: ${date}, returning 'Unknown date'`);
      return 'Unknown date';
    }

    // Format the date
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  } catch (error) {
    console.error(`Error formatting date: ${date}`, error);
    return 'Unknown date';
  }
}

/**
 * Format a date for display with time
 * @param date - The date to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns A formatted date and time string
 */
export function formatDisplayDateTime(date: Date | string, locale: string = 'en-US'): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

/**
 * Format a date for ISO string (YYYY-MM-DD)
 * @param date - The date to format
 * @returns A formatted date string in ISO format
 */
export function formatISODate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  return dateObj.toISOString().split('T')[0];
}

/**
 * Format a date for RSS feeds (RFC 822 format)
 * @param date - The date to format
 * @returns A formatted date string for RSS
 */
export function formatRSSDate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  return dateObj.toUTCString();
}

/**
 * Format a date for database storage (ISO format)
 * @param date - The date to format
 * @returns A formatted date string for database storage
 */
export function formatDatabaseDate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  return dateObj.toISOString();
}

/**
 * Check if a date is in the past
 * @param date - The date to check
 * @returns Boolean indicating if the date is in the past
 */
export function isPastDate(date: Date | string): boolean {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();

  return dateObj < now;
}

/**
 * Check if a date is in the future
 * @param date - The date to check
 * @returns Boolean indicating if the date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();

  return dateObj > now;
}

/**
 * Get a date that is a specified number of days ago
 * @param days - Number of days ago
 * @returns Date object representing the date that many days ago
 */
export function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Get a date that is a specified number of days in the future
 * @param days - Number of days in the future
 * @returns Date object representing the date that many days in the future
 */
export function getDaysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Calculate the difference in days between two dates
 * @param date1 - The first date
 * @param date2 - The second date (default: current date)
 * @returns Number of days between the dates
 */
export function daysBetween(date1: Date | string, date2: Date | string = new Date()): number {
  const dateObj1 = date1 instanceof Date ? date1 : new Date(date1);
  const dateObj2 = date2 instanceof Date ? date2 : new Date(date2);

  const diffTime = Math.abs(dateObj2.getTime() - dateObj1.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if a story is archived (older than a specified number of days)
 * @param publishDate - The publish date of the story
 * @param archiveDays - Number of days after which a story is considered archived (default: 7)
 * @returns Boolean indicating if the story is archived
 */
export function isArchived(publishDate: Date | string, archiveDays: number = 7): boolean {
  const dateObj = publishDate instanceof Date ? publishDate : new Date(publishDate);
  const archiveDate = getDaysAgo(archiveDays);

  return dateObj < archiveDate;
}

/**
 * Validate a date string and return a valid date
 * If the date is invalid or in the future, returns the current date
 * @param dateStr - The date string to validate
 * @returns A valid Date object
 */
export function validateDate(dateStr: string | Date): Date {
  const now = new Date();

  // If it's already a Date object, check if it's valid and not in the future
  if (dateStr instanceof Date) {
    // Check if the date is valid
    if (isNaN(dateStr.getTime())) {
      console.warn(`Invalid date object, using current date instead`);
      return now;
    }

    // Check if the date is in the future
    if (dateStr > now) {
      console.warn(`Future date detected: ${dateStr.toISOString()}, adjusting to current date`);
      return now;
    }

    // Return the valid date
    return dateStr;
  }

  try {
    const date = new Date(dateStr);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateStr}, using current date instead`);
      return now;
    }

    // Check if the date is in the future
    if (date > now) {
      console.warn(`Future date detected: ${dateStr}, adjusting to current date`);
      return now;
    }

    // Return the valid date
    return date;
  } catch (error) {
    // If there's any error parsing the date, return the current date
    console.error(`Error processing date: ${dateStr}`, error);
    return now;
  }
}

/**
 * Get a safe date string for database storage
 * Ensures the date is valid and not in the future
 * @param dateStr - The date string to validate
 * @returns A valid ISO date string
 */
export function getSafeDateString(dateStr: string | Date): string {
  try {
    // Convert to Date object
    const dateObj = dateStr instanceof Date ? dateStr : new Date(dateStr);
    const now = new Date();

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn(`Invalid date: ${dateStr}, using current date instead`);
      return now.toISOString();
    }

    // Check if the date is in the future
    if (dateObj > now) {
      console.warn(`Future date detected: ${dateStr}, adjusting to current date`);
      return now.toISOString();
    }

    // Return the valid date
    return dateObj.toISOString();
  } catch (error) {
    console.error(`Error processing date: ${dateStr}`, error);
    return new Date().toISOString();
  }
}
