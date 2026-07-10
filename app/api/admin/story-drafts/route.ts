import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizationResponse, requireAdmin } from '@/lib/admin-auth';
import { SupabaseStoryStore } from '@/src/services/supabaseStoryStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const authorization = await requireAdmin();
  if (isAuthorizationResponse(authorization)) return authorization;

  if (!SupabaseStoryStore.isConfigured()) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
  }

  const limit = Number.parseInt(request.nextUrl.searchParams.get('limit') || '50', 10);
  const [drafts, pipelineRuns, jobs] = await Promise.all([
    SupabaseStoryStore.getStoryDrafts(Number.isFinite(limit) ? Math.min(limit, 100) : 50),
    SupabaseStoryStore.getLatestPipelineRuns(8),
    SupabaseStoryStore.getLatestStoryGenerationJobs(8)
  ]);

  return NextResponse.json({
    success: true,
    drafts,
    pipelineRuns,
    jobs
  });
}

export async function POST(request: NextRequest) {
  const authorization = await requireAdmin();
  if (isAuthorizationResponse(authorization)) return authorization;

  if (!SupabaseStoryStore.isConfigured()) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
  }

  const body = await request.json();
  const id = typeof body.id === 'string' ? body.id : '';
  const action = typeof body.action === 'string' ? body.action : '';

  if (!id || !['publish', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid draft action' }, { status: 400 });
  }

  if (action === 'publish') {
    const story = await SupabaseStoryStore.publishDraft(id);
    return NextResponse.json({ success: true, action, story });
  }

  await SupabaseStoryStore.rejectDraft(id, typeof body.reason === 'string' ? body.reason : '');
  return NextResponse.json({ success: true, action });
}
