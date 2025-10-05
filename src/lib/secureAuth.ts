/**
 * Secure Authentication System
 *
 * Implements secure session management with encryption and proper security measures
 */

import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { env, requireEnv } from './env';

const ALGORITHM = 'aes-256-gcm';
const KEY = requireEnv('AUTH_ENCRYPTION_KEY', 'Encryption key for session data (must be at least 16 characters)');
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export interface UserSession {
  userId: string;
  username: string;
  role: 'admin' | 'editor' | 'user';
  permissions: string[];
  expiresAt: number;
  createdAt: number;
}

export interface AuthConfig {
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  requireMFA: boolean;
}

export class SecureAuth {
  private static instance: SecureAuth | null = null;
  private config: AuthConfig;
  private loginAttempts: Map<string, { count: number; lastAttempt: number; lockedUntil: number }> = new Map();

  private constructor() {
    this.config = {
      sessionTimeout: 480, // 8 hours
      maxLoginAttempts: 5,
      lockoutDuration: 15, // 15 minutes
      requireMFA: false,
    };
  }

  public static getInstance(): SecureAuth {
    if (!SecureAuth.instance) {
      SecureAuth.instance = new SecureAuth();
    }
    return SecureAuth.instance;
  }

  /**
   * Encrypt session data
   */
  private encryptSession(session: UserSession): string {
    try {
      const iv = randomBytes(IV_LENGTH);
      const cipher = createCipheriv(ALGORITHM, Buffer.from(KEY.padEnd(32).slice(0, 32)), iv);

      const sessionString = JSON.stringify(session);
      let encrypted = cipher.update(sessionString, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      // Combine IV, encrypted data, and tag
      const result = Buffer.concat([iv, Buffer.from(encrypted, 'hex'), tag]).toString('base64');

      return result;
    } catch (_error) {
      console.error(_error);
      throw new Error('Session encryption failed');
    }
  }

  /**
   * Decrypt session data
   */
  private decryptSession(encryptedSession: string): UserSession | null {
    try {
      const buffer = Buffer.from(encryptedSession, 'base64');

      if (buffer.length < IV_LENGTH + TAG_LENGTH) {
        throw new Error('Invalid session format');
      }

      const iv = buffer.subarray(0, IV_LENGTH);
      const tag = buffer.subarray(-TAG_LENGTH);
      const encrypted = buffer.subarray(IV_LENGTH, -TAG_LENGTH).toString('hex');

      const decipher = createDecipheriv(ALGORITHM, Buffer.from(KEY.padEnd(32).slice(0, 32)), iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      const session: UserSession = JSON.parse(decrypted);

      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        throw new Error('Session expired');
      }

      return session;
    } catch (_error) {
      console.error(_error);
      return null;
    }
  }

  /**
   * Create a secure session
   */
  public createSession(username: string, role: 'admin' | 'editor' | 'user' = 'user'): UserSession {
    const now = Date.now();
    const session: UserSession = {
      userId: `user_${now}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      role,
      permissions: this.getRolePermissions(role),
      expiresAt: now + (this.config.sessionTimeout * 60 * 1000),
      createdAt: now,
    };

    return session;
  }

  /**
   * Get permissions for role
   */
  private getRolePermissions(role: string): string[] {
    const permissions = {
      user: ['read:stories', 'submit:story'],
      editor: ['read:stories', 'write:stories', 'moderate:submissions', 'read:analytics'],
      admin: ['read:stories', 'write:stories', 'delete:stories', 'moderate:submissions', 'manage:users', 'read:analytics', 'manage:system'],
    };

    return permissions[role as keyof typeof permissions] || permissions.user;
  }

  /**
   * Set secure session cookie
   */
  public setSessionCookie(response: NextResponse, session: UserSession): NextResponse {
    const encryptedSession = this.encryptSession(session);

    response.cookies.set('auth_session', encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: this.config.sessionTimeout * 60,
      path: '/',
    });

    return response;
  }

  /**
   * Get session from request
   */
  public getSessionFromRequest(request: NextRequest): UserSession | null {
    try {
      const sessionCookie = request.cookies.get('auth_session')?.value;

      if (!sessionCookie) {
        return null;
      }

      return this.decryptSession(sessionCookie);
    } catch (_error) {
      console.error(_error);
      return null;
    }
  }

  /**
   * Verify user credentials with rate limiting
   */
  public async verifyCredentials(username: string, password: string): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    // Check for account lockout
    const attempts = this.loginAttempts.get(username);
    const now = Date.now();

    if (attempts && attempts.lockedUntil > now) {
      const remainingTime = Math.ceil((attempts.lockedUntil - now) / 60000);
      return {
        success: false,
        error: `Account locked. Try again in ${remainingTime} minutes.`,
      };
    }

    // Get credentials from validated environment
    const validCredentials: Record<string, string> = {};

    // Only add credentials if they exist in environment
    if (env.ADMIN_USERNAME && env.ADMIN_PASSWORD) {
      validCredentials[env.ADMIN_USERNAME] = env.ADMIN_PASSWORD;
    }
    if (env.EDITOR_USERNAME && env.EDITOR_PASSWORD) {
      validCredentials[env.EDITOR_USERNAME] = env.EDITOR_PASSWORD;
    }

    // Fallback for development/build time (should be overridden in production)
    if (Object.keys(validCredentials).length === 0) {
      console.warn('⚠️  No admin credentials configured. Using fallback credentials for build/development.');
      validCredentials.admin = 'secure_password_123';
      validCredentials.editor = 'editor_pass_456';
    }

    const expectedPassword = validCredentials[username];

    if (!expectedPassword || password !== expectedPassword) {
      // Record failed attempt
      const currentAttempts = attempts || { count: 0, lastAttempt: 0, lockedUntil: 0 };
      currentAttempts.count++;
      currentAttempts.lastAttempt = now;

      if (currentAttempts.count >= this.config.maxLoginAttempts) {
        currentAttempts.lockedUntil = now + (this.config.lockoutDuration * 60 * 1000);
      }

      this.loginAttempts.set(username, currentAttempts);

      return {
        success: false,
        error: 'Invalid credentials',
      };
    }

    // Clear failed attempts on successful login
    this.loginAttempts.delete(username);

    // Create session
    const role = username === 'admin' ? 'admin' : username === 'editor' ? 'editor' : 'user';
    const session = this.createSession(username, role);

    return {
      success: true,
      session,
    };
  }

  /**
   * Check if user has permission
   */
  public hasPermission(session: UserSession | null, permission: string): boolean {
    if (!session) return false;
    return session.permissions.includes(permission);
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(session: UserSession | null): boolean {
    return session !== null && Date.now() < session.expiresAt;
  }

  /**
   * Clear session
   */
  public clearSession(response: NextResponse): NextResponse {
    response.cookies.set('auth_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  }

  /**
   * Middleware function for protecting routes
   */
  public requireAuth(requiredPermissions: string[] = []): (request: NextRequest) => Promise<NextResponse> {
    return async (request: NextRequest): Promise<NextResponse> => {
      const session = this.getSessionFromRequest(request);

      if (!this.isAuthenticated(session)) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(permission =>
          this.hasPermission(session, permission)
        );

        if (!hasAllPermissions) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      return NextResponse.next();
    };
  }

  /**
   * Get user statistics
   */
  public getAuthStats(): {
    activeSessions: number;
    lockedAccounts: number;
    totalLoginAttempts: number;
  } {
    const now = Date.now();
    let lockedAccounts = 0;

    for (const [username, attempts] of this.loginAttempts.entries()) {
      if (attempts.lockedUntil > now) {
        lockedAccounts++;
      }
    }

    return {
      activeSessions: 0, // Would track real sessions
      lockedAccounts,
      totalLoginAttempts: this.loginAttempts.size,
    };
  }
}