import { NextRequest } from 'next/server';

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */
export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { maxRequests, windowMs } = options;
  
  // Get client IP address
  const clientIP = getClientIP(req);
  const key = `rate_limit:${clientIP}`;
  const now = Date.now();
  
  // Clean up expired entries periodically
  cleanupExpiredEntries(now);
  
  // Get current rate limit data for this IP
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    // First request or window has expired, reset the counter
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetTime,
    };
  }
  
  if (current.count >= maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetTime: current.resetTime,
    };
  }
  
  // Increment counter
  current.count++;
  rateLimitStore.set(key, current);
  
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime,
  };
}

/**
 * Extract client IP address from request
 */
function getClientIP(req: NextRequest): string {
  // Check various headers for the real IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a default IP if none found
  return '127.0.0.1';
}

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries(now: number): void {
  for (const [key, value] of Array.from(rateLimitStore.entries())) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Clear all rate limit data (useful for testing)
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}
