// Additional Zod validation schemas for API routes
import { z } from 'zod';

export const adminLoginSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(8).max(128)
});

export const cronJobSchema = z.object({
  apiKey: z.string().min(32),
  count: z.number().min(1).max(100).optional(),
  cruiseCount: z.number().min(0).max(20).optional()
});

export const statsQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.number().min(1).optional(),
  perPage: z.number().min(1).max(100).optional()
});

export const healthCheckSchema = z.object({
  ping: z.string().optional()
});

export const searchSchema = z.object({
  query: z.string().min(1),
  page: z.number().min(1).optional(),
  perPage: z.number().min(1).max(100).optional()
});

export const fileUploadSchema = z.object({
  file: z.any(),
  type: z.string().min(1),
  size: z.number().max(10 * 1024 * 1024)
});

export const apiKeySchema = z.object({
  apiKey: z.string().min(32)
});

export const rateLimitBypassSchema = z.object({
  apiKey: z.string().min(32),
  reason: z.string().optional()
});

export const errorReportSchema = z.object({
  message: z.string().min(1),
  stack: z.string().optional(),
  context: z.record(z.any()).optional()
});

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters long').max(1000),
  recaptchaToken: z.string().min(1, 'Please complete the reCAPTCHA verification'),
  csrfToken: z.string().min(1, 'CSRF token is required')
});

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  csrfToken: z.string().min(1, 'CSRF token is required')
});
