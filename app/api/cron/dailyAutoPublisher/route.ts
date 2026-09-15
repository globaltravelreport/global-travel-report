import { NextRequest, NextResponse } from 'next/server';
import { SupabaseStoryStore } from '@/src/services/supabaseStoryStore';
import { isCronRequestAuthorized } from '@/utils/cronAuth';

// Force dynamic rendering for this route since it uses external APIs
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const PIPELINE_VERSION = '2026-09-15-enqueue-only-v1';

function healthResponse() {
  return NextResponse.json({
    ok: true,
    pipelineVersion: PIPELINE_VERSION,
    timestamp: new Date().toISOString()
  });
}

/**
 * Enqueue a story-generation job and return immediately.
 * Heavy work runs on /api/cron/storyQueueWorker so Hobby 60s crons do not kill mid-publish.
 */
async function enqueueDailyPublisherJob(triggeredBy: string) {
  if (!SupabaseStoryStore.isConfigured()) {
    throw new Error('Supabase is not configured for the story queue');
  }

  const existing = await SupabaseStoryStore.enqueueStoryGenerationJob({
    triggeredBy,
    requestedAt: new Date().toISOString()
  });

  return NextResponse.json({
    success: true,
    queued: true,
    processed: false,
    status: 'queued',
    jobId: existing?.id ?? null,
    message: 'Global Travel Report story generation job queued',
    workerPath: '/api/cron/storyQueueWorker',
    timestamp: new Date().toISOString()
  }, { status: 202 });
}

/**
 * Daily Auto Publisher Webhook API
 * POST /api/cron/dailyAutoPublisher
 *
 * Enqueues story generation for the queue worker. Does not run the pipeline inline.
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
 * Vercel cron: enqueue only and return 202 fast. Processing happens on
 * /api/cron/storyQueueWorker (Hobby-safe schedule in vercel.json).
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