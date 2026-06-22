import { NextRequest, NextResponse } from 'next/server';
import { GoogleAnalyticsService } from '@/src/services/GoogleAnalyticsService';
import { isAuthorizationResponse, requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * API route for fetching analytics data
 * @param request - The incoming request
 * @returns JSON response with analytics data
 */
export async function GET(request: NextRequest) {
  try {
    const authorization = await requireAdmin();
    if (isAuthorizationResponse(authorization)) return authorization;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || '7daysAgo';
    const endDate = searchParams.get('endDate') || 'today';
    
    // Create a new instance of the Google Analytics service
    const analyticsService = new GoogleAnalyticsService();
    
    // Get analytics data
    const data = await analyticsService.getAnalyticsData(startDate, endDate);
    
    // Return the data
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (_error) {
    console.error(_error);

    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching analytics data',
        error: _error instanceof Error ? _error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
