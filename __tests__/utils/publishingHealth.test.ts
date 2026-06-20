import type { StoryPipelineRun } from '@/src/services/supabaseStoryStore';
import { getPublishingHealth } from '@/src/utils/publishingHealth';

function pipelineRun(overrides: Partial<StoryPipelineRun> = {}): StoryPipelineRun {
  return {
    id: 'run-1',
    mode: 'publish',
    success: true,
    started_at: '2026-06-20T00:00:00.000Z',
    feeds_checked: 4,
    candidates_found: 8,
    summary: { published: 1 },
    feed_failures: [],
    processed: [],
    created_at: '2026-06-20T00:00:00.000Z',
    ...overrides
  };
}

describe('getPublishingHealth', () => {
  const now = new Date('2026-06-20T04:00:00.000Z');

  it('reports on target after five stories are published in Sydney today', () => {
    const runs = Array.from({ length: 5 }, (_, index) => pipelineRun({
      id: `run-${index}`,
      started_at: `2026-06-20T0${index}:00:00.000Z`
    }));

    expect(getPublishingHealth(runs, now)).toMatchObject({
      status: 'on_target',
      dailyTarget: 5,
      publishedStories: 5,
      completedRuns: 5,
      failedRuns: 0
    });
  });

  it('flags multiple failed runs before the daily cutoff', () => {
    const runs = [
      pipelineRun({ id: 'failed-1', success: false, summary: { published: 0 } }),
      pipelineRun({ id: 'failed-2', success: false, summary: { published: 0 } })
    ];

    expect(getPublishingHealth(runs, now).status).toBe('at_risk');
  });

  it('reports behind after the final Sydney publishing window', () => {
    expect(getPublishingHealth([], new Date('2026-06-20T13:00:00.000Z'))).toMatchObject({
      status: 'behind',
      publishedStories: 0
    });
  });
});
