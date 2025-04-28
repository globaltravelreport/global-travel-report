import { NextResponse } from 'next/server';
import { verifyRecaptcha } from '@/lib/recaptcha';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, recaptchaToken } = body;

    // Verify reCAPTCHA
    const isValid = await verifyRecaptcha(recaptchaToken);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid reCAPTCHA' },
        { status: 400 }
      );
    }

    // Here you would typically add the email to your newsletter list
    // For now, we'll just log it
    console.log('Newsletter signup:', { email });

    return NextResponse.json(
      { message: 'Successfully subscribed to newsletter' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing newsletter signup:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 