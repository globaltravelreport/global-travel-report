import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyRecaptcha } from '@/src/utils/recaptcha';
import { createApiHandler, createOptionsHandler } from '@/src/utils/api-handler';
import { createApiResponse, createValidationErrorResponse } from '@/src/utils/api-response';
import { logError } from '@/src/utils/error-handler';

// Newsletter subscription request schema
const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  recaptchaToken: z.string(),
  csrfToken: z.string().optional(),
});

// Define the request type
type NewsletterRequest = z.infer<typeof newsletterSchema>;

/**
 * Handle OPTIONS requests for CORS preflight
 */
export const OPTIONS = createOptionsHandler();

/**
 * Handle POST requests to the newsletter API
 */
export const POST = createApiHandler<NewsletterRequest>(
  async (req: NextRequest, data: NewsletterRequest) => {
    // Verify reCAPTCHA token
    const isRecaptchaValid = await verifyRecaptcha(data.recaptchaToken);
    if (!isRecaptchaValid) {
      return createValidationErrorResponse('Invalid reCAPTCHA token. Please try again.');
    }

    // TODO: Implement newsletter subscription logic here
    // For now, just return success

    // Return success response
    return createApiResponse({
      message: 'Subscribed successfully! Thank you for joining our newsletter.'
    });
  },
  {
    bodySchema: newsletterSchema,
    enableCors: true,
    maxRetries: 2,
    retryDelay: 1000,
    validateCsrf: true, // Enable CSRF protection
    onError: (error) => {
      logError(error, { context: 'Newsletter subscription' });

      if (error instanceof z.ZodError) {
        return createValidationErrorResponse('Invalid form data. Please check your inputs and try again.', {
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }

      return createApiResponse(
        error,
        {
          status: 500,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }
  }
);