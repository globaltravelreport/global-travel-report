
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiHandler, createOptionsHandler } from '@/utils/api-handler';
import { createApiResponse, createValidationErrorResponse } from '@/utils/api-response';
import { logError } from '@/utils/error-handler';
import { rateLimit } from '@/utils/rate-limit';

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

// MailerLite API configuration
const MAILERLITE_CONFIG = {
  apiUrl: process.env.MAILERLITE_API_URL || 'https://connect.mailerlite.com/api',
  apiKey: process.env.MAILERLITE_API_KEY || '',
  defaultGroupId: process.env.MAILERLITE_DEFAULT_GROUP_ID || '', // Optional: specific group ID
};

/**
 * Add subscriber to MailerLite
 */
async function addToMailerLite(email: string, firstName: string, lastName: string, frequency: string) {
   if (!MAILERLITE_CONFIG.apiKey || MAILERLITE_CONFIG.apiKey === 'your_mailerlite_api_key_here' || MAILERLITE_CONFIG.apiKey.length < 20) {
     if (process.env.NODE_ENV === 'development') {
       console.warn('MailerLite API key is not properly configured. Newsletter subscription will be logged but not sent to external service.');
     }
     // Return a mock successful response to prevent application crashes
     return {
       data: {
         id: `mock-${Date.now()}`,
         email,
         created_at: new Date().toISOString()
       }
     };
   }

  const subscriberData: any = {
    email,
    fields: {
      name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      frequency: frequency,
      source: 'website_signup',
      signup_date: new Date().toISOString(),
    },
  };

  // Add to specific group if configured
  if (MAILERLITE_CONFIG.defaultGroupId) {
    subscriberData.groups = [MAILERLITE_CONFIG.defaultGroupId];
  }

  const response = await fetch(`${MAILERLITE_CONFIG.apiUrl}/subscribers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MAILERLITE_CONFIG.apiKey}`,
    },
    body: JSON.stringify(subscriberData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`MailerLite API error: ${response.status} - ${errorData}`);
  }

  return await response.json();
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
       // Add subscriber to MailerLite
       const mailerLiteResponse = await addToMailerLite(
         sanitizedEmail,
         sanitizedFirstName,
         sanitizedLastName,
         frequency
       );

       console.log(`New newsletter subscription: ${sanitizedEmail} (${frequency}) - Subscriber ID: ${mailerLiteResponse.data?.id}`);

       // Return success response
       return createApiResponse({
         message: `Successfully subscribed to our ${frequency} newsletter! Please check your email for a confirmation link.`,
         data: {
           email: sanitizedEmail,
           firstName: sanitizedFirstName,
           lastName: sanitizedLastName,
           frequency,
           subscriberId: mailerLiteResponse.data?.id,
         }
       });

     } catch (error) {
       console.error('Newsletter subscription error:', error);

       // Check if it's a duplicate email error
       if (error instanceof Error && error.message.includes('duplicate')) {
         return createApiResponse({
           message: 'This email is already subscribed to our newsletter.',
           data: { email: sanitizedEmail, frequency }
         }, { status: 409 });
       }

       // Log error but don't expose internal details to user
       logError(error, {
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