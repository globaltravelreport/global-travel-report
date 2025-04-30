/**
 * Validation utilities using Zod
 */

import { z } from 'zod';

/**
 * Contact form validation schema
 */
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  subject: z.string()
    .min(2, 'Subject must be at least 2 characters')
    .max(200, 'Subject must be less than 200 characters')
    .optional(),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be less than 5000 characters'),
  recaptchaToken: z.string(),
});

/**
 * Newsletter subscription validation schema
 */
export const newsletterSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  name: z.string()
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  recaptchaToken: z.string(),
});

/**
 * Story submission validation schema
 */
export const storySubmissionSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  excerpt: z.string()
    .min(10, 'Excerpt must be at least 10 characters')
    .max(300, 'Excerpt must be less than 300 characters'),
  content: z.string()
    .min(100, 'Content must be at least 100 characters')
    .max(50000, 'Content must be less than 50,000 characters'),
  author: z.string()
    .min(2, 'Author name must be at least 2 characters')
    .max(100, 'Author name must be less than 100 characters'),
  category: z.string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must be less than 50 characters'),
  country: z.string()
    .min(2, 'Country must be at least 2 characters')
    .max(50, 'Country must be less than 50 characters'),
  tags: z.array(z.string())
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  recaptchaToken: z.string(),
});

/**
 * Comment validation schema
 */
export const commentSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  comment: z.string()
    .min(5, 'Comment must be at least 5 characters')
    .max(1000, 'Comment must be less than 1000 characters'),
  storyId: z.string(),
  recaptchaToken: z.string(),
});

/**
 * Search query validation schema
 */
export const searchQuerySchema = z.object({
  query: z.string()
    .min(2, 'Search query must be at least 2 characters')
    .max(100, 'Search query must be less than 100 characters'),
  category: z.string().optional(),
  country: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(50).optional(),
});

/**
 * Validate data against a schema and return the result
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns An object with validation result
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; errors?: z.ZodError } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}
