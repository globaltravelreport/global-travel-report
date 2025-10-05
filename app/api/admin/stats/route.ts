import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { statsQuerySchema } from '@/src/utils/validation-schemas';
import { applyRateLimit } from '@/src/middleware/rate-limit';
import { trackSecurityEvent } from '@/src/utils/security-monitor';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

let cachedStats: any = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';

  try {
    // Auth validation
    const session = await getSession();
    if (!session) {
      trackSecurityEvent({
        type: 'authorization',
        ip,
        userAgent,
        details: 'Unauthorized stats access',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Input validation
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const parseResult = statsQuerySchema.safeParse(query);
    if (!parseResult.success) {
      trackSecurityEvent({
        type: 'validation_failure',
        ip,
        userAgent,
        details: parseResult.error,
      });
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }
    // Caching
    const now = Date.now();
    if (cachedStats && now - cacheTime < CACHE_DURATION) {
      return NextResponse.json({ ...cachedStats, cached: true });
    }
    // Mock data for demonstration
    const stats = {
      totalStories: 150,
      processedStories: 120,
      pendingStories: 20,
      failedStories: 10,
      averageProcessingTime: 2.5,
    };
    cachedStats = stats;
    cacheTime = now;
    trackSecurityEvent({ type: 'monitoring', ip, userAgent, details: 'Stats accessed' });
    return NextResponse.json(stats);
  } catch (_error) {
    trackSecurityEvent({ type: 'error', ip, userAgent, details: error });
    return NextResponse.json({ error: 'Failed to fetch processing stats' }, { status: 500 });
  }
}