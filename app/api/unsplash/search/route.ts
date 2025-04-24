import { NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';

// Fallback images while API approval is pending
const FALLBACK_IMAGES = [
  {
    id: 'fallback-1',
    urls: {
      raw: '/images/fallback/travel-1.jpg',
      full: '/images/fallback/travel-1.jpg',
      regular: '/images/fallback/travel-1.jpg',
      small: '/images/fallback/travel-1-small.jpg',
      thumb: '/images/fallback/travel-1-thumb.jpg',
    },
    alt_description: 'Scenic travel destination',
    user: {
      name: 'Global Travel Report',
      links: { html: 'https://globaltravelreport.com' }
    }
  },
  // Add more fallback images as needed
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    logger.warn('Unsplash API key not configured, using fallback images');
    return NextResponse.json({
      total: FALLBACK_IMAGES.length,
      total_pages: 1,
      results: FALLBACK_IMAGES,
      message: 'Using fallback images while Unsplash API integration is pending approval.'
    });
  }

  try {
    // Once approved, implement actual Unsplash API call here
    logger.info('Unsplash API integration pending, using fallback images', { query });
    return NextResponse.json({
      total: FALLBACK_IMAGES.length,
      total_pages: 1,
      results: FALLBACK_IMAGES,
      message: 'Unsplash API integration is pending approval. Using fallback images.'
    });
  } catch (error) {
    logger.error('Error fetching images from Unsplash', error);
    return NextResponse.json({
      total: FALLBACK_IMAGES.length,
      total_pages: 1,
      results: FALLBACK_IMAGES,
      error: 'Failed to fetch images from Unsplash API'
    }, { status: 500 });
  }
}

// Track downloads (will be enabled after approval)
export async function POST(request: Request) {
  const body = await request.json();
  logger.info('Download tracking request received', { downloadId: body.downloadId });
  
  return NextResponse.json({ 
    success: true,
    message: 'Download tracking will be enabled after Unsplash API approval'
  });
} 