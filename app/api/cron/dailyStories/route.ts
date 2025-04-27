import { NextResponse } from 'next/server';
import { DailyStoryProcessor } from '@/services/dailyStoryProcessor';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const processor = DailyStoryProcessor.getInstance();
    await processor.processDailyStories();

    return NextResponse.json({
      success: true,
      message: 'Daily stories processed successfully'
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