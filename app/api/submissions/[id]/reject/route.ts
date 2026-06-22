import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { StoryDatabase } from '@/src/services/storyDatabase';
import { isAuthorizationResponse, requireRole } from '@/lib/admin-auth';
// import { requireEditor } from '@/src/middleware/admin-auth'; // Unused import

/**
 * POST /api/submissions/[id]/reject
 * Reject a user submission
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authorization = await requireRole('admin', 'editor');
    if (isAuthorizationResponse(authorization)) return authorization;

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
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
        { error: 'Only pending submissions can be rejected' },
        { status: 400 }
      );
    }

    // Update submission status to rejected
    const updatedSubmission = await db.updateSubmissionStatus(id, {
      status: 'rejected',
      rejectionReason: reason.trim(),
    });

    if (!updatedSubmission) {
      return NextResponse.json(
        { error: 'Failed to update submission status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Submission rejected successfully',
    });

  } catch (__error) {
    console.error(__error);
    return NextResponse.json(
      { error: 'Failed to reject submission' },
      { status: 500 }
    );
  }
}
