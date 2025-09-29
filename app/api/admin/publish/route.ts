import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { StoryDatabase } from '@/src/services/storyDatabase';
import { getImageForStory } from '@/utils/imageTracker';
import { v4 as uuidv4 } from 'uuid';
import type { Story } from '@/types/Story';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, excerpt, slug, country, category, imageUrl, tags } = await request.json();

    if (!title || !content || !country || !category) {
      return NextResponse.json(
        { error: 'Title, content, country, and category are required' },
        { status: 400 }
      );
    }

    // Get or generate image
    let finalImageUrl = imageUrl;
    let photographer = null;

    if (!finalImageUrl) {
      const imageData = getImageForStory(slug, category);
      finalImageUrl = imageData.imageUrl;
      photographer = imageData.photographer;
    }

    // Create the story object
    const story: Story = {
      id: uuidv4(),
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      title,
      excerpt: excerpt || content.substring(0, 200) + '...',
      content,
      author: 'Global Travel Report',
      publishedAt: new Date().toISOString(),
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : ['travel']),
      category,
      country,
      featured: false,
      editorsPick: false,
      imageUrl: finalImageUrl,
      photographer: photographer || { name: 'Global Travel Report' },
    };

    // Save to database
    const db = StoryDatabase.getInstance();
    await db.addStory(story);

    return NextResponse.json({ 
      success: true, 
      story: {
        id: story.id,
        title: story.title,
        slug: story.slug,
      }
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { error: 'Failed to publish story. Please try again.' },
      { status: 500 }
    );
  }
}
