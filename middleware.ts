import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { performanceHeadersMiddleware } from './middleware/performanceHeaders';

// Step 1: Add back only the performance headers middleware
export function middleware(request: NextRequest) {
  try {
    // Apply performance headers middleware (includes basic security headers)
    const response = performanceHeadersMiddleware(request);
    
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
