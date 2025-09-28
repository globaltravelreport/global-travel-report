import { NextRequest, NextResponse } from 'next/server';
import { ContentAutomationService } from '@/src/services/contentAutomationService';

/**
 * API endpoint for triggering content ingestion
 * POST /api/admin/ingest-content
 */
export async function POST(request: NextRequest) {
  try {
    // Check for authorization (basic check)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes('Bearer')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const automationService = ContentAutomationService.getInstance();

    // Trigger content ingestion
    const result = await automationService.ingestContent();

    return NextResponse.json({
      success: result.success,
      storiesIngested: result.storiesIngested,
      storiesRejected: result.storiesRejected,
      errors: result.errors,
      qualityReport: result.qualityReport
    });

  } catch (error) {
    console.error('Error in content ingestion API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to get automation statistics
 */
export async function GET() {
  try {
    const automationService = ContentAutomationService.getInstance();
    const stats = await automationService.getAutomationStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting automation stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}