import { NextRequest, NextResponse } from 'next/server';
import { GoogleAnalyticsService } from '@/src/lib/analytics';

export const dynamic = 'force-dynamic';

/**
 * API route for fetching analytics data
 * @param request - The incoming request
 * @returns JSON response with analytics data
 */
export async function GET(request: NextRequest) {
  try {
    // Check if the user is authenticated
    // This should be replaced with your actual authentication logic
    const authHeader = request.headers.get('authorization');
    if (!isValidAuthHeader(authHeader)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
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
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching analytics data',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Check if the authorization header is valid
 * @param authHeader - The authorization header
 * @returns True if the header is valid, false otherwise
 */
function isValidAuthHeader(authHeader: string | null): boolean {
  if (!authHeader) {
    return false;
  }
  
  // Check if the header starts with "Basic "
  if (!authHeader.startsWith('Basic ')) {
    return false;
  }
  
  // Get the base64-encoded credentials
  const base64Credentials = authHeader.split(' ')[1];
  
  // Decode the credentials
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  
  // Split the credentials into username and password
  const [username, password] = credentials.split(':');
  
  // Check if the username and password are valid
  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'GlobalTravelReport2024';
  
  return username === validUsername && password === validPassword;
}
