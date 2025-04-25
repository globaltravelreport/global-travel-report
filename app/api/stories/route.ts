import { NextRequest, NextResponse } from 'next/server';
import { StoryDraft } from '@/app/types/content';
import fs from 'fs/promises';
import path from 'path';

// In a real application, this would be a database
const publishedStories: StoryDraft[] = [];

export async function POST(request: NextRequest) {
  try {
    const storyData = await request.json();
    
    // Save to JSON file
    const storiesDir = path.join(process.cwd(), 'data', 'stories');
    await fs.mkdir(storiesDir, { recursive: true });
    await fs.writeFile(
      path.join(storiesDir, `${storyData.slug}.json`),
      JSON.stringify(storyData, null, 2)
    );

    return NextResponse.json({ success: true, data: storyData });
  } catch (error) {
    console.error('Error saving story:', error);
    return NextResponse.json(
      { error: 'Failed to save story' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // In a real application, this would fetch from a database
  return NextResponse.json(publishedStories);
} 