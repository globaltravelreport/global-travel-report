import { NextRequest, NextResponse } from 'next/server';
import { StoryDatabase } from '@/src/services/storyDatabase';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Get the database instance
    const db = StoryDatabase.getInstance();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    let stories = [];

    // Get stories based on query parameters
    if (slug) {
      // Get a specific story by slug
      const story = await db.getStoryBySlug(slug);
      stories = story ? [story] : [];
    } else if (id) {
      // Get a specific story by ID
      const story = await db.getStoryById(id);
      stories = story ? [story] : [];
    } else if (category) {
      // Get stories by category
      stories = await db.getStoriesByCategory(category);
    } else {
      // Get all stories
      stories = await db.getAllStories();
    }

    // Sort stories by publishedAt (newest first)
    stories.sort((a, b) => {
      const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
      const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
      return dateB.getTime() - dateA.getTime();
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedStories = stories.slice(startIndex, endIndex);

    // Return the stories
    return NextResponse.json({
      success: true,
      total: stories.length,
      page,
      limit,
      totalPages: Math.ceil(stories.length / limit),
      stories: paginatedStories
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching stories',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
