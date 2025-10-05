export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptcha } from '@/utils/recaptcha';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token is required' },
        { status: 400 }
      );
    }

    const isValid = await verifyRecaptcha(token);

    if (isValid) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid reCAPTCHA token' },
        { status: 400 }
      );
    }
  } catch (_error) {
    console.error('Error verifying reCAPTCHA:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        error: JSON.stringify(error)
      },
      { status: 500 }
    );
  }
}
