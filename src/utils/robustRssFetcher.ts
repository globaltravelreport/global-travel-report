/**
 * Robust RSS Feed Fetcher
 *
 * A utility for fetching RSS feeds with robust error handling, retries,
 * and fallback mechanisms to ensure reliable content delivery.
 */

import Parser from 'rss-parser';
import { error, warn, info } from './errorLogger';

// Define feed item interface
export interface FeedItem {
  title: string;
  link: string;
  content: string;
  contentSnippet?: string;
  isoDate?: string;
  pubDate?: string;
  creator?: string;
  categories?: string[];
  guid?: string;
  [key: string]: any;
}

// Define feed interface
export interface Feed {
  title: string;
  description?: string;
  link: string;
  items: FeedItem[];
  lastBuildDate?: string;
  feedUrl?: string;
  [key: string]: any;
}

// Define feed fetch result
export interface FeedFetchResult {
  feed: Feed | null;
  items: FeedItem[];
  error?: Error;
  statusCode?: number;
  success: boolean;
}

// Define feed fetch options
export interface FeedFetchOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  userAgent?: string;
  fallbackFeeds?: string[];
  maxItems?: number;
  filterCallback?: (item: FeedItem) => boolean;
}

// Default options
const DEFAULT_OPTIONS: FeedFetchOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 10000,
  userAgent: 'GlobalTravelReport/1.0 (https://www.globaltravelreport.com)',
  maxItems: 10
};

// Create a parser with custom fields
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['media:thumbnail', 'thumbnail'],
      ['dc:creator', 'creator'],
      ['content:encoded', 'contentEncoded']
    ]
  }
});

/**
 * Sleep for a specified number of milliseconds
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch a single RSS feed with retries
 * @param feedUrl The URL of the RSS feed
 * @param options Feed fetch options
 * @returns Feed fetch result
 */
export async function fetchFeed(feedUrl: string, options: FeedFetchOptions = {}): Promise<FeedFetchResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;
  let statusCode: number | undefined;

  // Try to fetch the feed with retries
  for (let attempt = 1; attempt <= (opts.maxRetries || 1); attempt++) {
    try {
      // Log the attempt
      if (attempt > 1) {
        info(`Retry ${attempt}/${opts.maxRetries} for feed: ${feedUrl}`);
      }

      // Fetch the feed
      const feed = await parser.parseURL(feedUrl);

      // Filter items if a filter callback is provided
      let items = feed.items as FeedItem[];
      if (opts.filterCallback) {
        items = items.filter(opts.filterCallback);
      }

      // Limit the number of items if maxItems is provided
      if (opts.maxItems && opts.maxItems > 0) {
        items = items.slice(0, opts.maxItems);
      }

      // Return the successful result
      return {
        feed: feed as Feed,
        items,
        success: true
      };
    } catch (err) {
      // Handle fetch error
      lastError = err as Error;

      // Try to extract status code from error
      if (err instanceof Error && err.message.includes('status code')) {
        const match = err.message.match(/status code (\d+)/);
        if (match && match[1]) {
          statusCode = parseInt(match[1], 10);
        }
      }

      // Log the error
      warn(`Failed to fetch feed ${feedUrl}`, { attempt, statusCode }, lastError);

      // If this is not the last attempt, wait before retrying
      if (attempt < (opts.maxRetries || 1)) {
        await sleep(opts.retryDelay || 1000);
      }
    }
  }

  // If we get here, all attempts failed
  error(`Failed to fetch feed ${feedUrl} after ${opts.maxRetries} retries`,
    { statusCode }, lastError);

  // Return the error result
  return {
    feed: null,
    items: [],
    error: lastError,
    statusCode,
    success: false
  };
}

/**
 * Fetch multiple RSS feeds with fallbacks
 * @param feedUrls Array of feed URLs to fetch
 * @param options Feed fetch options
 * @returns Array of feed items from all successful feeds
 */
export async function fetchFeeds(feedUrls: string[], options: FeedFetchOptions = {}): Promise<FeedItem[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const results: FeedFetchResult[] = [];
  const allItems: FeedItem[] = [];

  // Track feed fetch statistics
  const stats = {
    total: feedUrls.length,
    success: 0,
    failed: 0,
    failedUrls: [] as string[]
  };

  // Fetch each feed
  for (const feedUrl of feedUrls) {
    const result = await fetchFeed(feedUrl, opts);
    results.push(result);

    // Update statistics
    if (result.success) {
      stats.success++;
      allItems.push(...result.items);
    } else {
      stats.failed++;
      stats.failedUrls.push(feedUrl);

      // Try fallback feeds if provided
      if (opts.fallbackFeeds && opts.fallbackFeeds.length > 0) {
        for (const fallbackUrl of opts.fallbackFeeds) {
          // Skip if this is the same as the original feed
          if (fallbackUrl === feedUrl) continue;

          info(`Trying fallback feed: ${fallbackUrl}`);
          const fallbackResult = await fetchFeed(fallbackUrl, opts);

          if (fallbackResult.success) {
            allItems.push(...fallbackResult.items);
            info(`Successfully fetched fallback feed: ${fallbackUrl}`);
            break;
          }
        }
      }
    }
  }

  // Log feed fetch summary
  info(`Feed fetch summary:
- Total feeds attempted: ${stats.total}
- Failed feeds: ${stats.failed}
- Success rate: ${Math.round((stats.success / stats.total) * 100)}%

Top feed failures:
${stats.failedUrls.slice(0, 5).map(url => `- ${url}: ${results.find(r => !r.success && r.feed?.feedUrl === url)?.error?.message || 'Unknown error'}`).join('\n')}
`);

  // Sort items by date (newest first)
  allItems.sort((a, b) => {
    const dateA = a.isoDate || a.pubDate || '';
    const dateB = b.isoDate || b.pubDate || '';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  // Remove duplicates based on title or guid
  const uniqueItems = allItems.filter((item, index, self) =>
    index === self.findIndex(t =>
      (t.guid && t.guid === item.guid) ||
      (t.title && t.title === item.title)
    )
  );

  // Limit the total number of items if maxItems is provided
  if (opts.maxItems && opts.maxItems > 0) {
    return uniqueItems.slice(0, opts.maxItems);
  }

  return uniqueItems;
}

const robustRssFetcher = {
  fetchFeed,
  fetchFeeds
};

export default robustRssFetcher;
