import { NextResponse } from 'next/server';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function GET(request: Request) {
  return NextResponse.json({
    total: 0,
    total_pages: 0,
    results: [],
    message: 'Unsplash API integration is pending approval. Please check back later.'
  });
}

// Track downloads (will be enabled after approval)
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const downloadLocation = searchParams.get('downloadLocation');

  // For now, just acknowledge the download tracking request
  return NextResponse.json({ 
    success: true,
    message: 'Download tracking will be enabled after Unsplash API approval'
  });
} 