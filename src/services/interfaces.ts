import { Story } from '@/types/Story';

/**
 * Interface for story validator
 */
export interface IStoryValidator {
  /**
   * Validate a story
   * @param story - The story to validate
   * @returns A promise resolving to validation result
   */
  validate(story: Story): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }>;
}

/**
 * Interface for story rewriter
 */
export interface IStoryRewriter {
  /**
   * Rewrite a story
   * @param content - The content to rewrite
   * @param category - The category of the story
   * @param options - Rewrite options
   * @returns A promise resolving to the rewritten content or story
   */
  rewrite(
    content: string,
    category: string,
    options?: {
      preserveTags?: boolean;
      maintainTone?: boolean;
    }
  ): Promise<string | Story>;
}

/**
 * Interface for story processor
 */
export interface IStoryProcessor {
  /**
   * Process stories
   * @returns A promise resolving to the number of stories processed
   */
  process(): Promise<number>;

  /**
   * Get processing stats
   * @returns Processing stats
   */
  getStats(): {
    storiesProcessed: number;
    storiesPublished: number;
    lastProcessedTime: Date | null;
  };
}
