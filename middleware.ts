import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    // Simple security headers
    const response = NextResponse.next();

    // Add basic security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Protect admin routes (except login) - validate session
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const sessionCookie = request.cookies.get('auth_session');
      if (!sessionCookie?.value) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Basic validation - check if cookie looks like encrypted data
      // In production, this should validate the session properly
      if (sessionCookie.value.length < 50) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // Return a basic response if middleware fails
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
