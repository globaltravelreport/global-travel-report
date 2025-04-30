/**
 * Unified date utility functions for consistent date handling
 */

/**
 * Format a date for display in the UI
 * @param date - The date to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns A formatted date string
 */
export function formatDisplayDate(date: Date | string, locale: string = 'en-US'): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
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
