import { NextResponse } from 'next/server';

/**
 * Leftover /api/newsletter/subscribe callers go through the real Brevo
 * handler. The in-memory fake drip is gone. Do not restore it.
 */
export { POST, OPTIONS } from '../route';

export async function GET() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
