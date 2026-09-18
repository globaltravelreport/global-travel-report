import type { StoryPipelineRun } from '@/src/services/supabaseStoryStore';

export const DAILY_PUBLISHING_TARGET = 5;
const SYDNEY_TIME_ZONE = 'Australia/Sydney';

type PublishingHealthStatus = 'on_target' | 'in_progress' | 'at_risk' | 'behind' | 'unavailable';

export type LatestPipelineRunSummary = {
  started_at: string;
  finished_at?: string | null;
  success: boolean;
  feeds_checked: number;
  candidates_found: number;
  summary: {
    published: number;
    rejected: number;
    drafts: number;
    duplicates: number;
    failed: number;
    reviewedCandidates: number;
  };
  feedFailures: {
    count: number;
    reasons: string[];
  };
};

export type PublishingHealth = {
  status: PublishingHealthStatus;
  date: string;
  dailyTarget: number;
  publishedStories: number;
  completedRuns: number;
  failedRuns: number;
  lastRunAt: string | null;
  latestRun: LatestPipelineRunSummary | null;
};

function localDateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SYDNEY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function localHour(date: Date): number {
  return Number(new Intl.DateTimeFormat('en-AU', {
    timeZone: SYDNEY_TIME_ZONE,
    hour: '2-digit',
    hourCycle: 'h23'
  }).format(date));
}

function publishedCount(summary: Record<string, unknown>): number {
  const value = summary.published;
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function numberField(summary: Record<string, unknown>, key: string): number {
  const value = summary[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function compactFeedFailures(feedFailures: unknown[]): LatestPipelineRunSummary['feedFailures'] {
  const reasons: string[] = [];

  for (const failure of feedFailures || []) {
    if (!failure || typeof failure !== 'object') continue;
    const record = failure as Record<string, unknown>;
    const feedUrl = typeof record.feedUrl === 'string' ? record.feedUrl : '';
    const error = typeof record.error === 'string' ? record.error : 'unknown error';
    const host = (() => {
      try {
        return feedUrl ? new URL(feedUrl).host : '';
      } catch {
        return '';
      }
    })();
    const reason = host ? `${host}: ${error}` : error;
    if (reason && !reasons.includes(reason)) {
      reasons.push(reason);
    }
    if (reasons.length >= 5) break;
  }

  return {
    count: Array.isArray(feedFailures) ? feedFailures.length : 0,
    reasons
  };
}

export function summariseLatestPipelineRun(
  run: StoryPipelineRun | null | undefined
): LatestPipelineRunSummary | null {
  if (!run) {
    return null;
  }

  const summary = (run.summary || {}) as Record<string, unknown>;

  return {
    started_at: run.started_at,
    finished_at: run.finished_at ?? null,
    success: Boolean(run.success),
    feeds_checked: run.feeds_checked,
    candidates_found: run.candidates_found,
    summary: {
      published: numberField(summary, 'published'),
      rejected: numberField(summary, 'rejected'),
      drafts: numberField(summary, 'drafts'),
      duplicates: numberField(summary, 'duplicates'),
      failed: numberField(summary, 'failed'),
      reviewedCandidates: numberField(summary, 'reviewedCandidates')
    },
    feedFailures: compactFeedFailures(Array.isArray(run.feed_failures) ? run.feed_failures : [])
  };
}

export function getPublishingHealth(
  runs: StoryPipelineRun[],
  now: Date = new Date()
): PublishingHealth {
  const date = localDateKey(now);
  const todaysRuns = runs.filter((run) => localDateKey(new Date(run.started_at)) === date);
  const publishedStories = todaysRuns.reduce((total, run) => total + publishedCount(run.summary), 0);
  const failedRuns = todaysRuns.filter((run) => !run.success).length;
  const lastRunAt = todaysRuns[0]?.started_at || null;

  let status: PublishingHealthStatus = 'in_progress';
  if (publishedStories >= DAILY_PUBLISHING_TARGET) {
    status = 'on_target';
  } else if (localHour(now) >= 23) {
    status = 'behind';
  } else if (failedRuns > 1) {
    status = 'at_risk';
  }

  return {
    status,
    date,
    dailyTarget: DAILY_PUBLISHING_TARGET,
    publishedStories,
    completedRuns: todaysRuns.filter((run) => run.success).length,
    failedRuns,
    lastRunAt,
    // Prefer the absolute latest stored run (may be prior Sydney day) for ops diagnosis.
    latestRun: summariseLatestPipelineRun(runs[0] || null)
  };
}
