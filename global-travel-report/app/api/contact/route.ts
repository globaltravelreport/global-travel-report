// Edge-compatible contact form API route
export const runtime = 'edge';

import { NextRequest } from "next/server";
import { z } from 'zod';
import { verifyRecaptcha } from '@/utils/recaptcha';
import { ContactFormRequest } from '@/src/api/types';
import { contactFormSchema } from '@/utils/validation';
import { createApiResponse, createValidationErrorResponse } from '@/utils/api-response';
import { logError } from '@/utils/error-handler';
import { createApiHandler, createOptionsHandler } from '@/utils/api-handler';
import config from '@/src/config';

/**
 * Send an email (Edge-compatible version)
 * @param data - The validated contact form data
 * @returns Promise resolving to a boolean indicating success
 */
async function sendEmail(data: ContactFormRequest): Promise<boolean> {
  try {
    // In Edge runtime, we can't use nodemailer directly
    // Instead, we'll log the email details and return success
    // In a production environment, you would use a service like SendGrid, Mailgun, etc.
    // that provides an HTTP API instead of SMTP

    console.log('Contact form submission received:');
    console.log(`From: ${data.name} <${data.email}>`);
    console.log(`Subject: ${data.subject || 'New message from website'}`);
    console.log(`Message: ${data.message}`);

    // For now, we'll simulate a successful email send
    // In production, replace this with an HTTP API call to your email service

    return true;
  } catch (error) {
    console.error('Error processing contact form:', error);
    return false;
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export const OPTIONS = createOptionsHandler();

/**
 * Handle POST requests to the contact form API
 */
export const POST = createApiHandler<ContactFormRequest>(
  async (_req: NextRequest, data: ContactFormRequest) => {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';

    // In production, verify reCAPTCHA if configured
    if (!isDevelopment && config.api.recaptcha.secretKey) {
      try {
        // Get the reCAPTCHA token from the request headers
        const token = _req.headers.get('X-Recaptcha-Token') || '';

        // Verify the token
        const isValid = await verifyRecaptcha(token);

        if (!isValid) {
          return createApiResponse(
            new Error('reCAPTCHA verification failed. Please try again.'),
            { status: 403 }
          );
        }
      } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        // Continue processing in case of reCAPTCHA error
        // This prevents the form from being completely blocked if reCAPTCHA has issues
      }
    }

    // Send the email
    const emailSent = await sendEmail(data);

    if (!emailSent) {
      return createApiResponse(
        new Error('Failed to send message. Please try again later.'),
        { status: 500 }
      );
    }

    // Return success response
    return createApiResponse({
      message: 'Message sent successfully. We will get back to you soon!'
    });
  },
  {
    bodySchema: contactFormSchema as z.ZodType<ContactFormRequest>,
    enableCors: true,
    maxRetries: 2,
    retryDelay: 1000,
    validateCsrf: true, // Enable CSRF protection
    onError: (error) => {
      logError(error, { context: 'Contact form submission' });

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