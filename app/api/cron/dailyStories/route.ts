import { NextResponse } from 'next/server';
import { DailyStoryProcessor } from '@/services/dailyStoryProcessor';

// Use Node.js runtime instead of Edge
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Initialize the processor
    const processor = DailyStoryProcessor.getInstance();

    // Process stories
    await processor.processDailyStories();

    // Get the processed stories
    const stories = await processor.getProcessedStories();

    return NextResponse.json({
      success: true,
      message: 'Daily stories processed successfully',
      stories: stories.map(story => ({
        id: story.id,
        title: story.title,
        slug: story.slug,
        category: story.category,
        country: story.country,
        publishedAt: story.publishedAt
      }))
    });
  } catch (error) {
    /* eslint-disable no-console */
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