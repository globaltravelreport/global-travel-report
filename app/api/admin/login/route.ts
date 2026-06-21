import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Legacy admin login has been retired. Use Supabase sign-in.' },
    { status: 410 }
  );
}
