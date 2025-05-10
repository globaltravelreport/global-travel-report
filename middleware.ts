import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Simplified middleware to fix site loading issues
 * This is a temporary solution to get the site back up
 */
export function middleware(request: NextRequest) {
  // Create a basic response
  const response = NextResponse.next();

  // Add minimal security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add basic cache control for static assets
  const { pathname } = request.nextUrl;
  if (pathname.match(/\.(jpg|jpeg|png|webp|svg|ico|css|js|woff|woff2)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=86400'); // 1 day
  }

  // Admin area protection
  if (pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Global Travel Report Admin"',
        },
      });
    }

    // Basic auth validation
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'GlobalTravelReport2024';

    if (username !== validUsername || password !== validPassword) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Global Travel Report Admin"',
        },
      });
    }
  }

  return response;
}

// Configure the middleware to run on all routes except static assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
