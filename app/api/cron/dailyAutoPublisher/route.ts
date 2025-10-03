import { NextRequest, NextResponse } from 'next/server';
import { runDailyAutomation } from '@/automation/dailyAutoPublisher.mjs';

// Force dynamic rendering for this route since it uses external APIs
export const dynamic = 'force-dynamic';

/**
 * Daily Auto Publisher Cron Job API
 * GET /api/cron/dailyAutoPublisher
 *
 * This endpoint is called by Vercel cron jobs to automatically:
 * 1. Fetch stories from RSS feed
 * 2. Rewrite content using Gemini AI in Australian English
 * 3. Add Unsplash images
 * 4. Classify categories
 * 5. Publish to website and social media
 * 6. Update RSS feed
 *
 * Runs daily at 10:00 AM AEST (00:00 UTC)
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

    console.log('🚀 Starting Global Travel Report Auto-Publisher cron job...');

    // Run the daily automation
    await runDailyAutomation();

    console.log('✅ Daily auto-publisher completed successfully');

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Global Travel Report Auto-Publisher completed successfully',
      timestamp: new Date().toISOString(),
      timezone: 'AEST (Australian Eastern Standard Time)'
    });

  } catch (error) {
    console.error('💥 Error in daily auto-publisher cron job:', error);

    // Return error response
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}