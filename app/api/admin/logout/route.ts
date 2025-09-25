
import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function POST(_request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    clearSession(response);
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
