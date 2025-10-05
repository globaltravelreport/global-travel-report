import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiResponse, createValidationErrorResponse } from './api-response';
import { logError } from './error-handler';
import { rateLimit } from './rate-limit';

// CORS configuration
interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
}

const DEFAULT_CORS_OPTIONS: CorsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  credentials: true,
};

// API Handler configuration
interface ApiHandlerConfig<T = any> {
  bodySchema?: z.ZodSchema<T>;
  querySchema?: z.ZodSchema<any>;
  enableCors?: boolean;
  corsOptions?: CorsOptions;
  requireAuth?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  maxRetries?: number;
  retryDelay?: number;
  validateCsrf?: boolean;
  onError?: (error: any) => NextResponse;
  cache?: {
    ttl: number;
    key?: string;
  };
}

// Request context
interface RequestContext {
  ip: string;
  userAgent: string;
  timestamp: number;
  requestId: string;
}

// API Handler type
type ApiHandler<T = any> = (
  req: NextRequest,
  data: T,
  context: RequestContext
) => Promise<NextResponse>;

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get request context information
 */
function getRequestContext(req: NextRequest): RequestContext {
  return {
    ip: req.ip || req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
    timestamp: Date.now(),
    requestId: generateRequestId(),
  };
}

/**
 * Apply CORS headers to response
 */
function applyCorsHeaders(response: NextResponse, options: CorsOptions = DEFAULT_CORS_OPTIONS): NextResponse {
  const { origin, methods, allowedHeaders, credentials } = options;

  if (origin === true) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  } else if (typeof origin === 'string') {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (Array.isArray(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin.join(', '));
  }

  if (methods) {
    response.headers.set('Access-Control-Allow-Methods', methods.join(', '));
  }

  if (allowedHeaders) {
    response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  }

  if (credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

/**
 * Validate CSRF token
 */
async function validateCsrfToken(req: NextRequest): Promise<boolean> {
  try {
    const token = req.headers.get('X-CSRF-Token') || req.headers.get('x-csrf-token');
    if (!token) {
      return false;
    }

    // In a real implementation, you would validate the token against your CSRF protection
    // For now, we'll just check if it exists and is not empty
    return token.length > 0;
  } catch (_error) {
    logError(_error, { context: 'CSRF validation' });
    return false;
  }
}

/**
 * Retry logic for API operations
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (_error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
}

/**
 * Simple in-memory cache (in production, use Redis or similar)
 */
const cache = new Map<string, { data: any; expires: number }>();

/**
 * Get cached response
 */
function getCachedResponse(key: string): any | null {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  if (cached) {
    cache.delete(key);
  }
  return null;
}

/**
 * Set cached response
 */
function setCachedResponse(key: string, data: any, ttl: number): void {
  cache.set(key, {
    data,
    expires: Date.now() + ttl,
  });
}

/**
 * Create a robust API handler with comprehensive error handling, validation, and features
 */
export function createApiHandler<T = any>(
  handler: ApiHandler<T>,
  config: ApiHandlerConfig<T> = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const context = getRequestContext(req);
    
    try {
      // Apply rate limiting if configured
      if (config.rateLimit) {
        const rateLimitResult = await rateLimit(req, config.rateLimit);
        if (!rateLimitResult.success) {
          const response = createApiResponse(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
          );
          return config.enableCors ? applyCorsHeaders(response, config.corsOptions) : response;
        }
      }

      // CSRF validation for non-GET requests
      if (config.validateCsrf && req.method !== 'GET') {
        const isValidCsrf = await validateCsrfToken(req);
        if (!isValidCsrf) {
          const response = createApiResponse(
            { error: 'Invalid CSRF token' },
            { status: 403 }
          );
          return config.enableCors ? applyCorsHeaders(response, config.corsOptions) : response;
        }
      }

      // Check cache if configured
      if (config.cache && req.method === 'GET') {
        const cacheKey = config.cache.key || `${req.url}_${JSON.stringify(Object.fromEntries(req.nextUrl.searchParams))}`;
        const cachedResponse = getCachedResponse(cacheKey);
        if (cachedResponse) {
          const response = NextResponse.json(cachedResponse);
          return config.enableCors ? applyCorsHeaders(response, config.corsOptions) : response;
        }
      }

      // Parse and validate request body
      let data: T | undefined;
      if (config.bodySchema && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
        try {
          const body = await req.json();
          data = config.bodySchema.parse(body);
        } catch (_error) {
          if (error instanceof z.ZodError) {
            const response = createValidationErrorResponse('Invalid request data', {
              errors: error.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message,
              })),
            });
            return config.enableCors ? applyCorsHeaders(response, config.corsOptions) : response;
          }
          throw error;
        }
      }

      // Parse and validate query parameters
      if (config.querySchema) {
        try {
          const query = Object.fromEntries(req.nextUrl.searchParams);
          config.querySchema.parse(query);
        } catch (_error) {
          if (error instanceof z.ZodError) {
            const response = createValidationErrorResponse('Invalid query parameters', {
              errors: error.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message,
              })),
            });
            return config.enableCors ? applyCorsHeaders(response, config.corsOptions) : response;
          }
          throw error;
        }
      }

      // Execute the handler with retry logic
      const executeHandler = () => handler(req, data as T, context);
      const response = config.maxRetries
        ? await withRetry(executeHandler, config.maxRetries, config.retryDelay)
        : await executeHandler();

      // Cache the response if configured
      if (config.cache && req.method === 'GET' && response.status === 200) {
        const cacheKey = config.cache.key || `${req.url}_${JSON.stringify(Object.fromEntries(req.nextUrl.searchParams))}`;
        const responseData = await response.clone().json();
        setCachedResponse(cacheKey, responseData, config.cache.ttl);
      }

      // Apply CORS headers if enabled
      return config.enableCors ? applyCorsHeaders(response, config.corsOptions) : response;

    } catch (_error) {
      // Log the error
      logError(_error, {
        context: 'API Handler',
        requestId: context.requestId,
        method: req.method,
        url: req.url,
        ip: context.ip,
        userAgent: context.userAgent,
      });

      // Use custom error handler if provided
      if (config.onError) {
        const response = config.onError(error);
        return config.enableCors ? applyCorsHeaders(response, config.corsOptions) : response;
      }

      // Default error response
      const response = createApiResponse(
        { error: 'Internal server error' },
        { status: 500 }
      );
      return config.enableCors ? applyCorsHeaders(response, config.corsOptions) : response;
    }
  };
}

/**
 * Create a simple OPTIONS handler for CORS preflight requests
 */
export function createOptionsHandler(corsOptions: CorsOptions = DEFAULT_CORS_OPTIONS) {
  return async (): Promise<NextResponse> => {
    const response = new NextResponse(null, { status: 200 });
    return applyCorsHeaders(response, corsOptions);
  };
}

/**
 * Utility function to create a cached API handler
 */
export function createCachedApiHandler<T = any>(
  handler: ApiHandler<T>,
  cacheKey: string,
  ttl: number,
  config: Omit<ApiHandlerConfig<T>, 'cache'> = {}
) {
  return createApiHandler(handler, {
    ...config,
    cache: { key: cacheKey, ttl },
  });
}