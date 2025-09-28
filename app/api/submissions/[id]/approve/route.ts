import { NextRequest, NextResponse } from 'next/server';
import { StoryDatabase } from '@/src/services/storyDatabase';

/**
 * POST /api/submissions/[id]/approve
 * Approve a user submission and convert it to a published story
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    const db = StoryDatabase.getInstance();

    // Get the submission
    const submission = await db.getSubmissionById(id);
    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    if (submission.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending submissions can be approved' },
        { status: 400 }
      );
    }

    // Convert submission to published story
    const story = await db.approveSubmissionToStory(id, {
      featured: false,
      editorsPick: false,
      imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=800&h=600',
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Failed to create story from submission' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Submission approved and published successfully',
      story: {
        id: story.id,
        title: story.title,
        slug: story.slug,
      },
    });

  } catch (error) {
    console.error('Error approving submission:', error);
    return NextResponse.json(
      { error: 'Failed to approve submission' },
      { status: 500 }
    );
  }
}