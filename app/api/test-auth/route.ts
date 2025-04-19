import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    username: process.env.REWRITE_USERNAME,
    password: process.env.REWRITE_PASSWORD,
  })
} 