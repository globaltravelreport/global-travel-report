/**
 * Global middleware for the application
 */

import { NextRequest, NextResponse } from 'next/server';
import { csrfMiddleware } from './middleware/csrf';
import { applyCSP } from './middleware/csp';
import { applyRateLimit, cleanupRateLimitStore } from './middleware/rate-limit';
import { cacheMiddleware, cleanupResponseCache } from './utils/api-cache';

/**
 * Middleware function that runs on every request
 * @param request - The Next.js request object
 * @returns The Next.js response object
 */
export function middleware(request: NextRequest): NextResponse {
  // Clean up expired entries periodically
  // This is a simple approach; in production, you might want to use a cron job
  if (Math.random() < 0.01) { // 1% chance to run cleanup on each request
    cleanupRateLimitStore();
    cleanupResponseCache();
  }

  // Check cache for API endpoints
  const cachedResponse = cacheMiddleware(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Apply rate limiting for API endpoints
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Apply CSRF protection
  const csrfResponse = csrfMiddleware(request);
  if (csrfResponse) {
    return csrfResponse;
  }

  // Get the default response
  const response = NextResponse.next();

  // Apply Content Security Policy
  const responseWithCSP = applyCSP(request, response);

  // Add security headers
  responseWithCSP.headers.set('X-Content-Type-Options', 'nosniff');
  responseWithCSP.headers.set('X-Frame-Options', 'DENY');
  responseWithCSP.headers.set('X-XSS-Protection', '1; mode=block');
  responseWithCSP.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add Strict-Transport-Security header for HTTPS
  if (process.env.NODE_ENV === 'production') {
    responseWithCSP.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Add Permissions Policy
  responseWithCSP.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
  );

  return responseWithCSP;
}

/**
 * Configure which paths the middleware runs on
 */
export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
    // Exclude Next.js static files and public files
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.png$).*)',
  ],
};
