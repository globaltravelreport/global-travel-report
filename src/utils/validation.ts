/**
 * Validation utilities using Zod for runtime type checking
 */
import { z } from 'zod';
import { createValidationError } from './enhanced-error-handler';

/**
 * Validate data against a Zod schema
 *
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @param errorMessage - Optional custom error message
 * @returns The validated data
 * @throws ValidationError if validation fails
 */
export function validateWithZod<T>(
  schema: z.ZodType<T>,
  data: unknown,
  errorMessage: string = 'Validation failed'
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createValidationError(
        errorMessage,
        {
          errors: error.errors,
          formattedErrors: formatZodErrors(error),
        }
      );
    }
    throw error;
  }
}

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

/**
 * Validate data against a Zod schema and return a result object
 *
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns An object with success status, data, and errors
 */
export function validateWithResult<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: boolean; data?: T; errors?: Record<string, string[]> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: formatZodErrors(result.error),
  };
}

/**
 * Format Zod errors into a more user-friendly format
 *
 * @param error - The Zod error
 * @returns A record of field names to error messages
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.errors) {
    const path = issue.path.join('.');
    const field = path || 'general';

    if (!errors[field]) {
      errors[field] = [];
    }

    errors[field].push(issue.message);
  }

  return errors;
}

/**
 * Get a flat list of error messages from a Zod error
 *
 * @param error - The Zod error
 * @returns An array of error messages
 */
export function getZodErrorMessages(error: z.ZodError): string[] {
  return error.errors.map(issue => issue.message);
}

/**
 * Common Zod schemas for reuse
 */
export const CommonSchemas = {
  /**
   * Schema for a non-empty string
   */
  nonEmptyString: z.string().min(1, 'This field cannot be empty'),

  /**
   * Schema for an email address
   */
  email: z.string().email('Invalid email address'),

  /**
   * Schema for a URL
   */
  url: z.string().url('Invalid URL'),

  /**
   * Schema for a date string
   */
  dateString: z.string().refine(
    (value) => !isNaN(Date.parse(value)),
    { message: 'Invalid date format' }
  ),

  /**
   * Schema for a date object
   */
  date: z.date(),

  /**
   * Schema for a positive number
   */
  positiveNumber: z.number().positive('Number must be positive'),

  /**
   * Schema for a non-negative number
   */
  nonNegativeNumber: z.number().min(0, 'Number must be non-negative'),

  /**
   * Schema for an integer
   */
  integer: z.number().int('Number must be an integer'),

  /**
   * Schema for a positive integer
   */
  positiveInteger: z.number().int('Number must be an integer').positive('Number must be positive'),

  /**
   * Schema for a UUID
   */
  uuid: z.string().uuid('Invalid UUID format'),

  /**
   * Schema for a slug (URL-friendly string)
   */
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
};

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
  recaptchaToken: z.string().optional(),
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
  recaptchaToken: z.string().optional(),
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
  recaptchaToken: z.string().optional(),
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
  recaptchaToken: z.string().optional(),
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
 * Create a schema for a Story object
 */
export const StorySchema = z.object({
  title: CommonSchemas.nonEmptyString,
  slug: CommonSchemas.slug,
  summary: CommonSchemas.nonEmptyString,
  content: CommonSchemas.nonEmptyString,
  date: CommonSchemas.dateString,
  lastModified: CommonSchemas.dateString.optional(),
  author: CommonSchemas.nonEmptyString.optional(),
  country: CommonSchemas.nonEmptyString,
  type: CommonSchemas.nonEmptyString,
  keywords: z.array(z.string()).optional(),
  image: CommonSchemas.url.optional(),
  photographer: z.string().optional(),
  photographerUrl: CommonSchemas.url.optional(),
  featured: z.boolean().optional(),
  editorsPick: z.boolean().optional(),
});
