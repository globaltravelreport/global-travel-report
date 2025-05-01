import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    
    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: 'Slug is required'
        },
        { status: 400 }
      );
    }
    
    // Import the database service
    const { StoryDatabase } = require('@/src/services/storyDatabase');
    const db = StoryDatabase.getInstance();
    
    // Get the story by slug
    const story = await db.getStoryBySlug(slug);
    
    if (!story) {
      return NextResponse.json(
        {
          success: false,
          message: `Story with slug "${slug}" not found`
        },
        { status: 404 }
      );
    }
    
    // Return the story
    return NextResponse.json({
      success: true,
      story
    });
  } catch (error) {
    console.error(`Error fetching story:`, error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching story',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
