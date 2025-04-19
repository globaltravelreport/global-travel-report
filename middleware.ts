import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only apply to /rewrite route
  if (request.nextUrl.pathname.startsWith('/rewrite')) {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return new NextResponse(null, {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Global Travel Report"',
        },
      })
    }

    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [username, password] = credentials.split(':')

    if (username === 'Admin' && password === 'Nuch07!') {
      const response = NextResponse.next()
      // Set a session cookie
      response.cookies.set('auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/rewrite'
      })
      return response
    }

    return new NextResponse(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Global Travel Report"',
      },
    })
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/rewrite/:path*'],
} 