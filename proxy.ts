import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const response = NextResponse.next();

    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const sessionCookie = request.cookies.get('auth_session');
      if (!sessionCookie?.value) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      if (sessionCookie.value.length < 50) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }

    return response;
  } catch (error) {
    console.error('Proxy error:', error);
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
