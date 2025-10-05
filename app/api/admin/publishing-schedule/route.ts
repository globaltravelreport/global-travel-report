import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Mock data for demonstration
    const scheduledStories = [
      {
        id: '1',
        storyId: 'story-1',
        storyTitle: 'Hidden Gems of Paris',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        author: 'Sarah Johnson',
        status: 'pending',
      },
      {
        id: '2',
        storyId: 'story-2',
        storyTitle: 'Tokyo Street Food Guide',
        scheduledDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        author: 'Michael Chen',
        status: 'pending',
      },
      {
        id: '3',
        storyId: 'story-3',
        storyTitle: 'Hiking the Inca Trail',
        scheduledDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        author: 'Emma Rodriguez',
        status: 'published',
      },
    ];

    return NextResponse.json(scheduledStories);
  } catch (_error) {
    /* eslint-disable no-console */
    console.error(_error);
    return NextResponse.json(
      { error: 'Failed to fetch publishing schedule' },
      { status: 500 }
    );
  }
} 