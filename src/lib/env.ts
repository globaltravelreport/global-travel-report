/**
 * Environment variable validation and configuration
 *
 * Ensures all required environment variables are present and valid
 */

import { z } from 'zod';

// Environment schema validation
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().optional(),

  // Authentication
  AUTH_ENCRYPTION_KEY: z.string().min(16).default('fallback-encryption-key-change-in-production-32-chars-minimum'),
  ADMIN_USERNAME: z.string().min(1).optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  EDITOR_USERNAME: z.string().min(1).optional(),
  EDITOR_PASSWORD: z.string().min(8).optional(),

  // External APIs
  NEXT_PUBLIC_GA_ID: z.string().regex(/^G-[A-Z0-9]+$/).optional(),
  UNSPLASH_ACCESS_KEY: z.string().optional(),
  BREVO_API_KEY: z.string().optional(),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Security
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // Application
  NEXT_PUBLIC_BASE_URL: z.string().url().default('https://globaltravelreport.com'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),

  // Optional features
  ENABLE_ANALYTICS: z.coerce.boolean().default(true),
  ENABLE_NEWSLETTER: z.coerce.boolean().default(false),
  ENABLE_AFFILIATES: z.coerce.boolean().default(true),
});

type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 */
function validateEnv(): EnvConfig {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (_error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Invalid environment configuration');
  }
}

/**
 * Get validated environment configuration
 */
export const env = validateEnv();

/**
 * Check if we're in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if we're in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Get required environment variables with helpful error messages
 */
export function requireEnv(key: keyof EnvConfig, description: string): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is missing: ${description}`);
  }
  return value as string;
}

/**
 * Get optional environment variables with defaults
 */
export function getEnv(key: keyof EnvConfig, defaultValue: string = ''): string {
  return (env[key] as string) || defaultValue;
}