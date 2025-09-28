import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { securityHeadersMiddleware } from '@/src/middleware/security-headers';
import { errorMonitorMiddleware } from './src/middleware/error-monitor';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Compose error monitoring for all requests
  return errorMonitorMiddleware(request, async () => {
    // Global security headers
    const securityResponse = securityHeadersMiddleware(request);

    // Protect admin routes (except login)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      try {
        const session = await getSession();
        if (!session) {
          return NextResponse.redirect(new URL('/admin/login', request.url));
        }
      } catch (error) {
        console.error('Middleware auth error:', error);
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }

    // Attach security headers to the response
    return securityResponse;
  });
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/(.*)',
  ],
};
