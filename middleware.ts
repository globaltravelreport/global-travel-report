import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware function that just adds basic security headers
export async function middleware(request: NextRequest) {
  try {
    // Create a new response
    const response = NextResponse.next();

    // Add basic security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Add a simple Content-Security-Policy
    response.headers.set('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; connect-src 'self' https:;");

    // Return the response
    return response;
  } catch (err) {
    console.error('Middleware error:', err);

    // Return a basic response that allows the site to function
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
