
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_COOKIE_NAME = 'admin-session';
const _SESSION_SECRET = process.env.SESSION_SECRET;

export interface AdminSession {
  username: string;
  loginTime: number;
  expiresAt: number;
}

/**
 * Verify admin credentials
 */
export function verifyCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

/**
 * Create admin session
 */
export function createSession(username: string): AdminSession {
  const now = Date.now();
  return {
    username,
    loginTime: now,
    expiresAt: now + (24 * 60 * 60 * 1000), // 24 hours
  };
}

/**
 * Set session cookie
 */
export function setSessionCookie(response: NextResponse, session: AdminSession): void {
  const sessionData = JSON.stringify(session);
  response.cookies.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });
}

/**
 * Get session from cookies
 */
export async function getSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie?.value) {
      return null;
    }

    const session: AdminSession = JSON.parse(sessionCookie.value);
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Clear session cookie
 */
export function clearSession(response?: NextResponse): void {
  if (response) {
    response.cookies.delete(SESSION_COOKIE_NAME);
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Middleware helper to protect admin routes
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  return null;
}
