import { NextResponse } from 'next/server';
import { verifyRecaptcha } from '@/lib/recaptcha';

export async function POST(request: Request) {
  try {
    const { email, recaptchaToken } = await request.json();

    // Verify reCAPTCHA
    const isValid = await verifyRecaptcha(recaptchaToken);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid reCAPTCHA' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Add the email to your newsletter service (e.g., Mailchimp, SendGrid)
    // 2. Store the subscription in a database
    // 3. Send a welcome email

    // For now, we'll just log it
    console.log('Newsletter subscription:', { email });

    return NextResponse.json(
      { message: 'Subscribed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing newsletter subscription:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
} 