import { NextResponse, type NextRequest } from 'next/server';
import { isAuthorizationResponse, requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authorization = await requireAdmin();
    if (isAuthorizationResponse(authorization)) return authorization;

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
  } catch (_error) {
    /* eslint-disable no-console */
    console.error(_error);
    return NextResponse.json(
      { error: 'Failed to fetch validation logs' },
      { status: 500 }
    );
  }
}
