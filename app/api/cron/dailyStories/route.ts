import { NextRequest, NextResponse } from 'next/server';
import { StoryProcessorService } from '@/src/services/storyProcessorService';

// Use Edge runtime for compatibility with Vercel
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check for API key if this is a public endpoint
    const apiKey = request.headers.get('x-api-key');
    const secretKey = process.env.CRON_SECRET_KEY;

    if (secretKey && apiKey !== secretKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized'
        },
        { status: 401 }
      );
    }

    // Get the story processor service
    const storyProcessor = StoryProcessorService.getInstance();

    // Check if processing is already running
    if (storyProcessor.isCurrentlyProcessing()) {
      return NextResponse.json({
        success: false,
        message: 'Story processing is already running',
        lastProcessingTime: storyProcessor.getLastProcessingTime(),
        stats: storyProcessor.getProcessingStats()
      });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const countParam = searchParams.get('count');
    const cruiseCountParam = searchParams.get('cruiseCount');

    const count = countParam ? parseInt(countParam, 10) : 8;
    const cruiseCount = cruiseCountParam ? parseInt(cruiseCountParam, 10) : 2;

    // Process stories
    const stories = await storyProcessor.processStories(count, cruiseCount);

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Processed ${stories.length} stories successfully`,
      stats: storyProcessor.getProcessingStats(),
      storyCount: stories.length
    });
  } catch (error) {
    console.error('Error processing daily stories:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Error processing daily stories',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}