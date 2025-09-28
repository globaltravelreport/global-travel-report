import { NextRequest, NextResponse } from 'next/server';

/**
 * Affiliate Click Tracking API
 * POST /api/analytics/affiliate-click
 *
 * Server-side endpoint for tracking affiliate link clicks
 * with enhanced analytics and persistence.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      provider,
      source,
      timestamp,
      userAgent,
      referrer,
      url
    } = body;

    // Validate required fields
    if (!productId || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, provider' },
        { status: 400 }
      );
    }

    // Enhanced tracking data
    const trackingData = {
      productId,
      provider,
      source: source || 'unknown',
      timestamp: timestamp || new Date().toISOString(),
      userAgent: userAgent || request.headers.get('user-agent') || '',
      referrer: referrer || request.headers.get('referer') || '',
      url: url || '',
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      sessionId: generateSessionId(request),
    };

    // In a production environment, you would:
    // 1. Store this data in a database (PostgreSQL, MongoDB, etc.)
    // 2. Send to analytics services (Google Analytics, Mixpanel, etc.)
    // 3. Trigger any necessary business logic

    console.log('Affiliate click tracked:', trackingData);

    // For now, we'll store in a simple JSON file or database
    await storeAffiliateClick(trackingData);

    // Send success response
    return NextResponse.json({
      success: true,
      message: 'Affiliate click tracked successfully',
      trackingId: generateTrackingId(trackingData),
    });

  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Generate a session ID from request headers
 */
function generateSessionId(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  // Simple hash-based session ID
  const sessionString = `${ip}-${userAgent}`.substring(0, 50);
  let hash = 0;
  for (let i = 0; i < sessionString.length; i++) {
    const char = sessionString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate a unique tracking ID
 */
function generateTrackingId(data: any): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `aff_${timestamp}_${random}`;
}

/**
 * Store affiliate click data
 * In production, this would use a proper database
 */
async function storeAffiliateClick(data: any): Promise<void> {
  try {
    // For now, we'll use a simple file-based approach
    // In production, use a proper database like PostgreSQL or MongoDB
    const fs = await import('fs/promises');
    const path = await import('path');

    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'affiliate-clicks.json');

    // Ensure data directory exists
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    // Read existing data
    let existingData = [];
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch {
      // File doesn't exist or is invalid, start with empty array
      existingData = [];
    }

    // Add new tracking data
    existingData.push({
      ...data,
      storedAt: new Date().toISOString(),
    });

    // Keep only last 1000 entries to prevent file from growing too large
    if (existingData.length > 1000) {
      existingData = existingData.slice(-1000);
    }

    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2));

    console.log('Affiliate click data stored successfully');
  } catch (error) {
    console.error('Failed to store affiliate click data:', error);
    // Don't throw error, just log it - tracking shouldn't break the user experience
  }
}

/**
 * GET endpoint to retrieve affiliate click statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');
    const limit = parseInt(searchParams.get('limit') || '100');

    // In production, this would query a database
    const fs = await import('fs/promises');
    const path = await import('path');

    const filePath = path.join(process.cwd(), 'data', 'affiliate-clicks.json');

    let clicks = [];
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      clicks = JSON.parse(fileContent);
    } catch {
      clicks = [];
    }

    // Filter by provider if specified
    if (provider) {
      clicks = clicks.filter((click: any) => click.provider === provider);
    }

    // Sort by timestamp (newest first)
    clicks.sort((a: any, b: any) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });

    // Apply limit
    clicks = clicks.slice(0, limit);

    // Generate statistics
    const stats = {
      totalClicks: clicks.length,
      clicksByProvider: clicks.reduce((acc: any, click: any) => {
        acc[click.provider] = (acc[click.provider] || 0) + 1;
        return acc;
      }, {}),
      clicksBySource: clicks.reduce((acc: any, click: any) => {
        acc[click.source] = (acc[click.source] || 0) + 1;
        return acc;
      }, {}),
      recentClicks: clicks.slice(0, 10),
    };

    return NextResponse.json({
      success: true,
      stats,
      clicks: clicks,
    });

  } catch (error) {
    console.error('Error retrieving affiliate click stats:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}