/**
 * Only admin/login/auth routes should refresh a Supabase session.
 * Public pages must not call Auth for anonymous visitors (egress + cache).
 */
export function requiresAuthSession(pathname: string): boolean {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/auth')
  );
}
