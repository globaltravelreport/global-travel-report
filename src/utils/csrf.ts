/**
 * CSRF protection utilities
 */

import { randomBytes, createHash } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Constants
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a new CSRF token
 * @returns A new CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hash a CSRF token for storage in a cookie
 * @param token - The token to hash
 * @returns The hashed token
 */
export function hashCsrfToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Set a CSRF token cookie
 * @param token - The token to set
 */
export function setCsrfCookie(token: string): void {
  const hashedToken = hashCsrfToken(token);
  const cookieStore = cookies();

  cookieStore.set({
    name: CSRF_COOKIE_NAME,
    value: hashedToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: CSRF_TOKEN_EXPIRY / 1000, // Convert to seconds
  });
}

/**
 * Get the CSRF token from the cookie
 * @returns The CSRF token from the cookie, or null if not found
 */
export function getCsrfCookie(): string | null {
  const cookieStore = cookies();
  const csrfCookie = cookieStore.get(CSRF_COOKIE_NAME);

  return csrfCookie?.value || null;
}

/**
 * Validate a CSRF token against the stored cookie
 * @param tokenOrRequest - The CSRF token or Next.js request object
 * @returns Boolean indicating if the token is valid
 */
export function validateCsrfToken(tokenOrRequest: string | NextRequest): boolean {
  let csrfToken: string | null;

  if (typeof tokenOrRequest === 'string') {
    csrfToken = tokenOrRequest;
  } else {
    // Get the token from the request header
    csrfToken = tokenOrRequest.headers.get(CSRF_HEADER_NAME);
  }

  if (!csrfToken) {
    return false;
  }

  // Get the hashed token from the cookie
  const hashedTokenFromCookie = getCsrfCookie();

  if (!hashedTokenFromCookie) {
    return false;
  }

  // Hash the token from the request and compare with the cookie
  const hashedRequestToken = hashCsrfToken(csrfToken);

  return hashedRequestToken === hashedTokenFromCookie;
}

/**
 * Create a new CSRF token and set it in a cookie
 * @returns The new CSRF token
 */
export function createCsrfToken(): string {
  const token = generateCsrfToken();
  setCsrfCookie(token);
  return token;
}

/**
 * Get the current CSRF token or create a new one
 * @returns The CSRF token
 */
export function getCsrfToken(): string {
  const existingToken = getCsrfCookie();

  if (existingToken) {
    return existingToken;
  }

  return createCsrfToken();
}
