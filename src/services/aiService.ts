/**
 * Unified AI Service for Story Generation
 *
 * This service provides a single interface for AI-powered story generation that can switch
 * between different AI providers (OpenAI GPT-4 or Google Gemini) based on environment configuration.
 *
 * Environment Configuration:
 * - Set AI_PROVIDER=openai (default) to use OpenAI GPT-4
 * - Set AI_PROVIDER=google to use Google Gemini (gemini-1.5-flash)
 *
 * Required API Keys:
 * - For OpenAI: OPENAI_API_KEY must be set
 * - For Google: GOOGLE_API_KEY must be set
 *
 * Usage:
 * ```typescript
 * import { generateStoryContent } from '@/src/services/aiService';
 *
 * const result = await generateStoryContent({
 *   title: "My Story Title",
 *   content: "Original story content...",
 *   prompt: "Rewrite this story in an engaging travel style"
 * });
 *
 * console.log(result.content); // AI-generated content
 * ```
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// AI Provider types
export type AIProvider = 'openai' | 'google';

// Response interface for consistent return format
export interface AIResponse {
  content: string;
  provider: AIProvider;
  model?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

// Configuration interface
export interface AIConfig {
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Default configuration
const DEFAULT_CONFIG: AIConfig = {
  provider: (process.env.AI_PROVIDER as AIProvider) || 'openai',
  model: undefined, // Will be set based on provider
  temperature: 0.7,
  maxTokens: 2000,
};

/**
 * Get the current AI provider from environment variables
 */
function getCurrentProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase() as AIProvider;
  return provider === 'google' ? 'google' : 'openai';
}

/**
 * Validate that required API keys are available for the selected provider
 */
function validateAPIKeys(provider: AIProvider): void {
  if (provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing OPENAI_API_KEY. Please set your OpenAI API key in environment variables.');
    }
  } else if (provider === 'google') {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('Missing GOOGLE_API_KEY. Please set your Google API key in environment variables.');
    }
  } else {
    throw new Error(`Unsupported AI provider: ${provider}. Supported providers: openai, google`);
  }
}

/**
 * Initialize OpenAI client
 */
function initializeOpenAI(): OpenAI {
  validateAPIKeys('openai');

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    organization: process.env.OPENAI_ORGANIZATION,
  });
}

/**
 * Initialize Google Gemini client
 */
function initializeGoogleAI(): any {
  validateAPIKeys('google');

  return new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
}

/**
 * Generate content using OpenAI GPT-4
 */
async function generateWithOpenAI(
  prompt: string,
  config: AIConfig = {}
): Promise<AIResponse> {
  const openai = initializeOpenAI();
  const model = config.model || 'gpt-4';

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional Australian travel journalist. Your writing style is engaging, informative, and objective. You use Australian English without slang, and your tone is polished and professional.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 2000,
    });

    const content = completion.choices[0]?.message?.content || '';

    return {
      content,
      provider: 'openai',
      model,
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
      },
    };
  } catch (_error) {
    console.error(_error);
    throw new Error(`OpenAI API error: ${_error instanceof Error ? _error.message : 'Unknown error'}`);
  }
}

/**
 * Generate content using Google Gemini
 */
async function generateWithGoogle(
  prompt: string,
  config: AIConfig = {}
): Promise<AIResponse> {
  const genAI = initializeGoogleAI();
  const model = genAI.getGenerativeModel({
    model: config.model || 'gemini-1.5-flash',
    generationConfig: {
      temperature: config.temperature || 0.7,
      maxOutputTokens: config.maxTokens || 2000,
    },
  });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    return {
      content,
      provider: 'google',
      model: config.model || 'gemini-1.5-flash',
    };
  } catch (_error) {
    console.error(_error);
    throw new Error(`Google Gemini API error: ${_error instanceof Error ? _error.message : 'Unknown error'}`);
  }
}

/**
 * Generate AI content using the configured provider
 */
export async function generateStoryContent(
  prompt: string,
  config: AIConfig = {}
): Promise<AIResponse> {
  const provider = getCurrentProvider();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config, provider };

  console.log(`[AI Service] Using provider: ${provider}, model: ${mergedConfig.model}`);

  try {
    if (provider === 'openai') {
      return await generateWithOpenAI(prompt, mergedConfig);
    } else if (provider === 'google') {
      return await generateWithGoogle(prompt, mergedConfig);
    } else {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (_error) {
    console.error(_error);
    throw error;
  }
}

/**
 * Get available models for the current provider
 */
export function getAvailableModels(): string[] {
  const provider = getCurrentProvider();

  if (provider === 'openai') {
    return ['gpt-4', 'gpt-4-turbo-preview', 'gpt-3.5-turbo'];
  } else if (provider === 'google') {
    return ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  }

  return [];
}

/**
 * Check if the current provider is properly configured
 */
export function isProviderConfigured(): boolean {
  try {
    const provider = getCurrentProvider();
    validateAPIKeys(provider);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current provider configuration status
 */
export function getProviderStatus(): {
  provider: AIProvider;
  configured: boolean;
  availableModels: string[];
  error?: string;
} {
  const provider = getCurrentProvider();

  try {
    validateAPIKeys(provider);
    return {
      provider,
      configured: true,
      availableModels: getAvailableModels(),
    };
  } catch (_error) {
    return {
      provider,
      configured: false,
      availableModels: [],
      error: _error instanceof Error ? _error.message : 'Unknown error',
    };
  }
}