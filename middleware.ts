import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a simplified middleware to test if the site loads
export function middleware(request: NextRequest) {
  // Just pass through all requests
  return NextResponse.next();
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
