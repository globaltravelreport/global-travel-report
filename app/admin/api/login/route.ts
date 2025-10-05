import { NextRequest, NextResponse } from 'next/server';
import { SecureAuth } from '../../../../src/lib/secureAuth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const auth = SecureAuth.getInstance();
    const result = await auth.verifyCredentials(username, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create response and set session cookie
    const response = NextResponse.json(
      { success: true, message: 'Authentication successful' },
      { status: 200 }
    );

    if (result.session) {
      auth.setSessionCookie(response, result.session);
    }

    return response;
  } catch (_error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}
