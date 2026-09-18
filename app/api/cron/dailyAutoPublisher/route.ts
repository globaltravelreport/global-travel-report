import { NextRequest, NextResponse } from 'next/server';
import { SupabaseStoryStore } from '@/src/services/supabaseStoryStore';
import { processStoryGenerationJob } from '@/src/services/storyGenerationWorker';
import { isCronRequestAuthorized } from '@/utils/cronAuth';

// Force dynamic rendering for this route since it uses external APIs
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const PIPELINE_VERSION = '2026-09-18-fallback-publish-v2';

function healthResponse() {
  return NextResponse.json({
    ok: true,
    pipelineVersion: PIPELINE_VERSION,
    timestamp: new Date().toISOString()
  });
}

/**
 * Hybrid: enqueue a story-generation job, claim it, and process inline when possible.
 * Returns 200 when processed; 202 when only queued (claim failed — worker cron is backup).
 */
async function enqueueDailyPublisherJob(triggeredBy: string) {
  if (!SupabaseStoryStore.isConfigured()) {
    throw new Error('Supabase is not configured for the story queue');
  }

  const workerId = `${triggeredBy}-${Date.now()}`;
  let job = await SupabaseStoryStore.claimStoryGenerationJob(workerId);

  if (!job) {
    await SupabaseStoryStore.enqueueStoryGenerationJob({
      triggeredBy,
      requestedAt: new Date().toISOString()
    });

    job = await SupabaseStoryStore.claimStoryGenerationJob(workerId);
  }

  if (!job) {
    return NextResponse.json({
      success: true,
      queued: true,
      processed: false,
      status: 'queued',
      message: 'Global Travel Report story generation job queued',
      workerPath: '/api/cron/storyQueueWorker',
      timestamp: new Date().toISOString()
    }, { status: 202 });
  }

  try {
    const result = await processStoryGenerationJob(job);

    return NextResponse.json({
      success: true,
      queued: true,
      processed: true,
      jobId: job.id,
      status: 'completed',
      result,
      message: 'Global Travel Report story generation job completed',
      workerPath: '/api/cron/storyQueueWorker',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    await SupabaseStoryStore.failStoryGenerationJob(job, error);
    throw error;
  }
}

/**
 * Daily Auto Publisher Webhook API
 * POST /api/cron/dailyAutoPublisher
 *
 * Enqueues, claims, and processes when possible. Falls back to 202 + worker cron.
 *
 * Triggered by Make.com webhook daily at 10:00 AM AEST
 */
export async function POST(request: NextRequest) {
  try {
    if (request.nextUrl.searchParams.get('health') === '1') {
      return healthResponse();
    }

    // Fail closed: require cron/webhook auth even if WEBHOOK_SECRET_KEY is unset.
    const webhookSecret = process.env.WEBHOOK_SECRET_KEY;

    if (!isCronRequestAuthorized(request, webhookSecret)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return enqueueDailyPublisherJob('webhook');

  } catch (_error) {
    console.error(_error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: _error instanceof Error ? _error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Daily Auto Publisher Cron Job API
 * GET /api/cron/dailyAutoPublisher
 *
 * Vercel cron hybrid: enqueue + claim + processStoryGenerationJob when claim succeeds.
 * If claim fails, return 202; storyQueueWorker (01:00 UTC) remains backup.
 *
 * Runs daily at 00:00 UTC
 */
export async function GET(request: NextRequest) {
  try {
    if (request.nextUrl.searchParams.get('health') === '1') {
      return healthResponse();
    }

    if (!isCronRequestAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return enqueueDailyPublisherJob('vercel_cron');

  } catch (_error) {
    console.error(_error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: _error instanceof Error ? _error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
