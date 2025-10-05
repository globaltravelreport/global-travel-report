/**
 * Admin Authentication Middleware
 *
 * Protects admin endpoints with secure authentication and authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { SecureAuth } from '../lib/secureAuth';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    username: string;
    role: 'admin' | 'editor' | 'user';
    permissions: string[];
  };
}

/**
 * Middleware function to require authentication
 */
export function requireAuth(requiredPermissions: string[] = []): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const auth = SecureAuth.getInstance();
      const session = auth.getSessionFromRequest(request);

      if (!auth.isAuthenticated(session)) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(permission =>
          auth.hasPermission(session, permission)
        );

        if (!hasAllPermissions) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // Add user info to request for downstream use
      const authenticatedRequest = request as AuthenticatedRequest;
      if (session) {
        authenticatedRequest.user = {
          userId: session.userId,
          username: session.username,
          role: session.role,
          permissions: session.permissions,
        };
      }

      return NextResponse.next();
    } catch (_error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware function to require admin role
 */
export function requireAdmin(): (request: NextRequest) => Promise<NextResponse> {
  return requireAuth(['manage:system']);
}

/**
 * Middleware function to require editor or admin role
 */
export function requireEditor(): (request: NextRequest) => Promise<NextResponse> {
  return requireAuth(['moderate:submissions']);
}

/**
 * Check if request is from admin
 */
export function isAdminRequest(request: NextRequest): boolean {
  try {
    const auth = SecureAuth.getInstance();
    const session = auth.getSessionFromRequest(request);
    return auth.isAuthenticated(session) && auth.hasPermission(session, 'manage:system');
  } catch {
    return false;
  }
}

/**
 * Get current user from request
 */
export function getCurrentUser(request: NextRequest) {
  try {
    const auth = SecureAuth.getInstance();
    const session = auth.getSessionFromRequest(request);
    return auth.isAuthenticated(session) ? session : null;
  } catch {
    return null;
  }
}