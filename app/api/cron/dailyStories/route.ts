import { NextResponse } from 'next/server';

// Use Edge runtime for compatibility with Vercel
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Daily story processing is temporarily disabled',
    info: 'This feature will be enabled in a future update'
  });
}