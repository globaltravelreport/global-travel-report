/**
 * API response caching utilities
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for API responses
// In a production environment, this should be replaced with Redis or a similar solution
const responseCache = new Map<string, { response: any; timestamp: number }>();

/**
 * Default cache TTL in milliseconds (5 minutes)
 */
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Generate a cache key for an API request
 * @param request - The Next.js request object
 * @returns A cache key
 */
export function generateCacheKey(request: NextRequest): string {
  const url = request.nextUrl.toString();
  const method = request.method;

  // For GET requests, use the URL as the cache key
  if (method === 'GET') {
    return `${method}:${url}`;
  }

  // For other methods, include the request body in the cache key
  // This is a simplified approach and may not work for all cases
  return `${method}:${url}:${JSON.stringify(request.body)}`;
}

/**
 * Check if a cached response is still valid
 * @param cachedData - The cached data
 * @param ttl - The TTL in milliseconds
 * @returns Boolean indicating if the cached response is still valid
 */
function isCacheValid(cachedData: { timestamp: number }, ttl: number): boolean {
  const now = Date.now();
  return now - cachedData.timestamp < ttl;
}

/**
 * Get a cached response
 * @param cacheKey - The cache key
 * @param ttl - The TTL in milliseconds
 * @returns The cached response or undefined if not found or expired
 */
export function getCachedResponse(cacheKey: string, ttl: number = DEFAULT_CACHE_TTL): unknown | undefined {
  if (responseCache.has(cacheKey)) {
    const cachedData = responseCache.get(cacheKey);

    if (cachedData && isCacheValid(cachedData, ttl)) {
      return cachedData.response;
    }

    // Remove expired cache entry
    responseCache.delete(cacheKey);
  }

  return undefined;
}

/**
 * Cache a response
 * @param cacheKey - The cache key
 * @param response - The response to cache
 */
export function cacheResponse(cacheKey: string, response: unknown): void {
  responseCache.set(cacheKey, {
    response,
    timestamp: Date.now(),
  });
}

/**
 * Clear the response cache
 */
export function clearResponseCache(): void {
  responseCache.clear();
}

/**
 * Get the size of the response cache
 * @returns The number of cached responses
 */
export function getResponseCacheSize(): number {
  return responseCache.size;
}

/**
 * Clean up expired cache entries
 * @param ttl - The TTL in milliseconds
 */
export function cleanupResponseCache(ttl: number = DEFAULT_CACHE_TTL): void {
  const now = Date.now();

  // Convert entries to array first to avoid iterator issues
  Array.from(responseCache.entries()).forEach(([key, data]) => {
    if (now - data.timestamp >= ttl) {
      responseCache.delete(key);
    }
  });
}

/**
 * Middleware for caching API responses
 * @param request - The Next.js request object
 * @param ttl - The TTL in milliseconds
 * @returns The cached response or undefined if not found or expired
 */
export function cacheMiddleware(request: NextRequest, ttl: number = DEFAULT_CACHE_TTL): NextResponse | undefined {
  // Only cache GET requests
  if (request.method !== 'GET') {
    return undefined;
  }

  // Only cache API routes
  const path = request.nextUrl.pathname;
  if (!path.startsWith('/api/')) {
    return undefined;
  }

  // Skip caching for certain endpoints
  const skipCachePaths = ['/api/auth', '/api/contact', '/api/newsletter'];
  if (skipCachePaths.some(skipPath => path.startsWith(skipPath))) {
    return undefined;
  }

  // Generate cache key
  const cacheKey = generateCacheKey(request);

  // Check cache
  const cachedResponse = getCachedResponse(cacheKey, ttl);
  if (cachedResponse && typeof cachedResponse === 'object' && cachedResponse !== null) {
    // Clone the cached response - use type assertion since we know the structure
    const typedResponse = cachedResponse as {
      data: any;
      status: number;
      headers: Record<string, string>
    };

    const response = NextResponse.json(typedResponse.data, {
      status: typedResponse.status,
      headers: typedResponse.headers,
    });

    // Add cache headers
    response.headers.set('X-Cache', 'HIT');

    return response;
  }

  return undefined;
}
