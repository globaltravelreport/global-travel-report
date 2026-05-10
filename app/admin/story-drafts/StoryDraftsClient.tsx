'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ExternalLink, RefreshCw, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { StoryDraft, StoryGenerationJob, StoryPipelineRun } from '@/src/services/supabaseStoryStore';

type StoryDraftsClientProps = {
  initialDrafts: StoryDraft[];
  initialPipelineRuns: StoryPipelineRun[];
  initialJobs: StoryGenerationJob[];
};

type DraftPayload = {
  drafts: StoryDraft[];
  pipelineRuns: StoryPipelineRun[];
  jobs: StoryGenerationJob[];
};

function formatDate(value?: string | null) {
  if (!value) return 'Not set';

  return new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'published' || status === 'completed') return 'default';
  if (status === 'rejected' || status === 'failed') return 'destructive';
  if (status === 'pending_review' || status === 'queued' || status === 'retry') return 'secondary';
  return 'outline';
}

export function StoryDraftsClient({
  initialDrafts,
  initialPipelineRuns,
  initialJobs
}: StoryDraftsClientProps) {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [pipelineRuns, setPipelineRuns] = useState(initialPipelineRuns);
  const [jobs, setJobs] = useState(initialJobs);
  const [busyDraftId, setBusyDraftId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  const pendingDrafts = useMemo(
    () => drafts.filter((draft) => draft.status === 'pending_review'),
    [drafts]
  );

  const latestRun = pipelineRuns[0];

  async function refreshDrafts() {
    setError(null);
    const response = await fetch('/api/admin/story-drafts', { cache: 'no-store' });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to refresh story drafts');
    }

    const payload = data as DraftPayload & { success: true };
    setDrafts(payload.drafts);
    setPipelineRuns(payload.pipelineRuns);
    setJobs(payload.jobs);
  }

  async function runDraftAction(id: string, action: 'publish' | 'reject') {
    try {
      setBusyDraftId(id);
      setMessage(null);
      setError(null);

      const response = await fetch('/api/admin/story-drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          action,
          reason: rejectionReasons[id] || ''
        })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Failed to ${action} story draft`);
      }

      setMessage(action === 'publish' ? 'Draft published successfully.' : 'Draft rejected.');
      await refreshDrafts();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Story draft action failed');
    } finally {
      setBusyDraftId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Story Draft Review</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Review automated RSS rewrites before they go live. Publishing here moves the draft into the public story table.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => refreshDrafts().catch((caughtError) => setError(caughtError.message))}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {(message || error) && (
        <div className={`rounded-md border p-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}`}>
          {error || message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{pendingDrafts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Draft Rows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{drafts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Latest Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{latestRun?.candidates_found ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Latest Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-gray-900">{latestRun ? formatDate(latestRun.started_at) : 'No runs'}</div>
            {latestRun && (
              <Badge className="mt-2" variant={latestRun.success ? 'default' : 'destructive'}>
                {latestRun.success ? 'Success' : 'Needs attention'}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Pending Review</h2>
          <Link href="/admin/rss" className="text-sm font-medium text-blue-700 hover:underline">
            RSS settings
          </Link>
        </div>

        {pendingDrafts.length === 0 ? (
          <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
            No pending drafts. The daily pipeline will add new items when it finds eligible RSS candidates.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingDrafts.map((draft) => (
              <article key={draft.id} className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
                    {draft.image_url ? (
                      <Image
                        src={draft.image_url}
                        alt={draft.image_alt || draft.title}
                        fill
                        className="object-cover"
                        sizes="220px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500">No image</div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="mb-2 flex flex-wrap gap-2">
                          <Badge variant="secondary">{draft.category}</Badge>
                          <Badge variant="outline">{draft.country}</Badge>
                          <Badge variant={getStatusVariant(draft.status)}>{draft.status.replace('_', ' ')}</Badge>
                        </div>
                        <h3 className="text-xl font-semibold leading-tight text-gray-950">{draft.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-gray-600">{draft.excerpt}</p>
                      </div>
                      {draft.source_url && (
                        <Button asChild variant="outline" size="sm" className="gap-2">
                          <a href={draft.source_url} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            Source
                          </a>
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-3">
                      <div>
                        <span className="block text-xs font-medium uppercase tracking-wide text-gray-400">Original date</span>
                        {formatDate(draft.original_published_at || draft.story?.publishedAt?.toString())}
                      </div>
                      <div>
                        <span className="block text-xs font-medium uppercase tracking-wide text-gray-400">Created</span>
                        {formatDate(draft.created_at)}
                      </div>
                      <div>
                        <span className="block text-xs font-medium uppercase tracking-wide text-gray-400">Words</span>
                        {draft.story?.wordCount || draft.content.split(/\s+/).filter(Boolean).length}
                      </div>
                    </div>

                    <div className="max-h-40 overflow-auto rounded-md bg-gray-50 p-3 text-sm leading-6 text-gray-700">
                      {draft.content}
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
                      <Textarea
                        placeholder="Optional rejection note"
                        value={rejectionReasons[draft.id] || ''}
                        onChange={(event) => setRejectionReasons((current) => ({
                          ...current,
                          [draft.id]: event.target.value
                        }))}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        disabled={busyDraftId === draft.id}
                        onClick={() => runDraftAction(draft.id, 'reject')}
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        type="button"
                        className="gap-2"
                        disabled={busyDraftId === draft.id}
                        onClick={() => runDraftAction(draft.id, 'publish')}
                      >
                        <Check className="h-4 w-4" />
                        Publish
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Pipeline Runs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pipelineRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 text-sm last:border-0">
                <div>
                  <div className="font-medium text-gray-900">{formatDate(run.started_at)}</div>
                  <div className="text-gray-500">
                    {run.feeds_checked} feeds, {run.candidates_found} candidates
                  </div>
                </div>
                <Badge variant={run.success ? 'default' : 'destructive'}>{run.success ? 'Success' : 'Attention'}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 text-sm last:border-0">
                <div>
                  <div className="font-medium text-gray-900">{formatDate(job.requested_at)}</div>
                  <div className="text-gray-500">
                    Attempt {job.attempts} of {job.max_attempts}
                  </div>
                </div>
                <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
