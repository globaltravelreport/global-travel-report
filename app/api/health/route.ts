import { NextResponse } from 'next/server';
import { SupabaseStoryStore } from '@/src/services/supabaseStoryStore';
import { getPublishingHealth } from '@/src/utils/publishingHealth';

export const dynamic = 'force-dynamic';

/**
 * Health check API endpoint
 * This endpoint returns basic health information about the application
 * It can be used by monitoring tools to check if the site is up
 */
export async function GET() {
  try {
    const pipelineRuns = SupabaseStoryStore.isConfigured()
      ? await SupabaseStoryStore.getLatestPipelineRuns(20)
      : [];

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      publishing: SupabaseStoryStore.isConfigured()
        ? getPublishingHealth(pipelineRuns)
        : { status: 'unavailable' }
    }, { status: 200 });
  } catch (_error) {
    console.error(_error);
    
    // Return error response
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
    }, { status: 500 });
  }
}
