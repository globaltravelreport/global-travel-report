import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export type AppRole = 'admin' | 'editor';

export type AuthorizedUser = {
  id: string;
  email: string | undefined;
  role: AppRole;
};

/**
 * Reads the Supabase session and the database-owned application role.
 * Roles deliberately live in a protected table rather than user_metadata,
 * which users can modify themselves.
 */
export async function getAuthorizedUser(): Promise<AuthorizedUser | null> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data: roleRecord, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (roleError || !roleRecord || (roleRecord.role !== 'admin' && roleRecord.role !== 'editor')) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: roleRecord.role,
  };
}

export async function requireRole(...roles: AppRole[]): Promise<AuthorizedUser | NextResponse> {
  const user = await getAuthorizedUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  if (!roles.includes(user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  return user;
}

export async function requireAdmin(): Promise<AuthorizedUser | NextResponse> {
  return requireRole('admin');
}

export function isAuthorizationResponse(value: AuthorizedUser | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
