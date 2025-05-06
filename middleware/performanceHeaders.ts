/**
 * Performance Headers Middleware
 * 
 * This middleware adds performance-enhancing HTTP headers to responses:
 * - Cache-Control headers for static assets
 * - Content-Security-Policy for security
 * - Permissions-Policy to control browser features
 * - Server-Timing for performance monitoring
 */

import { NextRequest, NextResponse } from 'next/server';

// Define asset types for caching
const STATIC_ASSETS = [
  { ext: 'jpg', type: 'image' },
  { ext: 'jpeg', type: 'image' },
  { ext: 'png', type: 'image' },
  { ext: 'webp', type: 'image' },
  { ext: 'svg', type: 'image' },
  { ext: 'ico', type: 'image' },
  { ext: 'css', type: 'style' },
  { ext: 'js', type: 'script' },
  { ext: 'woff', type: 'font' },
  { ext: 'woff2', type: 'font' },
  { ext: 'ttf', type: 'font' },
  { ext: 'otf', type: 'font' },
  { ext: 'json', type: 'data' },
];

// Cache durations in seconds
const CACHE_DURATIONS = {
  image: 60 * 60 * 24 * 7, // 7 days
  style: 60 * 60 * 24 * 7, // 7 days
  script: 60 * 60 * 24 * 7, // 7 days
  font: 60 * 60 * 24 * 30, // 30 days
  data: 60 * 60, // 1 hour
  page: 60 * 5, // 5 minutes
};

/**
 * Get cache control header based on asset type
 * @param pathname The request pathname
 * @returns Cache-Control header value
 */
function getCacheControlHeader(pathname: string): string {
  // Check if it's a static asset
  const assetType = STATIC_ASSETS.find(asset => pathname.endsWith(`.${asset.ext}`));
  
  if (assetType) {
    const maxAge = CACHE_DURATIONS[assetType.type];
    return `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`;
  }
  
  // For API routes, use no-cache
  if (pathname.startsWith('/api/')) {
    return 'no-store, must-revalidate';
  }
  
  // For normal pages, use a short cache
  return `public, max-age=${CACHE_DURATIONS.page}, stale-while-revalidate=${CACHE_DURATIONS.page * 2}`;
}

/**
 * Get Content-Security-Policy header
 * @returns CSP header value
 */
function getCSPHeader(): string {
  return `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://connect.facebook.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://www.google-analytics.com https://stats.g.doubleclick.net https://www.facebook.com;
    frame-src 'self' https://www.youtube.com https://www.facebook.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim();
}

/**
 * Get Permissions-Policy header
 * @returns Permissions-Policy header value
 */
function getPermissionsPolicyHeader(): string {
  return `
    geolocation=(),
    microphone=(),
    camera=(),
    payment=(),
    usb=(),
    fullscreen=(self),
    display-capture=(),
    accelerometer=(),
    autoplay=(self),
    gyroscope=(),
    magnetometer=(),
    midi=(),
    sync-xhr=(self),
    interest-cohort=()
  `.replace(/\s+/g, ' ').trim();
}

/**
 * Performance headers middleware
 * @param request The incoming request
 * @returns Response with performance headers
 */
export function performanceHeadersMiddleware(request: NextRequest): NextResponse {
  // Start timing
  const startTime = Date.now();
  
  // Get the pathname
  const { pathname } = request.nextUrl;
  
  // Create the response
  const response = NextResponse.next();
  
  // Add cache control headers
  const cacheControl = getCacheControlHeader(pathname);
  response.headers.set('Cache-Control', cacheControl);
  
  // Add security headers
  response.headers.set('Content-Security-Policy', getCSPHeader());
  response.headers.set('Permissions-Policy', getPermissionsPolicyHeader());
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add server timing header
  const processingTime = Date.now() - startTime;
  response.headers.set('Server-Timing', `middleware;dur=${processingTime}`);
  
  return response;
}

export default performanceHeadersMiddleware;
