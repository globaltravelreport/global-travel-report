import { NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';

const UNSPLASH_API_URL = 'https://api.unsplash.com';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    logger.error('Unsplash API key not configured');
    return NextResponse.json({ error: 'Unsplash API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query || '')}&per_page=30`,
      {
        headers: {
          'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error('Error fetching images from Unsplash:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

// Track downloads
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const downloadLocation = searchParams.get('downloadLocation');

  if (!downloadLocation) {
    return NextResponse.json({ error: 'Download location is required' }, { status: 400 });
  }

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    logger.error('Unsplash API key not configured');
    return NextResponse.json({ error: 'Unsplash API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(downloadLocation, {
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to track download: ${response.status} ${response.statusText}`);
    }

    logger.info('Successfully tracked Unsplash download');
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error tracking Unsplash download:', error);
    return NextResponse.json({ error: 'Failed to track download' }, { status: 500 });
  }
} 