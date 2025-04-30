/**
 * Options for memoization
 */
export interface MemoizeOptions {
  maxCacheSize?: number;
  keyGenerator?: (arg: any) => string;
  shouldCache?: (result: any) => boolean;
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
      return cache.get(key)!;
    }

    const result = fn(arg);

    // Only cache the result if it passes the shouldCache check
    if (shouldCache(result)) {
      // If cache is at max size, evict least recently used item
      if (cache.size >= maxCacheSize) {
        let oldestKey = '';
        let oldestTime = Infinity;

        for (const [k, time] of keyTimestamps.entries()) {
          if (time < oldestTime) {
            oldestTime = time;
            oldestKey = k;
          }
        }

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
  keyGenerator?: (args: any[]) => string;
  shouldCache?: (result: any) => boolean;
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
      return cache.get(key)!;
    }

    const result = fn(...args);

    // Only cache the result if it passes the shouldCache check
    if (shouldCache(result)) {
      // If cache is at max size, evict least recently used item
      if (cache.size >= maxCacheSize) {
        let oldestKey = '';
        let oldestTime = Infinity;

        for (const [k, time] of keyTimestamps.entries()) {
          if (time < oldestTime) {
            oldestTime = time;
            oldestKey = k;
          }
        }

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
export function memoizeWithExpiration<T, R>(fn: (arg: T) => R, ttl: number): (arg: T) => R {
  const cache = new Map<string, { value: R; timestamp: number }>();

  return (arg: T) => {
    const key = JSON.stringify(arg);
    const now = Date.now();

    if (cache.has(key)) {
      const entry = cache.get(key)!;
      if (now - entry.timestamp < ttl) {
        return entry.value;
      }
    }

    const result = fn(arg);
    cache.set(key, { value: result, timestamp: now });
    return result;
  };
}
