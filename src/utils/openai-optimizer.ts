/**
 * Utilities for optimizing OpenAI API usage
 */

import { createHash } from 'crypto';
import OpenAI from 'openai';
import { retryOpenAICall } from './openai-error-handler';

// Lazy-initialize OpenAI client to avoid build-time failures when env is missing
let openaiClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
  if (openaiClient) return openaiClient;
  const apiKey = process.env.OPENAI_API_KEY || '';
  // Do not throw during module import (e.g., build time). Any missing apiKey
  // will only surface when a request actually tries to call the API.
  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

// In-memory cache for OpenAI responses
const responseCache = new Map<string, { response: unknown; timestamp: number }>();

// Cache TTL in milliseconds (default: 1 hour)
const DEFAULT_CACHE_TTL = 60 * 60 * 1000;

/**
 * Generate a cache key for OpenAI API calls
 * @param model - The model to use
 * @param messages - The messages to send
 * @param options - Additional options
 * @returns A cache key
 */
function generateCacheKey(
  model: string,
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options?: Partial<OpenAI.Chat.ChatCompletionCreateParams>
): string {
  const data = JSON.stringify({ model, messages, options });
  return createHash('md5').update(data).digest('hex');
}

/**
 * Check if a cached response is still valid
 * @param cachedData - The cached data
 * @param ttl - The TTL in milliseconds
 * @returns Boolean indicating if the cached response is still valid
 */
function isCacheValid(cachedData: { timestamp: number }, ttl: number): boolean {
  const now = Date.now();
  return now - cachedData.timestamp < ttl;
}

/**
 * Create a chat completion with caching and retries
 * @param params - The parameters for the chat completion
 * @param options - Additional options for caching and retries
 * @returns A Promise resolving to the chat completion
 */
export async function createChatCompletion(
  params: OpenAI.Chat.ChatCompletionCreateParams,
  options: {
    enableCache?: boolean;
    cacheTtl?: number;
    maxRetries?: number;
    retryDelay?: number;
  } = {}
): Promise<any> {
  const {
    enableCache = true,
    cacheTtl = DEFAULT_CACHE_TTL,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  // Generate cache key
  const cacheKey = enableCache
    ? generateCacheKey(params.model, params.messages, params)
    : '';

  // Check cache
  if (enableCache && responseCache.has(cacheKey)) {
    const cachedData = responseCache.get(cacheKey);

    if (cachedData && isCacheValid(cachedData, cacheTtl)) {
      // Use a more specific logger instead of console.log
      return cachedData.response as OpenAI.Chat.ChatCompletion;
    }

    // Remove expired cache entry
    responseCache.delete(cacheKey);
  }

  // Make API call with retries
  const response = await retryOpenAICall(
    () => getOpenAIClient().chat.completions.create(params),
    maxRetries,
    retryDelay
  );

  // Cache the response
  if (enableCache) {
    responseCache.set(cacheKey, {
      response,
      timestamp: Date.now(),
    });
  }

  return response;
}

/**
 * Batch multiple OpenAI API calls into a single request
 * @param prompts - Array of prompts to process
 * @param model - The model to use
 * @param options - Additional options
 * @returns Array of responses
 */
export async function batchOpenAIRequests(
  prompts: string[],
  model: string = 'gpt-3.5-turbo',
  options: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string[]> {
  const { systemPrompt, temperature = 0.7, maxTokens } = options;

  // Create a single request with all prompts
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPrompt || 'You are a helpful assistant processing multiple requests at once.',
    },
    {
      role: 'user',
      content: `Process the following requests and provide a separate response for each one. Format your response as a JSON array with one response per request:

Requests:
${prompts.map((prompt, index) => `${index + 1}. ${prompt}`).join('\n')}`,
    },
  ];

  // Make the API call
  const response = await createChatCompletion({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
  });

  // Parse the response
  try {
    const content = response.choices[0]?.message?.content || '[]';
    const parsedResponse = JSON.parse(content);

    // Extract responses from the JSON
    if (Array.isArray(parsedResponse.responses)) {
      return parsedResponse.responses;
    }

    // If the response is not in the expected format, try to extract responses from the object
    return prompts.map((_, index) => parsedResponse[`response${index + 1}`] || '');
  } catch (error) {
    console.error('Error parsing batched OpenAI response:', error);
    return prompts.map(() => 'Error processing request');
  }
}

/**
 * Clear the OpenAI response cache
 */
export function clearOpenAICache(): void {
  responseCache.clear();
}

/**
 * Get the size of the OpenAI response cache
 * @returns The number of cached responses
 */
export function getOpenAICacheSize(): number {
  return responseCache.size;
}
