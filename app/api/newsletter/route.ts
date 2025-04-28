import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyRecaptcha } from '@/lib/recaptcha';

const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  recaptchaToken: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = newsletterSchema.parse(body);

    const isRecaptchaValid = await verifyRecaptcha(validatedData.recaptchaToken);
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { error: 'Invalid reCAPTCHA token' },
        { status: 400 }
      );
    }

    // TODO: Implement newsletter subscription logic here
    // For now, just return success
    return NextResponse.json({ message: 'Subscribed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 