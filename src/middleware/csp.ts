/**
 * Content Security Policy middleware
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate a nonce for CSP
 * @returns A random nonce string
 */
export function generateNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64');
}

/**
 * Generate a Content Security Policy
 * @param nonce - The nonce to use for script-src
 * @returns The CSP string
 */
export function generateCSP(nonce: string): string {
  const policy = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      'https://www.google.com/recaptcha/',
      'https://www.gstatic.com/recaptcha/',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
    ],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'img-src': ["'self'", 'data:', 'https://images.unsplash.com', 'https://source.unsplash.com', 'https://www.google-analytics.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'connect-src': [
      "'self'",
      'https://www.google-analytics.com',
      'https://vitals.vercel-insights.com',
    ],
    'frame-src': ['https://www.google.com/recaptcha/'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'self'"],
    'upgrade-insecure-requests': [],
  };

  // Convert the policy object to a string
  return Object.entries(policy)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key;
      }
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Apply Content Security Policy to a response
 * @param request - The Next.js request object
 * @param response - The Next.js response object
 * @returns The modified response
 */
export function applyCSP(request: NextRequest, response: NextResponse): NextResponse {
  // Skip CSP for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return response;
  }
  
  // Generate a nonce
  const nonce = generateNonce();
  
  // Generate the CSP
  const csp = generateCSP(nonce);
  
  // Set the CSP header
  response.headers.set('Content-Security-Policy', csp);
  
  // Store the nonce in a header for the client to use
  response.headers.set('X-Nonce', nonce);
  
  return response;
}
