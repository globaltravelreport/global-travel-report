import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Mock data for demonstration
    const stats = {
      totalStories: 150,
      processedStories: 120,
      pendingStories: 20,
      failedStories: 10,
      averageProcessingTime: 2.5,
    };

    return NextResponse.json(stats);
  } catch (error) {
    /* eslint-disable no-console */
    console.error('Error fetching processing stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch processing stats' },
      { status: 500 }
    );
  }
} 