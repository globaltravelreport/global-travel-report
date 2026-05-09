import { NextRequest, NextResponse } from 'next/server';
import { runDailyAutomation } from '@/automation/dailyAutoPublisher.mjs';

// Force dynamic rendering for this route since it uses external APIs
export const dynamic = 'force-dynamic';

const PIPELINE_VERSION = '2026-05-09-request-budget-v2';

function healthResponse() {
  return NextResponse.json({
    ok: true,
    pipelineVersion: PIPELINE_VERSION,
    timestamp: new Date().toISOString()
  });
}

/**
 * Daily Auto Publisher Webhook API
 * POST /api/cron/dailyAutoPublisher
 *
 * This endpoint is called by Make.com webhooks to automatically:
 * 1. Fetch candidate stories from approved RSS feeds
 * 2. Rewrite accepted items with the configured AI provider
 * 3. Add Unsplash images and attribution
 * 4. Return drafts by default, or publish when AUTO_PUBLISH_STORIES=true
 *
 * Triggered by Make.com webhook daily at 10:00 AM AEST
 */
export async function POST(request: NextRequest) {
  try {
    if (request.nextUrl.searchParams.get('health') === '1') {
      return healthResponse();
    }

    // Verify webhook secret for security
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.WEBHOOK_SECRET_KEY;

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Starting Global Travel Report Auto-Publisher webhook...');

    // Run the daily automation
    const result = await runDailyAutomation();

    console.log('✅ Daily auto-publisher completed successfully');

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Global Travel Report Auto-Publisher completed successfully',
      result,
      timestamp: new Date().toISOString(),
      timezone: 'AEST (Australian Eastern Standard Time)'
    });

  } catch (_error) {
    console.error(_error);

    // Return error response
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
 * Daily Auto Publisher Cron Job API (Legacy)
 * GET /api/cron/dailyAutoPublisher
 *
 * This endpoint is called by Vercel cron jobs to automatically:
 * 1. Fetch candidate stories from approved RSS feeds
 * 2. Rewrite accepted items with the configured AI provider
 * 3. Add Unsplash images and attribution
 * 4. Return drafts by default, or publish when AUTO_PUBLISH_STORIES=true
 *
 * Runs daily at 10:00 AM AEST (00:00 UTC)
 */
export async function GET(request: NextRequest) {
  try {
    if (request.nextUrl.searchParams.get('health') === '1') {
      return healthResponse();
    }

    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET_KEY;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Starting Global Travel Report Auto-Publisher cron job...');

    // Run the daily automation
    const result = await runDailyAutomation();

    console.log('✅ Daily auto-publisher completed successfully');

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Global Travel Report Auto-Publisher completed successfully',
      result,
      timestamp: new Date().toISOString(),
      timezone: 'AEST (Australian Eastern Standard Time)'
    });

  } catch (_error) {
    console.error(_error);

    // Return error response
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
