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