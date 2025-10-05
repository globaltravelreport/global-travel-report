import { NextRequest, NextResponse } from 'next/server';
import { ContentAutomationService } from '@/src/services/contentAutomationService';

// Force dynamic rendering for this route since it uses request headers
export const dynamic = 'force-dynamic';

/**
 * Daily Stories Cron Job API
 * GET /api/cron/dailyStories
 *
 * This endpoint is called by Vercel cron jobs to automatically ingest
 * new travel content every day at 4 AM UTC.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET_KEY;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting daily content ingestion via cron job...');

    const automationService = ContentAutomationService.getInstance();

    // Configure for daily ingestion
    automationService.configure({
      enableAutoIngestion: true,
      maxStoriesPerDay: 5,
      qualityThreshold: 0.7,
      requireManualApproval: false,
      autoRefreshSchedule: '0 4 * * *' // 4 AM UTC daily
    });

    // Ingest content from RSS feeds
    const result = await automationService.ingestContent();

    console.log('Daily content ingestion completed:', {
      success: result.success,
      storiesIngested: result.storiesIngested,
      storiesRejected: result.storiesRejected,
      storiesDuplicates: result.storiesDuplicates,
      errors: result.errors.length
    });

    // Return success response with ingestion stats
    return NextResponse.json({
      success: result.success,
      message: 'Daily content ingestion completed',
      stats: {
        storiesIngested: result.storiesIngested,
        storiesRejected: result.storiesRejected,
        storiesDuplicates: result.storiesDuplicates,
        errors: result.errors.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (_error) {
    console.error('Error in daily stories cron job:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}