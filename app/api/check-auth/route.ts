import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const authCookie = cookieStore.get('auth')

  if (!authCookie || authCookie.value !== 'true') {
    return new NextResponse(null, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Check credentials
    if (username === 'Admin' && password === 'Nuch07!') {
      const response = NextResponse.json({ authenticated: true })
      response.cookies.set('auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      })
      return response
    }

    return new NextResponse(null, { status: 401 })
  } catch (error) {
    console.error('Authentication error:', error)
    return new NextResponse(null, { status: 500 })
  }
} 