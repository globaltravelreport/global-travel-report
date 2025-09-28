import { NextRequest, NextResponse } from 'next/server';
import { ContentAutomationService } from '@/src/services/contentAutomationService';

/**
 * API endpoint for managing featured stories and manual overrides
 * GET /api/admin/featured-stories - Get current featured stories
 * POST /api/admin/featured-stories - Set featured story
 * PUT /api/admin/featured-stories - Update multiple featured stories
 */

export async function GET() {
  try {
    const automationService = ContentAutomationService.getInstance();
    const stats = await automationService.getAutomationStats();

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting featured stories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyId, action } = body;

    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    const automationService = ContentAutomationService.getInstance();
    let result = false;

    switch (action) {
      case 'setFeatured':
        result = await automationService.setFeaturedStory(storyId);
        break;
      case 'setEditorsPick':
        result = await automationService.setEditorsPicks([storyId]);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Story ${action} updated successfully`
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to update story' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error updating featured story:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyIds, action } = body;

    if (!Array.isArray(storyIds) || storyIds.length === 0) {
      return NextResponse.json(
        { error: 'Story IDs array is required' },
        { status: 400 }
      );
    }

    const automationService = ContentAutomationService.getInstance();
    let result = false;

    switch (action) {
      case 'setEditorsPicks':
        result = await automationService.setEditorsPicks(storyIds);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: `${action} updated successfully for ${storyIds.length} stories`
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to update stories' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error batch updating stories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}