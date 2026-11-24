/**
 * @jest-environment node
 */
import { requiresAuthSession } from '@/lib/requires-auth-session';

describe('requiresAuthSession', () => {
  it('skips Supabase Auth refresh on anonymous public pages', () => {
    expect(requiresAuthSession('/')).toBe(false);
    expect(requiresAuthSession('/stories')).toBe(false);
    expect(requiresAuthSession('/stories/canadian-rockies')).toBe(false);
    expect(requiresAuthSession('/categories/cruise')).toBe(false);
    expect(requiresAuthSession('/countries/australia')).toBe(false);
    expect(requiresAuthSession('/rss.xml')).toBe(false);
    expect(requiresAuthSession('/api/stories')).toBe(false);
    expect(requiresAuthSession('/api/feed/rss')).toBe(false);
  });

  it('still refreshes the session on admin, login, and auth routes', () => {
    expect(requiresAuthSession('/admin')).toBe(true);
    expect(requiresAuthSession('/admin/story-drafts')).toBe(true);
    expect(requiresAuthSession('/login')).toBe(true);
    expect(requiresAuthSession('/dashboard')).toBe(true);
    expect(requiresAuthSession('/auth/callback')).toBe(true);
    expect(requiresAuthSession('/api/admin/publish')).toBe(true);
  });
});
