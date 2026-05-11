import { NextRequest, NextResponse } from 'next/server';
import { SecureAuth, type UserSession } from './secureAuth';

export function isAuthenticated(request: NextRequest): boolean {
  const auth = SecureAuth.getInstance();
  const session = auth.getSessionFromRequest(request);
  return auth.isAuthenticated(session);
}

export function clearSession(response: NextResponse): NextResponse {
  return SecureAuth.getInstance().clearSession(response);
}

export function getSession(request: NextRequest): UserSession | null {
  return SecureAuth.getInstance().getSessionFromRequest(request);
}

export async function verifyCredentials(username: string, password: string) {
  return SecureAuth.getInstance().verifyCredentials(username, password);
}

export function setSessionCookie(response: NextResponse, session: UserSession): NextResponse {
  return SecureAuth.getInstance().setSessionCookie(response, session);
}
