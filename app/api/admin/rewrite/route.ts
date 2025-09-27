import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { StoryRewriter } from '@/src/services/storyRewrite';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, category } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Create story rewriter instance
    const rewriter = new StoryRewriter();

    // Prepare content for rewriting
    const rawContent = `${title}\n\n${content}`;

    // Rewrite the story
    const rewrittenStory = await rewriter.rewrite(rawContent, {
      category: category || 'Travel',
      preserveTags: false,
      maintainTone: true,
    });

    if (!rewrittenStory) {
      return NextResponse.json(
        { error: 'Failed to rewrite story' },
        { status: 500 }
      );
    }

    // Extract the enhanced content
    const result = {
      title: rewrittenStory.title,
      content: rewrittenStory.content,
      excerpt: rewrittenStory.excerpt,
      slug: rewrittenStory.slug,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Rewrite error:', error);
    return NextResponse.json(
      { error: 'Failed to rewrite story. Please try again.' },
      { status: 500 }
    );
  }
}
