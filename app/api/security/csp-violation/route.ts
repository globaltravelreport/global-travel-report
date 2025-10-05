import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let violation;
    if (contentType.includes('application/csp-report')) {
      // CSP reports are sent with Content-Type: application/csp-report
      const body = await request.json();
      violation = body['csp-report'] || body;
    } else {
      // Fallback for other JSON formats
      violation = await request.json();
    }

    // Log the violation (in production, send to monitoring service)
    console.error('CSP Violation:', {
      blockedURI: violation['blocked-uri'] || violation.blockedURI,
      violatedDirective: violation['violated-directive'] || violation.violatedDirective,
      originalPolicy: violation['original-policy'] || violation.originalPolicy,
      documentURI: violation['document-uri'] || violation.documentURI,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    // In production, you could send to monitoring services like:
    // - Sentry
    // - DataDog
    // - CloudWatch
    // - Custom logging service

    return new Response(null, { status: 204 });
  } catch (_error) {
    console.error('Error processing CSP violation:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// Prevent GET requests
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}