import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Completely disable middleware by default
export const config = {
  matcher: [], // Empty matcher means middleware won't run for any routes
};

// Simple pass-through middleware that doesn't do anything
export function middleware(request: NextRequest) {
  return NextResponse.next();
}
