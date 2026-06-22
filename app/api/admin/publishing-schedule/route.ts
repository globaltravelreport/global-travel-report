import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizationResponse, requireAdmin } from '@/lib/admin-auth';
import { SupabaseStoryStore } from '@/src/services/supabaseStoryStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authorization = await requireAdmin();
    if (isAuthorizationResponse(authorization)) return authorization;

    if (!SupabaseStoryStore.isConfigured()) {
      return NextResponse.json([]);
    }

    const [drafts, jobs] = await Promise.all([
      SupabaseStoryStore.getStoryDrafts(25),
      SupabaseStoryStore.getLatestStoryGenerationJobs(10)
    ]);

    const draftRows = drafts
      .filter((draft) => draft.status === 'pending_review')
      .map((draft) => ({
        id: draft.id,
        title: draft.title,
        category: draft.category,
        scheduledTime: draft.created_at,
        status: 'scheduled' as const
      }));

    const jobRows = jobs.map((job) => ({
      id: job.id,
      title: `Daily story pipeline: ${job.status}`,
      category: 'Automation',
      scheduledTime: job.requested_at || job.created_at,
      status: job.status === 'failed' ? 'failed' as const : job.status === 'completed' ? 'published' as const : 'scheduled' as const
    }));

    return NextResponse.json([...draftRows, ...jobRows]);
  } catch (_error) {
    /* eslint-disable no-console */
    console.error(_error);
    return NextResponse.json(
      { error: 'Failed to fetch publishing schedule' },
      { status: 500 }
    );
  }
} 
