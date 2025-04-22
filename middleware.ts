import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // requests
const RATE_LIMIT_WINDOW = 10 // seconds

// Define protected route paths as a type
type ProtectedRoute = '/nuch' | '/rodney' | '/api/rewrite'

// Valid credentials for protected routes
const CREDENTIALS: Record<ProtectedRoute, { username: string; password: string }> = {
  '/nuch': {
    username: 'admin',
    password: 'Nuch07!'
  },
  '/rodney': {
    username: 'rodneyp',
    password: 'Rodney07!'
  },
  '/api/rewrite': {
    username: 'admin',
    password: 'Nuch07!'
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const rateLimit = rateLimitMap.get(ip)

  if (!rateLimit) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW * 1000 })
    return false
  }

  if (now > rateLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW * 1000 })
    return false
  }

  if (rateLimit.count >= RATE_LIMIT) {
    return true
  }

  rateLimit.count++
  return false
}

// Middleware config
export const config = {
  matcher: ['/nuch', '/rodney', '/api/rewrite']
}

// Middleware function
export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  // Get IP address
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
  
  // Check rate limit
  if (isRateLimited(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  // Check if path requires authentication
  if (pathname in CREDENTIALS && (pathname === '/nuch' || pathname === '/rodney')) {
    const authHeader = req.headers.get('authorization')

    if (!authHeader) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Global Travel Report"',
        },
      })
    }

    try {
      const base64 = authHeader.split(' ')[1]
      const [user, pass] = atob(base64).split(':')
      const validCreds = CREDENTIALS[pathname as ProtectedRoute]

      if (user !== validCreds.username || pass !== validCreds.password) {
        return new NextResponse('Unauthorized', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Global Travel Report"',
          },
        })
      }
    } catch (e) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Global Travel Report"',
        },
      })
    }
  }

  // Continue with the request
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}
