import type { Story } from '@/types/Story';

const RECENT_STORY_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_STORIES_PER_CATEGORY_PER_DAY = 2;
const TOPIC_STOP_WORDS = new Set([
  'about', 'after', 'airline', 'and', 'are', 'cruise', 'for', 'from', 'guide',
  'latest', 'news', 'report', 'story', 'the', 'this', 'travel', 'traveller',
  'travellers', 'update', 'with'
]);

type Candidate = Pick<Story, 'title' | 'category'>;

export type StoryDiversityResult =
  | { allowed: true }
  | { allowed: false; reason: 'recent-topic-duplicate' | 'category-daily-limit' };

function meaningfulTokens(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .match(/[a-z0-9]+/g)
      ?.filter((token) => token.length > 2 && !TOPIC_STOP_WORDS.has(token)) || []
  );
}

function isRecent(story: Story, now: Date): boolean {
  const timestamp = story.processedAt || story.firstSeenAt || story.updatedAt || story.publishedAt;
  const date = new Date(timestamp);
  const age = now.getTime() - date.getTime();
  return !Number.isNaN(date.getTime()) && age >= 0 && age <= RECENT_STORY_WINDOW_MS;
}

export function checkStoryDiversity(
  candidate: Candidate,
  stories: Story[],
  now: Date = new Date()
): StoryDiversityResult {
  const recentStories = stories.filter((story) => isRecent(story, now));
  const categoryStories = recentStories.filter((story) => story.category === candidate.category);

  if (categoryStories.length >= MAX_STORIES_PER_CATEGORY_PER_DAY) {
    return { allowed: false, reason: 'category-daily-limit' };
  }

  const candidateTokens = meaningfulTokens(candidate.title);
  const hasTopicDuplicate = categoryStories.some((story) => {
    const overlap = [...candidateTokens].filter((token) => meaningfulTokens(story.title).has(token));
    return overlap.length >= 2 || overlap.some((token) => token.length >= 5);
  });

  return hasTopicDuplicate
    ? { allowed: false, reason: 'recent-topic-duplicate' }
    : { allowed: true };
}
