import { NextRequest, NextResponse } from 'next/server';
import { runDailyAutomation } from '@/automation/dailyAutoPublisher.mjs';

// Force dynamic rendering for this route since it uses external APIs
export const dynamic = 'force-dynamic';

/**
 * Make.com Webhook for Daily Automation
 * POST /api/webhooks/daily-automation
 *
 * This endpoint receives webhooks from Make.com to trigger the daily automation:
 * 1. Fetch stories from RSS feed
 * 2. Rewrite content using Gemini AI in Australian English
 * 3. Add Unsplash images
 * 4. Classify categories
 * 5. Publish to website
 * 6. Update RSS feed
 *
 * Expected payload from Make.com:
 * {
 *   "trigger": "daily_automation",
 *   "timestamp": "2025-01-10T00:00:00Z"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret for security
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.MAKE_WEBHOOK_SECRET;

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      console.log('❌ Webhook authentication failed');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the webhook payload
    const payload = await request.json();
    console.log('📨 Received Make.com webhook:', payload);

    // Validate payload structure
    if (!payload.trigger || payload.trigger !== 'daily_automation') {
      console.log('❌ Invalid webhook payload - missing or incorrect trigger');
      return NextResponse.json(
        { error: 'Invalid payload - expected trigger: daily_automation' },
        { status: 400 }
      );
    }

    console.log('🚀 Starting Global Travel Report Auto-Publisher via Make.com webhook...');

    // Run the daily automation
    await runDailyAutomation();

    console.log('✅ Daily auto-publisher completed successfully via webhook');

    // Return success response for Make.com
    return NextResponse.json({
      success: true,
      message: 'Global Travel Report Auto-Publisher completed successfully',
      timestamp: new Date().toISOString(),
      timezone: 'AEST (Australian Eastern Standard Time)',
      triggered_by: 'make_webhook'
    });

  } catch (_error) {
    console.error(_error);

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