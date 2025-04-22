import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const authCookie = cookieStore.get('nuch-auth')

  if (!authCookie || authCookie.value !== 'true') {
    return new NextResponse(null, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Check credentials
    if ((username === 'Admin' || username === 'admin') && password === 'Nuch07!') {
      const response = NextResponse.json({ authenticated: true })
      
      // Get the host from the request headers
      const host = request.headers.get('host') || ''
      const isProduction = process.env.NODE_ENV === 'production'
      
      // Set the domain for production only
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 86400, // 24 hours
        // Only set domain in production and if it's not localhost
        ...(isProduction && !host.includes('localhost') && {
          domain: '.globaltravelreport.com'
        })
      }
      
      response.cookies.set('nuch-auth', 'true', cookieOptions)
      return response
    }

    return new NextResponse(null, { status: 401 })
  } catch (error) {
    console.error('Authentication error:', error)
    return new NextResponse(null, { status: 500 })
  }
} 