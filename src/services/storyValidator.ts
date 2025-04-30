/* eslint-disable no-console */
import type { Story, StoryValidationResult } from '@/types/Story';
import { storyRewriteConfig } from '@/src/config/storyRewrite';
import OpenAI from 'openai';
import { retryOpenAICall, OpenAIError, OpenAIErrorType } from '@/src/utils/openai-error-handler';

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Custom error class for story validation errors
 */
export class StoryValidationError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'StoryValidationError';
  }
}

/**
 * Service for validating stories
 */
export class StoryValidator {
  private static instance: StoryValidator;
  private readonly maxRetries: number = 3;
  private readonly initialRetryDelay: number = 1000;

  private constructor() {}

  /**
   * Get the singleton instance of StoryValidator
   * @returns The StoryValidator instance
   */
  public static getInstance(): StoryValidator {
    if (!StoryValidator.instance) {
      StoryValidator.instance = new StoryValidator();
    }
    return StoryValidator.instance;
  }

  /**
   * Validate a story for content safety, SEO, readability, and factual accuracy
   * @param story - The story to validate
   * @returns Validation result with issues and suggestions
   */
  public async validateStory(story: Story): Promise<StoryValidationResult> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    try {
      // Basic validation
      if (!this.validateBasicRequirements(story, issues)) {
        return { isValid: false, issues, suggestions };
      }

      // Content safety check
      if (!await this.checkContentSafety(story)) {
        issues.push('Content safety check failed');
        return { isValid: false, issues, suggestions };
      }

      // SEO optimization check
      this.checkSEOOptimization(story, issues, suggestions);

      // Readability check
      if (!this.checkReadability(story, issues)) {
        return { isValid: false, issues, suggestions };
      }

      // Factual accuracy check
      if (!await this.checkFactualAccuracy(story)) {
        issues.push('Factual accuracy check failed');
        return { isValid: false, issues, suggestions };
      }

      return {
        isValid: issues.length === 0,
        issues,
        suggestions
      };
    } catch (error) {
      // Handle different types of errors
      if (error instanceof OpenAIError) {
        switch (error.type) {
          case OpenAIErrorType.QUOTA_EXCEEDED:
            issues.push('API quota exceeded. Please try again later.');
            break;
          case OpenAIErrorType.RATE_LIMIT:
            issues.push('API rate limit reached. Please try again later.');
            break;
          case OpenAIErrorType.AUTHENTICATION:
            issues.push('API authentication failed. Please check your API key.');
            break;
          default:
            issues.push(`API error: ${error.message}`);
        }
      } else if (error instanceof StoryValidationError) {
        issues.push(error.message);
      } else {
        issues.push('An unexpected error occurred during validation');
        console.error('Validation error:', error);
      }

      return { isValid: false, issues, suggestions };
    }
  }

  /**
   * Validate basic requirements for a story
   * @param story - The story to validate
   * @param issues - Array to collect validation issues
   * @returns Boolean indicating if basic requirements are met
   * @private
   */
  private validateBasicRequirements(story: Story, issues: string[]): boolean {
    // Check title length
    if (story.title.length > storyRewriteConfig.contentRules.headline.maxLength) {
      issues.push(`Title exceeds maximum length of ${storyRewriteConfig.contentRules.headline.maxLength} characters`);
    }

    // Check meta description length
    if (story.excerpt.length > storyRewriteConfig.contentRules.meta.descriptionMaxLength) {
      issues.push(`Meta description exceeds maximum length of ${storyRewriteConfig.contentRules.meta.descriptionMaxLength} characters`);
    }

    // Check required elements
    const requiredElements = storyRewriteConfig.contentRules.headline.requiredElements;
    for (const element of requiredElements) {
      if (!story.title.toLowerCase().includes(element.toLowerCase())) {
        issues.push(`Title missing required element: ${element}`);
      }
    }

    return issues.length === 0;
  }

  /**
   * Check content safety using OpenAI
   * @param story - The story to check
   * @returns Promise resolving to a boolean indicating if content is safe
   * @private
   */
  private async checkContentSafety(story: Story): Promise<boolean> {
    try {
      // Use retry utility for OpenAI API calls
      const completion = await retryOpenAICall(
        () => openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a content safety validator. Check if the content is safe and appropriate."
            },
            {
              role: "user",
              content: JSON.stringify({
                title: story.title,
                content: story.content,
                excerpt: story.excerpt
              })
            }
          ]
        }),
        this.maxRetries,
        this.initialRetryDelay
      );

      const responseText = completion.choices[0]?.message?.content || '{"isSafe": false, "issues": ["Failed to validate content"]}';

      try {
        const response = JSON.parse(responseText);

        if (!response.isSafe) {
          console.warn('Content safety issues:', response.issues);
          return false;
        }

        return true;
      } catch (parseError) {
        console.error('Failed to parse content safety response:', parseError);
        throw new StoryValidationError('Invalid response format from content safety check');
      }
    } catch (error) {
      console.error('Content safety check failed:', error);
      throw new StoryValidationError('Failed to check content safety', error);
    }
  }

  /**
   * Check SEO optimization for a story
   * @param story - The story to check
   * @param issues - Array to collect validation issues
   * @param suggestions - Array to collect improvement suggestions
   * @private
   */
  private checkSEOOptimization(story: Story, issues: string[], suggestions: string[]): void {
    // Check keyword density
    const keywords = story.tags;
    const content = story.content.toLowerCase();
    const title = story.title.toLowerCase();

    for (const keyword of keywords) {
      const keywordCount = (content.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      const wordCount = content.split(/\s+/).length;
      const keywordDensity = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;

      if (keywordDensity < 0.5) {
        suggestions.push(`Consider increasing usage of keyword: ${keyword}`);
      } else if (keywordDensity > 3) {
        issues.push(`Keyword density too high for: ${keyword}`);
      }

      if (!title.includes(keyword.toLowerCase())) {
        suggestions.push(`Consider including keyword in title: ${keyword}`);
      }
    }

    // Check meta description
    if (story.country && !story.excerpt.toLowerCase().includes(story.country.toLowerCase())) {
      suggestions.push(`Consider including destination (${story.country}) in meta description`);
    }
  }

  /**
   * Check readability of a story
   * @param story - The story to check
   * @param issues - Array to collect validation issues
   * @returns Boolean indicating if readability requirements are met
   * @private
   */
  private checkReadability(story: Story, issues: string[]): boolean {
    // Simple readability check
    const sentences = story.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = story.content.split(/\s+/).filter(w => w.trim().length > 0);

    // Avoid division by zero
    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;

    if (avgWordsPerSentence > 20) {
      issues.push(`Content may be too complex. Consider shorter sentences. (Average: ${avgWordsPerSentence.toFixed(1)} words per sentence)`);
      return false;
    }

    return true;
  }

  /**
   * Check factual accuracy using OpenAI
   * @param story - The story to check
   * @returns Promise resolving to a boolean indicating if content is factually accurate
   * @private
   */
  private async checkFactualAccuracy(story: Story): Promise<boolean> {
    try {
      // Use retry utility for OpenAI API calls
      const completion = await retryOpenAICall(
        () => openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a fact checker. Verify the accuracy of the travel information provided."
            },
            {
              role: "user",
              content: JSON.stringify({
                title: story.title,
                content: story.content,
                country: story.country,
                category: story.category
              })
            }
          ]
        }),
        this.maxRetries,
        this.initialRetryDelay
      );

      const responseText = completion.choices[0]?.message?.content || '{"isAccurate": false, "issues": ["Failed to verify facts"]}';

      try {
        const response = JSON.parse(responseText);

        if (!response.isAccurate) {
          console.warn('Factual accuracy issues:', response.issues);
          return false;
        }

        return true;
      } catch (parseError) {
        console.error('Failed to parse factual accuracy response:', parseError);
        throw new StoryValidationError('Invalid response format from factual accuracy check');
      }
    } catch (error) {
      console.error('Factual accuracy check failed:', error);
      throw new StoryValidationError('Failed to check factual accuracy', error);
    }
  }
}