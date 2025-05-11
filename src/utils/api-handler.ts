/**
 * Utilities for handling API routes with caching, rate limiting, and retry logic
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiResponse } from './api-response';
import { logError } from './error-handler';
import { cacheResponse, generateCacheKey } from './api-cache';
import { validateCsrfToken } from './csrf';

/**
 * Options for API route handlers
 */
export interface ApiHandlerOptions<T> {
  /**
   * Validation schema for request body
   */
  bodySchema?: z.ZodSchema<T>;

  /**
   * Validation schema for query parameters
   */
  querySchema?: z.ZodSchema<any>;

  /**
   * Whether to enable caching for GET requests
   */
  enableCache?: boolean;

  /**
   * Cache TTL in milliseconds
   */
  cacheTtl?: number;

  /**
   * Whether to enable CORS
   */
  enableCors?: boolean;

  /**
   * Maximum number of retries for the handler function
   */
  maxRetries?: number;

  /**
   * Delay between retries in milliseconds
   */
  retryDelay?: number;

  /**
   * Whether to validate CSRF token
   */
  validateCsrf?: boolean;

  /**
   * Custom error handler
   */
  onError?: (error: unknown) => NextResponse;
}

/**
 * Default options for API route handlers
 */
const defaultOptions: ApiHandlerOptions<any> = {
  enableCache: false,
  cacheTtl: 5 * 60 * 1000, // 5 minutes
  enableCors: true,
  maxRetries: 3,
  retryDelay: 1000,
  validateCsrf: true, // Enable CSRF validation by default
};

/**
 * Create a robust API route handler with validation, caching, and retry logic
 * @param handler - The handler function
 * @param options - Options for the handler
 * @returns A Next.js API route handler
 */
export function createApiHandler<T = any>(
  handler: (req: NextRequest, data: T) => Promise<NextResponse>,
  options: ApiHandlerOptions<T> = {}
): (req: NextRequest) => Promise<NextResponse> {
  // Merge options with defaults
  const {
    bodySchema,
    querySchema,
    enableCache,
    cacheTtl,
    enableCors,
    maxRetries,
    retryDelay,
    validateCsrf,
    onError,
  } = { ...defaultOptions, ...options };

  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Check if the request is cached (GET only)
      if (req.method === 'GET' && enableCache) {
        const cacheKey = generateCacheKey(req);
        const cachedResponse = await getCachedResponse(cacheKey, cacheTtl);

        if (cachedResponse) {
          // Add cache header
          cachedResponse.headers.set('X-Cache', 'HIT');

          // Add CORS headers if enabled
          if (enableCors) {
            addCorsHeaders(cachedResponse);
          }

          return cachedResponse;
        }
      }

      // Parse and validate query parameters
      let queryParams: any = {};
      if (querySchema) {
        const url = new URL(req.url);
        const params: Record<string, string> = {};

        url.searchParams.forEach((value, key) => {
          params[key] = value;
        });

        try {
          queryParams = querySchema.parse(params);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return createApiResponse(error, {
              status: 400,
              isError: true,
            });
          }
          throw error;
        }
      }

      // Parse and validate request body for non-GET requests
      let body: T | undefined;
      if (req.method !== 'GET' && bodySchema) {
        try {
          const json = await req.json();

          // Validate CSRF token for mutation requests if enabled
          if (validateCsrf && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            const csrfToken = json.csrfToken || req.headers.get('X-CSRF-Token');

            if (!csrfToken) {
              return createApiResponse(
                new Error('CSRF token is missing'),
                { status: 403, isError: true }
              );
            }

            const isValidCsrf = await validateCsrfToken(csrfToken);
            if (!isValidCsrf) {
              return createApiResponse(
                new Error('Invalid CSRF token'),
                { status: 403, isError: true }
              );
            }
          }

          body = bodySchema.parse(json);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return createApiResponse(error, {
              status: 400,
              isError: true,
            });
          }

          // Handle JSON parse error
          if (error instanceof SyntaxError) {
            return createApiResponse(
              new Error('Invalid JSON in request body'),
              { status: 400, isError: true }
            );
          }

          throw error;
        }
      }

      // Combine body and query parameters
      const data = { ...queryParams, ...body } as T;

      // Execute handler with retries
      let response: NextResponse | null = null;
      let lastError: unknown = null;
      let retryCount = 0;

      while (retryCount <= (maxRetries || 0)) {
        try {
          response = await handler(req, data);
          break;
        } catch (error) {
          lastError = error;
          retryCount++;

          // Log retry attempt
          console.warn(`API handler retry ${retryCount}/${maxRetries}:`, error);

          // If we've reached max retries, break out of the loop
          if (retryCount > (maxRetries || 0)) {
            break;
          }

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }

      // If we have a response, return it
      if (response) {
        // Cache the response if it's a GET request and caching is enabled
        if (req.method === 'GET' && enableCache) {
          const cacheKey = generateCacheKey(req);
          cacheResponse(cacheKey, response);

          // Add cache header
          response.headers.set('X-Cache', 'MISS');
        }

        // Add CORS headers if enabled
        if (enableCors) {
          addCorsHeaders(response);
        }

        return response;
      }

      // If we don't have a response, handle the error
      if (onError && lastError) {
        return onError(lastError);
      }

      // Default error handling
      logError(lastError, { context: 'API handler' });
      return createApiResponse(
        lastError || new Error('Unknown error'),
        { status: 500, isError: true }
      );
    } catch (error) {
      // Handle unexpected errors
      logError(error, { context: 'API handler' });

      if (onError) {
        return onError(error);
      }

      return createApiResponse(
        error,
        { status: 500, isError: true }
      );
    }
  };
}

/**
 * Get a cached response
 * @param cacheKey - The cache key
 * @param ttl - The TTL in milliseconds
 * @returns The cached response or null if not found
 */
async function getCachedResponse(cacheKey: string, ttl?: number): Promise<NextResponse | null> {
  // This is a placeholder for a real cache implementation
  // In a production environment, this would use Redis or a similar solution
  return null;
}

/**
 * Add CORS headers to a response
 * @param response - The response to add headers to
 */
function addCorsHeaders(response: NextResponse): void {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * Create an OPTIONS handler for CORS preflight requests
 * @returns A Next.js API route handler for OPTIONS requests
 */
export function createOptionsHandler(): (req: NextRequest) => NextResponse {
  return () => {
    const response = NextResponse.json({}, { status: 204 });
    addCorsHeaders(response);
    return response;
  };
}
