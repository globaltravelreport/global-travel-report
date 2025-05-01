/**
 * Memoization utilities for performance optimization
 *
 * This file contains utility functions for memoizing function results to improve performance
 * by caching the results of expensive function calls.
 *
 * Usage examples:
 *
 * 1. Memoize a function with a single argument:
 *    ```typescript
 *    const expensiveCalculation = (n: number) => {
 *      // Expensive calculation
 *      return n * n;
 *    };
 *
 *    const memoizedCalculation = memoize(expensiveCalculation);
 *    memoizedCalculation(5); // Calculates and caches
 *    memoizedCalculation(5); // Returns cached result
 *    ```
 *
 * 2. Memoize a function with multiple arguments:
 *    ```typescript
 *    const expensiveOperation = (a: number, b: number) => {
 *      // Expensive operation
 *      return a + b;
 *    };
 *
 *    const memoizedOperation = memoizeMultiArg(expensiveOperation);
 *    memoizedOperation(5, 10); // Calculates and caches
 *    memoizedOperation(5, 10); // Returns cached result
 *    ```
 *
 * 3. Memoize with expiration:
 *    ```typescript
 *    const fetchData = (url: string) => {
 *      // Fetch data from API
 *      return fetch(url).then(res => res.json());
 *    };
 *
 *    const memoizedFetch = memoizeWithExpiration(fetchData, 60000); // 1 minute TTL
 *    memoizedFetch('https://api.example.com/data'); // Fetches and caches
 *    memoizedFetch('https://api.example.com/data'); // Returns cached result if within TTL
 *    ```
 */

/**
 * Options for memoization
 */
export interface MemoizeOptions {
  maxCacheSize?: number;
  keyGenerator?: (arg: unknown) => string;
  shouldCache?: (result: unknown) => boolean;
}

/**
 * A simple memoization utility for caching function results
 * @param fn - The function to memoize
 * @param options - Memoization options
 * @returns A memoized version of the function
 */
export function memoize<T, R>(
  fn: (arg: T) => R,
  options: MemoizeOptions = {}
): (arg: T) => R {
  const {
    maxCacheSize = 100,
    keyGenerator = JSON.stringify,
    shouldCache = () => true
  } = options;

  const cache = new Map<string, R>();
  const keyTimestamps = new Map<string, number>();

  return (arg: T) => {
    const key = keyGenerator(arg);

    if (cache.has(key)) {
      // Update access timestamp for LRU eviction
      keyTimestamps.set(key, Date.now());
      const cachedResult = cache.get(key);
      if (cachedResult !== undefined) {
        return cachedResult;
      }
      // This should never happen since we checked cache.has(key)
      return fn(arg);
    }

    const result = fn(arg);

    // Only cache the result if it passes the shouldCache check
    if (shouldCache(result)) {
      // If cache is at max size, evict least recently used item
      if (cache.size >= maxCacheSize) {
        let oldestKey = '';
        let oldestTime = Infinity;

        // Convert entries to array first to avoid iterator issues
        Array.from(keyTimestamps.entries()).forEach(([k, time]) => {
          if (time < oldestTime) {
            oldestTime = time;
            oldestKey = k;
          }
        });

        if (oldestKey) {
          cache.delete(oldestKey);
          keyTimestamps.delete(oldestKey);
        }
      }

      // Add new item to cache
      cache.set(key, result);
      keyTimestamps.set(key, Date.now());
    }

    return result;
  };
}

/**
 * Options for multi-argument memoization
 */
export interface MemoizeMultiArgOptions {
  maxCacheSize?: number;
  keyGenerator?: (args: unknown[]) => string;
  shouldCache?: (result: unknown) => boolean;
}

/**
 * A memoization utility for functions with multiple arguments
 * @param fn - The function to memoize
 * @param options - Memoization options
 * @returns A memoized version of the function
 */
export function memoizeMultiArg<T extends any[], R>(
  fn: (...args: T) => R,
  options: MemoizeMultiArgOptions = {}
): (...args: T) => R {
  const {
    maxCacheSize = 100,
    keyGenerator = JSON.stringify,
    shouldCache = () => true
  } = options;

  const cache = new Map<string, R>();
  const keyTimestamps = new Map<string, number>();

  return (...args: T) => {
    const key = keyGenerator(args);

    if (cache.has(key)) {
      // Update access timestamp for LRU eviction
      keyTimestamps.set(key, Date.now());
      const cachedResult = cache.get(key);
      if (cachedResult !== undefined) {
        return cachedResult;
      }
      // This should never happen since we checked cache.has(key)
      return fn(...args);
    }

    const result = fn(...args);

    // Only cache the result if it passes the shouldCache check
    if (shouldCache(result)) {
      // If cache is at max size, evict least recently used item
      if (cache.size >= maxCacheSize) {
        let oldestKey = '';
        let oldestTime = Infinity;

        // Convert entries to array first to avoid iterator issues
        Array.from(keyTimestamps.entries()).forEach(([k, time]) => {
          if (time < oldestTime) {
            oldestTime = time;
            oldestKey = k;
          }
        });

        if (oldestKey) {
          cache.delete(oldestKey);
          keyTimestamps.delete(oldestKey);
        }
      }

      // Add new item to cache
      cache.set(key, result);
      keyTimestamps.set(key, Date.now());
    }

    return result;
  };
}

/**
 * A time-based memoization utility that expires cache entries after a specified time
 * @param fn - The function to memoize
 * @param ttl - Time to live in milliseconds
 * @returns A memoized version of the function with time-based expiration
 */
export function memoizeWithExpiration<T, R>(fn: (arg: T) => R, ttl = 60000): (arg: T) => R {
  const cache = new Map<string, { value: R; timestamp: number }>();

  return (arg: T) => {
    const key = JSON.stringify(arg);
    const now = Date.now();

    if (cache.has(key)) {
      const entry = cache.get(key);
      if (entry !== undefined) {
        if (now - entry.timestamp < ttl) {
          return entry.value;
        }
      }
    }

    const result = fn(arg);
    cache.set(key, { value: result, timestamp: now });
    return result;
  };
}
