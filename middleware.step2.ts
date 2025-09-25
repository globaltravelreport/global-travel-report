import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { performanceHeadersMiddleware } from './middleware/performanceHeaders';
import { csrfMiddleware } from './src/middleware/csrf';

// Step 2: Add back performance headers and CSRF middleware
export async function middleware(request: NextRequest) {
  try {
    // Apply performance headers middleware (includes basic security headers)
    const response = performanceHeadersMiddleware(request);

    // Apply CSRF middleware for POST, PUT, DELETE requests
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
      const csrfResult = await csrfMiddleware(request);
      if (csrfResult) {
        return csrfResult;
      }
    }

    // Continue with the request
    return response;
  } catch (err) {
    console.error('Middleware error:', err);

    // Return a generic error response
    return NextResponse.next();
  }
}

// Configure the middleware to run on all routes except static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
