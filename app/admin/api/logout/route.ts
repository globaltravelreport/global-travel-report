import { NextRequest, NextResponse } from 'next/server';
import { SecureAuth } from '../../../../src/lib/secureAuth';

export async function POST(_request: NextRequest) {
  try {
    const auth = SecureAuth.getInstance();
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear the session cookie
    auth.clearSession(response);

    return response;
  } catch (_error) {
    console.error(_error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}