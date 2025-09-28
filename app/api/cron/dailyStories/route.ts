import { NextRequest, NextResponse } from 'next/server';
import { NewStoryProcessorService } from '@/src/services/newStoryProcessorService';
import { cronJobSchema } from '@/src/utils/validation-schemas';
import { applyRateLimit } from '@/src/middleware/rate-limit';
import { trackSecurityEvent } from '@/src/utils/security-monitor';

// This needs to run in Node.js environment, not Edge
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const allowedIPs = [
  '127.0.0.1',
  '::1',
  // Add more trusted IPs here
];

function isIPAllowed(ip: string) {
  return allowedIPs.includes(ip);
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';

  try {
    // API key validation
    const apiKey = request.headers.get('x-api-key');
    const secretKey = process.env.CRON_SECRET_KEY;
    if (secretKey && apiKey !== secretKey) {
      trackSecurityEvent({ type: 'authorization', ip, userAgent, details: 'Invalid API key' });
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    // IP whitelisting
    if (!isIPAllowed(ip)) {
      trackSecurityEvent({ type: 'suspicious_request', ip, userAgent, details: 'IP not whitelisted' });
      return NextResponse.json({ success: false, message: 'IP not allowed' }, { status: 403 });
    }
    // Input validation
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const parseResult = cronJobSchema.safeParse({ ...query, apiKey });
    if (!parseResult.success) {
      trackSecurityEvent({ type: 'validation_failure', ip, userAgent, details: parseResult.error });
      return NextResponse.json({ success: false, message: 'Invalid parameters' }, { status: 400 });
    }
    // Processing lock
    const storyProcessor = NewStoryProcessorService.getInstance();
    if (storyProcessor.isCurrentlyProcessing()) {
      return NextResponse.json({
        success: false,
        message: 'Story processing is already running',
        lastProcessingTime: storyProcessor.getLastProcessingTime(),
        stats: storyProcessor.getProcessingStats()
      });
    }
    // Process stories
    const { count = 8, cruiseCount = 2 } = parseResult.data;
    const stories = await storyProcessor.processStories(count, cruiseCount);
    trackSecurityEvent({ type: 'monitoring', ip, userAgent, details: 'Cron job executed' });
    return NextResponse.json({
      success: true,
      message: `Processed ${stories.length} stories successfully`,
      stats: storyProcessor.getProcessingStats(),
      storyCount: stories.length
    });
  } catch (error) {
    trackSecurityEvent({ type: 'error', ip, userAgent, details: error });
    return NextResponse.json({
      success: false,
      message: 'Error processing daily stories',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}