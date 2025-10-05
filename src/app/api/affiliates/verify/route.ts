import { NextRequest, NextResponse } from 'next/server';
import { AFFILIATE_CACHE_KEY, CACHE_DURATION } from '@/src/data/affiliatePartners';

// In-memory cache for verification results
const verificationCache = new Map<string, { status: boolean; timestamp: number }>();

interface VerificationResult {
  [key: string]: {
    isValid: boolean;
    responseTime: number;
    error?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urls = searchParams.get('urls')?.split(',') || [];

    if (urls.length === 0) {
      return NextResponse.json(
        { error: 'No URLs provided for verification' },
        { status: 400 }
      );
    }

    const results: VerificationResult = {};
    const verificationPromises = urls.map(async (url) => {
      const startTime = Date.now();

      try {
        // Check cache first
        const cacheKey = `${AFFILIATE_CACHE_KEY}_${url}`;
        const cached = verificationCache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
          results[url] = {
            isValid: cached.status,
            responseTime: Date.now() - startTime
          };
          return;
        }

        // Set a shorter timeout for better UX
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const response = await fetch(url, {
          method: 'HEAD', // Use HEAD to minimize data transfer
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            'User-Agent': 'GlobalTravelReport-AffiliateChecker/1.0'
          }
        });

        clearTimeout(timeoutId);

        const isValid = response.status === 200;
        const responseTime = Date.now() - startTime;

        // Cache the result
        verificationCache.set(cacheKey, {
          status: isValid,
          timestamp: Date.now()
        });

        results[url] = {
          isValid,
          responseTime
        };

      } catch (__error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = __error instanceof Error ? __error.message : 'Unknown error';

        results[url] = {
          isValid: false,
          responseTime,
          error: errorMessage
        };

        // Cache failed results for a shorter duration to retry sooner
        const cacheKey = `${AFFILIATE_CACHE_KEY}_${url}`;
        verificationCache.set(cacheKey, {
          status: false,
          timestamp: Date.now()
        });
      }
    });

    await Promise.allSettled(verificationPromises);

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
      cacheInfo: {
        totalCached: verificationCache.size,
        cacheDuration: CACHE_DURATION
      }
    });

  } catch (_error) {
    console.error(_error);
    return NextResponse.json(
      {
        error: 'Internal server error during verification',
        message: _error instanceof Error ? _error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST endpoint to clear cache if needed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'clear_cache') {
      verificationCache.clear();
      return NextResponse.json({
        success: true,
        message: 'Verification cache cleared',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (_error) {
    console.error(_error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}