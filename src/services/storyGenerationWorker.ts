import { SupabaseStoryStore, StoryGenerationJob } from '@/src/services/supabaseStoryStore';

export async function processStoryGenerationJob(job: StoryGenerationJob): Promise<unknown> {
  const { runDailyAutomation } = await import('@/automation/dailyAutoPublisher.mjs');
  const result = await runDailyAutomation();
  await SupabaseStoryStore.completeStoryGenerationJob(job.id, result);
  return result;
}

