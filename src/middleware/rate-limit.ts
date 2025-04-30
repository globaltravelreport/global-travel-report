/**
 * Rate limiting middleware for API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting
// In a production environment, this should be replaced with Redis or a similar solution
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Configuration for rate limiting
 */
interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

/**
 * Default rate limit configurations
 */
const defaultRateLimits: Record<string, RateLimitConfig> = {
  // Default rate limit for all API endpoints
  default: {
    limit: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // Rate limit for authentication endpoints
  auth: {
    limit: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // Rate limit for contact form submissions
  contact: {
    limit: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // Rate limit for newsletter subscriptions
  newsletter: {
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // Rate limit for OpenAI API endpoints
  openai: {
    limit: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
};

/**
 * Get the rate limit configuration for a path
 * @param path - The request path
 * @returns The rate limit configuration
 */
function getRateLimitConfig(path: string): RateLimitConfig {
  if (path.includes('/api/auth')) {
    return defaultRateLimits.auth;
  }
  
  if (path.includes('/api/contact')) {
    return defaultRateLimits.contact;
  }
  
  if (path.includes('/api/newsletter')) {
    return defaultRateLimits.newsletter;
  }
  
  if (path.includes('/api/openai') || path.includes('/api/story/rewrite')) {
    return defaultRateLimits.openai;
  }
  
  return defaultRateLimits.default;
}

/**
 * Get a unique identifier for the request
 * @param request - The Next.js request object
 * @param path - The request path
 * @returns A unique identifier
 */
function getRequestIdentifier(request: NextRequest, path: string): string {
  // Use IP address as the identifier
  // In a production environment, you might want to use a more sophisticated approach
  const ip = request.ip || 'unknown';
  
  // Include the path to have separate rate limits for different endpoints
  return `${ip}:${path}`;
}

/**
 * Apply rate limiting to a request
 * @param request - The Next.js request object
 * @returns The Next.js response object if rate limit is exceeded, undefined otherwise
 */
export function applyRateLimit(request: NextRequest): NextResponse | undefined {
  // Only apply rate limiting to API routes
  const path = request.nextUrl.pathname;
  if (!path.startsWith('/api/')) {
    return;
  }
  
  // Get rate limit configuration for the path
  const config = getRateLimitConfig(path);
  
  // Get a unique identifier for the request
  const identifier = getRequestIdentifier(request, path);
  
  // Get current time
  const now = Date.now();
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(identifier);
  
  if (!entry || entry.resetTime <= now) {
    // Create new entry or reset expired entry
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(identifier, entry);
    
    // Add rate limit headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', config.limit.toString());
    response.headers.set('X-RateLimit-Remaining', (config.limit - 1).toString());
    response.headers.set('X-RateLimit-Reset', entry.resetTime.toString());
    
    return;
  }
  
  // Increment request count
  entry.count++;
  
  // Check if rate limit is exceeded
  if (entry.count > config.limit) {
    // Return 429 Too Many Requests
    const response = NextResponse.json(
      {
        success: false,
        message: 'Too many requests. Please try again later.',
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': entry.resetTime.toString(),
          'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString(),
        },
      }
    );
    
    return response;
  }
  
  // Add rate limit headers
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', config.limit.toString());
  response.headers.set('X-RateLimit-Remaining', (config.limit - entry.count).toString());
  response.headers.set('X-RateLimit-Reset', entry.resetTime.toString());
  
  return;
}

/**
 * Clean up expired rate limit entries
 * This should be called periodically to prevent memory leaks
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  
  for (const [identifier, entry] of rateLimitStore.entries()) {
    if (entry.resetTime <= now) {
      rateLimitStore.delete(identifier);
    }
  }
}
