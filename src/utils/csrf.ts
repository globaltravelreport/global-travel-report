/**
 * CSRF protection utilities
 * Using Web Crypto API for Edge Runtime compatibility
 */

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Constants
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a new CSRF token using Web Crypto API
 * @returns A new CSRF token
 */
export function generateCsrfToken(): string {
  // Use crypto.getRandomValues for Edge compatibility
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash a CSRF token for storage in a cookie using Web Crypto API
 * @param token - The token to hash
 * @returns The hashed token
 */
export async function hashCsrfToken(token: string): Promise<string> {
  // Convert the token string to an array buffer
  const encoder = new TextEncoder();
  const data = encoder.encode(token);

  // Hash the data using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert the hash to a hex string
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Set a CSRF token cookie
 * @param token - The token to set
 */
export async function setCsrfCookie(token: string): Promise<void> {
  const hashedToken = await hashCsrfToken(token);
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
 * @returns Promise resolving to a boolean indicating if the token is valid
 */
export async function validateCsrfToken(tokenOrRequest: string | NextRequest): Promise<boolean> {
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
  const hashedRequestToken = await hashCsrfToken(csrfToken);

  return hashedRequestToken === hashedTokenFromCookie;
}

/**
 * Create a new CSRF token and set it in a cookie
 * @returns Promise resolving to the new CSRF token
 */
export async function createCsrfToken(): Promise<string> {
  const token = generateCsrfToken();
  await setCsrfCookie(token);
  return token;
}

/**
 * Get the current CSRF token or create a new one
 * @returns Promise resolving to the CSRF token
 */
export async function getCsrfToken(): Promise<string> {
  const existingToken = getCsrfCookie();

  if (existingToken) {
    return existingToken;
  }

  return await createCsrfToken();
}
