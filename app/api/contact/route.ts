// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { verifyRecaptcha } from '@/src/utils/recaptcha';
import { ContactFormRequest,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ContactFormResponse
} from '@/src/api/types';
import { contactFormSchema } from '@/src/utils/validation';
import { createApiResponse, createValidationErrorResponse } from '@/src/utils/api-response';
import { logError } from '@/src/utils/error-handler';
import { createApiHandler, createOptionsHandler } from '@/src/utils/api-handler';
import config from '@/src/config';
import nodemailer from 'nodemailer';

/**
 * Send an email using nodemailer
 * @param data - The validated contact form data
 * @returns Promise resolving to a boolean indicating success
 */
async function sendEmail(data: ContactFormRequest): Promise<boolean> {
  try {
    // Create a transporter using SMTP configuration
    const transporter = nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: config.email.smtp.secure,
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.pass,
      },
    });

    // Send the email
    await transporter.sendMail({
      from: config.email.from,
      to: config.email.contact,
      subject: `Contact Form: ${data.subject || 'New message from website'}`,
      text: `
Name: ${data.name}
Email: ${data.email}

Message:
${data.message}
      `,
      html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${data.name}</p>
<p><strong>Email:</strong> ${data.email}</p>
<p><strong>Subject:</strong> ${data.subject || 'N/A'}</p>
<h3>Message:</h3>
<p>${data.message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
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
  async (req: NextRequest, data: ContactFormRequest) => {
    // Verify reCAPTCHA token
    const isRecaptchaValid = await verifyRecaptcha(data.recaptchaToken);
    if (!isRecaptchaValid) {
      return createValidationErrorResponse('Invalid reCAPTCHA token. Please try again.');
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
    bodySchema: contactFormSchema,
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