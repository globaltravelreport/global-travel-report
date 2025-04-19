import { NextResponse } from 'next/server';
import { StoryDraft } from '@/types/content';

// In a real application, this would be a database
let publishedStories: StoryDraft[] = [];

export async function POST(request: Request) {
  try {
    const story: StoryDraft = await request.json();

    // Validate required fields
    if (!story.title || !story.content || !story.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add timestamp if not provided
    if (!story.publishedAt) {
      story.publishedAt = new Date().toISOString();
    }

    // In a real application, this would save to a database
    publishedStories.push(story);

    // Return success response
    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error('Error publishing story:', error);
    return NextResponse.json(
      { error: 'Failed to publish story' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // In a real application, this would fetch from a database
  return NextResponse.json(publishedStories);
} 