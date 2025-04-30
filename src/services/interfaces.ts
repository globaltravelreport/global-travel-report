/**
 * Interfaces for service dependencies
 */

import { Story, StoryValidationResult } from '@/types/Story';
import { RewriteOptions } from './storyRewrite';

/**
 * Interface for story rewriter service
 */
export interface IStoryRewriter {
  rewrite(content: string | Story, options?: RewriteOptions): Promise<Story | Partial<Story> | null>;
  canProcessMoreStories(): boolean;
  resetDailyCount(): void;
}

/**
 * Interface for story validator service
 */
export interface IStoryValidator {
  validateStory(story: Story): Promise<StoryValidationResult>;
}

/**
 * Interface for story processor service
 */
export interface IStoryProcessor {
  processDailyStories(): Promise<void>;
  getProcessedStories(): Promise<Story[]>;
  processStories(stories: Story[]): Promise<Story[]>;
  getProcessingStats(): { storiesProcessed: number; lastProcessedTime: Date | null };
  resetDailyCount(): void;
}
