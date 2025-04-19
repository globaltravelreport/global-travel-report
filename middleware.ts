import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Hardcoded credentials for testing
const VALID_USERNAME = 'admin'
const VALID_PASSWORD = 'Nuch07!'

export function middleware(request: NextRequest) {
  const rewritePath = '/rewrite'
  
  // Only protect the rewrite route
  if (request.nextUrl.pathname.startsWith(rewritePath)) {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      console.log('No auth header present')
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      })
    }

    const auth = authHeader.split(' ')[1]
    if (!auth) {
      console.log('Invalid auth header format')
      return new NextResponse('Invalid authentication', { status: 401 })
    }

    const [username, password] = Buffer.from(auth, 'base64').toString().split(':')
    console.log('Auth attempt:', { username, password })

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      console.log('Authentication successful')
      return NextResponse.next()
    }

    console.log('Invalid credentials')
    return new NextResponse('Invalid credentials', { status: 401 })
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: '/rewrite/:path*',
} 