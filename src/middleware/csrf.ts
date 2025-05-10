/**
 * CSRF protection middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCsrfToken } from '@/src/utils/csrf';

/**
 * Paths that require CSRF protection
 */
const PROTECTED_PATHS = [
  '/api/contact',
  '/api/newsletter',
  '/api/admin',
];

/**
 * Check if a path requires CSRF protection
 * @param path - The path to check
 * @returns Boolean indicating if the path requires CSRF protection
 */
function isProtectedPath(path: string): boolean {
  return PROTECTED_PATHS.some(protectedPath => path.startsWith(protectedPath));
}

/**
 * CSRF protection middleware
 * @param request - The Next.js request object
 * @returns Promise resolving to the Next.js response object or undefined
 */
export async function csrfMiddleware(request: NextRequest): Promise<NextResponse | undefined> {
  // Only check POST, PUT, DELETE requests
  if (
    request.method !== 'POST' &&
    request.method !== 'PUT' &&
    request.method !== 'DELETE'
  ) {
    return;
  }

  // Check if the path requires CSRF protection
  const path = request.nextUrl.pathname;

  if (!isProtectedPath(path)) {
    return;
  }

  // Validate the CSRF token
  const isValidCsrfToken = await validateCsrfToken(request);

  if (!isValidCsrfToken) {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid CSRF token. Please refresh the page and try again.'
      },
      { status: 403 }
    );
  }

  // Token is valid, continue with the request
  return;
}
