import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ✅ Middleware config with experimental-edge runtime
export const config = {
  matcher: ['/nuch', '/nuch/:path*'],
  runtime: 'experimental-edge'
}

// ✅ Hardcoded credentials as specified
const VALID_USERNAME = 'Admin'
const VALID_PASSWORD = 'Nuch07!'

// ✅ Constant-time comparison function to prevent timing attacks
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// ✅ Auth header decoder and validator
function checkBasicAuth(authHeader: string | null): boolean {
  if (!authHeader) return false

  try {
    const base64Credentials = authHeader.split(' ')[1]
    const credentials = atob(base64Credentials) // Edge-compatible alternative to Buffer
    const [username, password] = credentials.includes(':') ? credentials.split(':') : ['', '']

    return safeCompare(username, VALID_USERNAME) && safeCompare(password, VALID_PASSWORD)
  } catch {
    return false
  }
}

// ✅ Edge Middleware function
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/nuch')) {
    const authHeader = request.headers.get('authorization')

    if (checkBasicAuth(authHeader)) {
      const response = NextResponse.next()

      // Add strict security headers
      response.headers.set('Cache-Control', 'no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
      response.headers.set('Content-Security-Policy', "default-src 'self'")

      return response
    }

    // Return a 401 prompt if credentials are missing or incorrect
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area", charset="UTF-8"',
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff'
      }
    })
  }

  return NextResponse.next()
}
