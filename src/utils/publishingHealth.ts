import type { StoryPipelineRun } from '@/src/services/supabaseStoryStore';

export const DAILY_PUBLISHING_TARGET = 5;
const SYDNEY_TIME_ZONE = 'Australia/Sydney';

type PublishingHealthStatus = 'on_target' | 'in_progress' | 'at_risk' | 'behind' | 'unavailable';

export type PublishingHealth = {
  status: PublishingHealthStatus;
  date: string;
  dailyTarget: number;
  publishedStories: number;
  completedRuns: number;
  failedRuns: number;
  lastRunAt: string | null;
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
    lastRunAt
  };
}
