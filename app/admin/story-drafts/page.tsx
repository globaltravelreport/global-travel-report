import { Metadata } from 'next';
import { SupabaseStoryStore } from '@/src/services/supabaseStoryStore';
import { StoryDraftsClient } from './StoryDraftsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Story Draft Review - Global Travel Report Admin',
  description: 'Review, reject, and publish automated story drafts.',
  robots: {
    index: false,
    follow: false
  }
};

export default async function StoryDraftsPage() {
  if (!SupabaseStoryStore.isConfigured()) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Story Draft Review</h1>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Supabase is not configured for this deployment, so story drafts cannot be loaded.
        </div>
      </div>
    );
  }

  const [drafts, pipelineRuns, jobs] = await Promise.all([
    SupabaseStoryStore.getStoryDrafts(50),
    SupabaseStoryStore.getLatestPipelineRuns(8),
    SupabaseStoryStore.getLatestStoryGenerationJobs(8)
  ]);

  return (
    <StoryDraftsClient
      initialDrafts={drafts}
      initialPipelineRuns={pipelineRuns}
      initialJobs={jobs}
    />
  );
}
