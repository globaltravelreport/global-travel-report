import { NextRequest, NextResponse } from 'next/server';
import { CreateUserSubmissionData, UserSubmission } from '@/types/UserSubmission';
import { sendSubmissionNotification } from '@/services/brevoService';
import { requireEditor } from '@/src/middleware/admin-auth';
import DOMPurify from 'isomorphic-dompurify';

/**
 * POST /api/submissions
 * Handle new story submissions from users
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract form data
    const {
      name,
      email,
      title,
      content,
      category,
      country,
      tags,
      recaptchaToken
    } = body;

    // Validate required fields
    if (!name || !email || !title || !content || !category || !country || !tags) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate reCAPTCHA
    if (!recaptchaToken) {
      return NextResponse.json(
        { error: 'Please complete the reCAPTCHA verification' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA token
    try {
      const recaptchaResponse = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
        { method: 'POST' }
      );

      const recaptchaResult = await recaptchaResponse.json();

      if (!recaptchaResult.success) {
        return NextResponse.json(
          { error: 'reCAPTCHA verification failed. Please try again.' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return NextResponse.json(
        { error: 'Verification failed. Please try again.' },
        { status: 500 }
      );
    }

    // Sanitize user input to prevent XSS
    const sanitizedData: CreateUserSubmissionData = {
      name: DOMPurify.sanitize(name).trim(),
      email: DOMPurify.sanitize(email).toLowerCase().trim(),
      title: DOMPurify.sanitize(title).trim(),
      content: DOMPurify.sanitize(content).trim(),
      category: DOMPurify.sanitize(category).trim(),
      country: DOMPurify.sanitize(country).trim(),
      tags: tags.split(',').map((tag: string) => DOMPurify.sanitize(tag).trim()).filter(Boolean)
    };

    // Validate sanitized content
    if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.title || !sanitizedData.content) {
      return NextResponse.json(
        { error: 'Invalid content detected. Please check your input and try again.' },
        { status: 400 }
      );
    }

    // Create submission object
    const submission: UserSubmission = {
      id: `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...sanitizedData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Store in database (using StoryDatabase for now, but could be moved to dedicated collection)
    const { StoryDatabase } = await import('@/src/services/storyDatabase');
    const db = StoryDatabase.getInstance();

    // Store submission in a separate collection
    await db.storeSubmission(submission);

    // Send notification emails via Brevo
    try {
      await sendSubmissionNotification(submission);
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the submission if email fails, but log it
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your submission! Our editorial team will review it and get back to you soon.',
      submissionId: submission.id
    });

  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/submissions
 * Get all user submissions (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const auth = (await import('@/src/lib/secureAuth')).SecureAuth.getInstance();
    const session = auth.getSessionFromRequest(request);

    if (!auth.isAuthenticated(session) || !auth.hasPermission(session, 'moderate:submissions')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected', or null for all

    const { StoryDatabase } = await import('@/src/services/storyDatabase');
    const db = StoryDatabase.getInstance();

    const submissions = await db.getAllSubmissions(status as any);

    return NextResponse.json({
      success: true,
      submissions
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}