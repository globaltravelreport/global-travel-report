import { NextRequest, NextResponse } from 'next/server';
import { createCsrfToken } from '@/src/utils/csrf';

/**
 * GET handler for CSRF token endpoint
 * @param req - The request object
 * @returns Response with a new CSRF token
 */
export async function GET(req: NextRequest) {
  // Generate a new CSRF token
  const token = createCsrfToken();
  
  // Return the token
  return NextResponse.json(
    { token },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}
