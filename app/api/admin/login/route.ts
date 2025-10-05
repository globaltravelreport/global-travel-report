import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, createSession, setSessionCookie } from '@/lib/auth';
import { adminLoginSchema } from '@/src/utils/validation-schemas';
import { applyRateLimit } from '@/src/middleware/rate-limit';
import { trackSecurityEvent } from '@/src/utils/security-monitor';

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';

  try {
    const body = await request.json();
    const parseResult = adminLoginSchema.safeParse(body);
    if (!parseResult.success) {
      trackSecurityEvent({
        type: 'validation_failure',
        ip,
        userAgent,
        details: parseResult.error,
      });
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { username, password } = parseResult.data;

    // CSRF token validation (assume token in header for demo)
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken) {
      trackSecurityEvent({
        type: 'suspicious_request',
        ip,
        userAgent,
        details: 'Missing CSRF token',
      });
      return NextResponse.json({ error: 'Missing CSRF token' }, { status: 403 });
    }

    // Verify credentials
    if (!verifyCredentials(username, password)) {
      trackSecurityEvent({
        type: 'failed_login',
        ip,
        userAgent,
        details: { username },
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create session
    const session = createSession(username);
    const response = NextResponse.json({ success: true });
    setSessionCookie(response, session);
    trackSecurityEvent({
      type: 'authentication',
      ip,
      userAgent,
      details: { username, event: 'login_success' },
    });
    return response;
  } catch (_error) {
    trackSecurityEvent({ type: 'error', ip, userAgent, details: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
