/**
 * Enhanced Content Security Policy middleware
 *
 * This middleware implements a strong Content Security Policy to prevent XSS attacks
 * and ensure all resources are loaded over HTTPS.
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
 * Generate a comprehensive Content Security Policy
 * @param nonce - The nonce to use for script-src
 * @returns The CSP string
 */
export function generateCSP(nonce: string): string {
  const policy = {
    // Default policy for all content types
    'default-src': ["'self'"],

    // Script execution policy
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      // External services
      'https://www.google.com/recaptcha/',
      'https://www.gstatic.com/recaptcha/',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://connect.facebook.net',
      'https://pagead2.googlesyndication.com',
    ],

    // Styles policy - temporarily allow unsafe-inline for styled-components compatibility
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Temporarily allow inline styles for styled-components
      'https://fonts.googleapis.com',
      'https://www.gstatic.com'
    ],

    // Images policy - restrict to specific domains
    'img-src': [
      "'self'",
      'data:',
      'https:',  // Allow HTTPS images from any domain
      'blob:',   // Allow blob URLs for image processing
    ],

    // Fonts policy
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com'
    ],

    // API connections policy
    'connect-src': [
      "'self'",
      'https://www.google-analytics.com',
      'https://stats.g.doubleclick.net',
      'https://vitals.vercel-insights.com',
      'https://www.facebook.com',
    ],

    // Frames policy
    'frame-src': [
      'https://www.google.com/recaptcha/',
      'https://www.youtube.com',
      'https://www.facebook.com',
    ],

    // Prevent object embedding (Flash, Java applets, etc.)
    'object-src': ["'none'"],

    // Restrict base URI to same origin
    'base-uri': ["'self'"],

    // Restrict form submissions to same origin
    'form-action': ["'self'"],

    // Prevent site from being embedded in iframes on other sites
    'frame-ancestors': ["'self'"],

    // Media policy
    'media-src': ["'self'"],

    // Worker scripts policy
    'worker-src': ["'self'", 'blob:'],

    // Manifest policy
    'manifest-src': ["'self'"],

    // Force HTTPS for all requests
    'upgrade-insecure-requests': [],

    // Block mixed content
    'block-all-mixed-content': [],

    // Report violations to an endpoint (if configured)
    ...(process.env.CSP_REPORT_URI ? {
      'report-uri': [process.env.CSP_REPORT_URI],
      'report-to': ['csp-endpoint']
    } : {}),
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
 * Generate a Report-To header for CSP violation reporting
 * @returns The Report-To header value
 */
function generateReportToHeader(): string | null {
  if (!process.env.CSP_REPORT_URI) {
    return null;
  }

  return JSON.stringify({
    'group': 'csp-endpoint',
    'max_age': 10886400,
    'endpoints': [
      { 'url': process.env.CSP_REPORT_URI }
    ]
  });
}

/**
 * Apply enhanced Content Security Policy to a response
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

  // Add reporting configuration if enabled
  const reportToHeader = generateReportToHeader();
  if (reportToHeader) {
    response.headers.set('Report-To', reportToHeader);
  }

  // Store the nonce in a header for the client to use
  response.headers.set('X-Nonce', nonce);

  return response;
}
