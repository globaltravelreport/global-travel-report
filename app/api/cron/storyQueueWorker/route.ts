import { NextRequest, NextResponse } from 'next/server';
import { runDailyAutomation } from '@/automation/dailyAutoPublisher.mjs';
import { SupabaseStoryStore } from '@/src/services/supabaseStoryStore';
import { isCronRequestAuthorized } from '@/utils/cronAuth';

export const dynamic = 'force-dynamic';

const WORKER_VERSION = '2026-05-09-supabase-story-queue-v1';

function isAuthorized(request: NextRequest): boolean {
  return isCronRequestAuthorized(request);
}

export async function GET(request: NextRequest) {
  try {
    if (request.nextUrl.searchParams.get('health') === '1') {
      const jobs = SupabaseStoryStore.isConfigured()
        ? await SupabaseStoryStore.getLatestStoryGenerationJobs(5)
        : [];

      return NextResponse.json({
        ok: true,
        workerVersion: WORKER_VERSION,
        recentJobs: jobs.map((job) => ({
          id: job.id,
          status: job.status,
          attempts: job.attempts,
          createdAt: job.created_at,
          finishedAt: job.finished_at,
          lastError: job.last_error
        })),
        timestamp: new Date().toISOString()
      });
    }

    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!SupabaseStoryStore.isConfigured()) {
      return NextResponse.json(
        { error: 'Supabase is not configured for the story queue' },
        { status: 500 }
      );
    }

    const workerId = `vercel-${Date.now()}`;
    const job = await SupabaseStoryStore.claimStoryGenerationJob(workerId);

    if (!job) {
      return NextResponse.json({
        success: true,
        workerVersion: WORKER_VERSION,
        message: 'No queued story generation jobs',
        processed: false,
        timestamp: new Date().toISOString()
      });
    }

    try {
      const result = await runDailyAutomation();
      await SupabaseStoryStore.completeStoryGenerationJob(job.id, result);

      return NextResponse.json({
        success: true,
        workerVersion: WORKER_VERSION,
        processed: true,
        jobId: job.id,
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      await SupabaseStoryStore.failStoryGenerationJob(job, error);
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Story queue worker failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
