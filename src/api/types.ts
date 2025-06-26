/**
 * Types for API requests and responses
 */

import { Story } from '@/types/Story';

/**
 * Contact form submission request
 */
export interface ContactFormRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
  recaptchaToken: string;
}

/**
 * Contact form submission response
 */
export interface ContactFormResponse {
  success: boolean;
  message: string;
}

/**
 * Newsletter subscription request
 */
export interface NewsletterRequest {
  email: string;
  name?: string;
  recaptchaToken: string;
}

/**
 * Newsletter subscription response
 */
export interface NewsletterResponse {
  success: boolean;
  message: string;
}

/**
 * Story rewrite request
 */
export interface StoryRewriteRequest {
  content: string;
  category: string;
  options?: {
    preserveTags?: boolean;
    maintainTone?: boolean;
  };
}

/**
 * Story rewrite response
 */
export interface StoryRewriteResponse {
  success: boolean;
  story?: Partial<Story>;
  message?: string;
}

/**
 * Story validation request
 */
export interface StoryValidationRequest {
  story: Story;
}

/**
 * Story validation response
 */
export interface StoryValidationResponse {
  success: boolean;
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}

/**
 * Publishing schedule request
 */
export interface PublishingScheduleRequest {
  startDate?: string;
  endDate?: string;
}

/**
 * Publishing schedule response
 */
export interface PublishingScheduleResponse {
  success: boolean;
  schedule: Array<{
    story: Partial<Story>;
    publishTime: string;
  }>;
}

/**
 * Stats request
 */
export interface StatsRequest {
  period?: 'day' | 'week' | 'month';
}

/**
 * Stats response
 */
export interface StatsResponse {
  success: boolean;
  stats: {
    storiesProcessed: number;
    storiesPublished: number;
    lastProcessedTime: string | null;
  };
}
