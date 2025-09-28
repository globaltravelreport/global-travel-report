import { NextRequest, NextResponse } from 'next/server';
import { NewsletterService } from '@/src/services/newsletterService';

/**
 * Newsletter Subscription API
 * POST /api/newsletter/subscribe
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, preferences, source } = body;

    // Validate required fields
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    const newsletterService = NewsletterService.getInstance();

    // Subscribe user
    const result = await newsletterService.subscribeUser(
      email,
      {
        ...preferences,
        firstName,
        lastName
      },
      source || 'website'
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Successfully subscribed to newsletter!',
        subscriber: result.subscriber
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to get newsletter statistics
 */
export async function GET() {
  try {
    const newsletterService = NewsletterService.getInstance();
    const stats = await newsletterService.getSubscriberStats();

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting newsletter stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}