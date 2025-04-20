import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Hardcoded credentials for testing
const VALID_USERNAME = 'admin'
const VALID_PASSWORD = 'Nuch07!'

export function middleware(request: NextRequest) {
  // Only apply to /nuch route
  if (request.nextUrl.pathname.startsWith('/nuch')) {
    const authHeader = request.headers.get('authorization')
    const authCookie = request.cookies.get('auth')

    // If we have a valid auth cookie, allow the request
    if (authCookie?.value === 'true') {
      return NextResponse.next()
    }

    // If we have auth header, validate it
    if (authHeader) {
      const base64Credentials = authHeader.split(' ')[1]
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
      const [username, password] = credentials.split(':')

      if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        const response = NextResponse.next()
        // Set a session cookie
        response.cookies.set('auth', 'true', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/'
        })
        return response
      }
    }

    // Return 401 with WWW-Authenticate header to trigger browser's login prompt
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
        'Content-Type': 'text/plain'
      }
    })
  }

  return NextResponse.next()
}

// Configure middleware matcher
export const config = {
  matcher: ['/nuch', '/nuch/:path*']
} 