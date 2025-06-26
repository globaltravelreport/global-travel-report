
import { NextRequest } from 'next/server';

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiting utility
 * @param req - The Next.js request object
 * @param options - Rate limiting options
 * @returns Rate limit result
 */
export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { maxRequests, windowMs } = options;
  
  // Get client IP address
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
    req.headers.get('x-real-ip') || 
    'unknown';
  
  const now = Date.now();
  const key = `rate_limit:${ip}`;
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    for (const [k, v] of Array.from(rateLimitStore.entries())) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }
  }
  
  const current = rateLimitStore.get(key);
  
  if (!current || current.resetTime < now) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    
    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    };
  }
  
  if (current.count >= maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetTime: current.resetTime
    };
  }
  
  // Increment count
  current.count++;
  rateLimitStore.set(key, current);
  
  return {
    success: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime
  };
}