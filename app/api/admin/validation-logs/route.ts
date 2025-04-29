import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Mock data for demonstration
    const validationLogs = [
      {
        id: '1',
        storyId: 'story-1',
        storyTitle: 'Hidden Gems of Paris',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'success',
        message: 'Story validation passed all checks',
      },
      {
        id: '2',
        storyId: 'story-2',
        storyTitle: 'Tokyo Street Food Guide',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: 'error',
        message: 'Missing required images in content',
      },
      {
        id: '3',
        storyId: 'story-3',
        storyTitle: 'Hiking the Inca Trail',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: 'success',
        message: 'Story validation passed all checks',
      },
    ];

    return NextResponse.json(validationLogs);
  } catch (error) {
    /* eslint-disable no-console */
    console.error('Error fetching validation logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch validation logs' },
      { status: 500 }
    );
  }
} 