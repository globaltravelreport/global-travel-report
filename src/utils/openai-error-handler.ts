import { APIError } from 'openai';

/**
 * Error types for OpenAI API calls
 */
export enum OpenAIErrorType {
  RATE_LIMIT = 'rate_limit',
  QUOTA_EXCEEDED = 'quota_exceeded',
  INVALID_REQUEST = 'invalid_request',
  AUTHENTICATION = 'authentication',
  SERVER_ERROR = 'server_error',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

/**
 * Custom error class for OpenAI API errors
 */
export class OpenAIError extends Error {
  type: OpenAIErrorType;
  status?: number;
  retryAfter?: number;

  constructor(message: string, type: OpenAIErrorType, status?: number, retryAfter?: number) {
    super(message);
    this.name = 'OpenAIError';
    this.type = type;
    this.status = status;
    this.retryAfter = retryAfter;
  }

  /**
   * Check if the error is retryable
   */
  isRetryable(): boolean {
    return (
      this.type === OpenAIErrorType.RATE_LIMIT ||
      this.type === OpenAIErrorType.SERVER_ERROR ||
      this.type === OpenAIErrorType.TIMEOUT
    );
  }

  /**
   * Get recommended retry delay in milliseconds
   */
  getRetryDelay(defaultDelay: number = 1000): number {
    if (this.retryAfter) {
      // Convert seconds to milliseconds
      return this.retryAfter * 1000;
    }

    // Default exponential backoff based on error type
    switch (this.type) {
      case OpenAIErrorType.RATE_LIMIT:
        return defaultDelay * 2;
      case OpenAIErrorType.SERVER_ERROR:
        return defaultDelay;
      case OpenAIErrorType.TIMEOUT:
        return defaultDelay * 1.5;
      default:
        return defaultDelay;
    }
  }
}

/**
 * Handle OpenAI API errors and convert them to our custom error format
 * @param error - The error from the OpenAI API
 * @returns A custom OpenAIError with additional context
 */
export function handleOpenAIError(error: unknown): OpenAIError {
  // Handle APIError from OpenAI SDK
  if (error instanceof APIError) {
    const status = error.status;
    let type = OpenAIErrorType.UNKNOWN;
    let retryAfter: number | undefined;

    // Extract retry-after header if present
    if (error.headers) {
      const retryAfterHeader = error.headers.get('retry-after');
      if (retryAfterHeader) {
        retryAfter = parseInt(retryAfterHeader, 10);
      }
    }

    // Determine error type based on status code and error message
    if (status === 429) {
      if (error.message.includes('quota')) {
        type = OpenAIErrorType.QUOTA_EXCEEDED;
      } else {
        type = OpenAIErrorType.RATE_LIMIT;
      }
    } else if (status === 400) {
      type = OpenAIErrorType.INVALID_REQUEST;
    } else if (status === 401) {
      type = OpenAIErrorType.AUTHENTICATION;
    } else if (status >= 500 && status < 600) {
      type = OpenAIErrorType.SERVER_ERROR;
    }

    return new OpenAIError(
      error.message,
      type,
      status,
      retryAfter
    );
  }

  // Handle timeout errors
  if (error instanceof Error && error.message.includes('timeout')) {
    return new OpenAIError(
      error.message,
      OpenAIErrorType.TIMEOUT
    );
  }

  // Handle generic errors
  const message = error instanceof Error ? error.message : 'Unknown OpenAI API error';
  return new OpenAIError(message, OpenAIErrorType.UNKNOWN);
}

/**
 * Retry an OpenAI API call with exponential backoff
 * @param fn - The function to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param initialDelay - Initial delay in milliseconds
 * @returns The result of the function call
 */
export async function retryOpenAICall<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let retries = 0;
  let delay = initialDelay;

  const shouldContinue = true;

  while (shouldContinue) {
    try {
      return await fn();
    } catch (_error) {
      const openAIError = handleOpenAIError(error);

      // Don't retry if we've reached max retries or the error isn't retryable
      if (retries >= maxRetries || !openAIError.isRetryable()) {
        throw openAIError;
      }

      // Calculate delay for next retry
      delay = openAIError.getRetryDelay(delay);
      retries++;

      // Log retry attempt
      console.warn(`OpenAI API call failed (${openAIError.type}). Retrying in ${delay}ms... (${retries}/${maxRetries})`);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached due to the return or throw above
  throw new Error("Unexpected execution path in retryWithExponentialBackoff");
}
