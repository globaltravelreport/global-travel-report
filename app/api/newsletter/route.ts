
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiHandler, createOptionsHandler } from '@/utils/api-handler';
import { createApiResponse, createValidationErrorResponse } from '@/utils/api-response';
import { logError } from '@/utils/error-handler';
import { rateLimit } from '@/utils/rate-limit';
import { BrevoService } from '@/services/brevoService';

// Newsletter subscription request schema with enhanced validation
const newsletterSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  honeypot: z.string().max(0, 'Bot detected'), // Honeypot field - should be empty
  csrfToken: z.string().optional(),
});

// Define the request type
type NewsletterRequest = z.infer<typeof newsletterSchema>;

// Newsletter service configuration (currently using mock responses)

/**
 * Add subscriber to Brevo newsletter service
 */
async function addToNewsletterService(email: string, firstName: string, lastName: string, frequency: string) {
   const brevoService = BrevoService.getInstance();

   // Add contact to Brevo
   const result = await brevoService.addContact({
     email,
     attributes: {
       FIRSTNAME: firstName,
       LASTNAME: lastName,
       SUBSCRIPTION_DATE: new Date().toISOString(),
       SOURCE: 'website_signup',
       PREFERENCES: frequency,
     },
     listIds: [2], // Newsletter list ID
     updateEnabled: true,
   });

   if (!result.success) {
     throw new Error(result.error || 'Failed to add subscriber to Brevo');
   }

   return result;
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export const OPTIONS = createOptionsHandler();

/**
 * Handle POST requests to the newsletter API
 */
export const POST = createApiHandler<NewsletterRequest>(
  async (req: NextRequest, data: NewsletterRequest) => {
    // Apply rate limiting (max 5 requests per minute per IP)
    const rateLimitResult = await rateLimit(req, {
      maxRequests: 5,
      windowMs: 60 * 1000, // 1 minute
    });

    if (!rateLimitResult.success) {
      return createApiResponse(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Extract and sanitize data from the request
    const { email, firstName, lastName, frequency = 'weekly', honeypot } = data;

    // Honeypot validation - if filled, it's likely a bot
    if (honeypot && honeypot.length > 0) {
      console.log(`Bot detected: honeypot field filled with "${honeypot}"`);
      // Return success to avoid revealing the honeypot
      return createApiResponse({
        message: 'Subscribed successfully! Please check your email for confirmation.',
        data: { email, frequency }
      });
    }

    // Additional input sanitization
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedFirstName = firstName.trim().replace(/[<>]/g, '');
    const sanitizedLastName = lastName.trim().replace(/[<>]/g, '');

    try {
       // Add subscriber to newsletter service
       const newsletterResponse = await addToNewsletterService(
         sanitizedEmail,
         sanitizedFirstName,
         sanitizedLastName,
         frequency
       );

       console.log(`New newsletter subscription: ${sanitizedEmail} (${frequency}) - Subscriber ID: ${newsletterResponse.data?.id}`);

       // Return success response
       return createApiResponse({
         message: `Successfully subscribed to our ${frequency} newsletter! Please check your email for a confirmation link.`,
         data: {
           email: sanitizedEmail,
           firstName: sanitizedFirstName,
           lastName: sanitizedLastName,
           frequency,
           subscriberId: newsletterResponse.data?.id,
         }
       });

     } catch (_error) {
       console.error(_error);

       // Check if it's a duplicate email error
       if (_error instanceof Error && _error.message.includes('duplicate')) {
         return createApiResponse({
           message: 'This email is already subscribed to our newsletter.',
           data: { email: sanitizedEmail, frequency }
         }, { status: 409 });
       }

       // Log error but don't expose internal details to user
       logError(_error, {
         context: 'Newsletter subscription',
         additionalData: { email: sanitizedEmail, frequency }
       });

       // Return a graceful error response instead of crashing
       return createApiResponse({
         message: 'Thank you for your interest! We\'ll add you to our newsletter list.',
         data: { email: sanitizedEmail, frequency }
       });
     }
  },
  {
    bodySchema: newsletterSchema,
    enableCors: true,
    maxRetries: 2,
    retryDelay: 1000,
    validateCsrf: true,
    onError: (error) => {
      logError(error, { context: 'Newsletter subscription API' });

      if (error instanceof z.ZodError) {
        return createValidationErrorResponse('Invalid form data. Please check your inputs and try again.', {
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }

      return createApiResponse(
        { error: 'An error occurred while processing your subscription. Please try again.' },
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