/**
 * @jest-environment node
 */
import {
  STORY_DETAIL_SELECT,
  STORY_LIST_LIMIT,
  STORY_LIST_SELECT,
  SupabaseStoryStore,
} from '@/src/services/supabaseStoryStore';

describe('SupabaseStoryStore egress diet', () => {
  const originalFetch = global.fetch;
  const fetchMock = jest.fn();

  beforeAll(() => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  });

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '[]',
    });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  function lastRequest(): { url: URL; init: RequestInit & { next?: { revalidate?: number; tags?: string[] } } } {
    expect(fetchMock).toHaveBeenCalled();
    const [url, init] = fetchMock.mock.calls[0];
    return { url: new URL(String(url)), init: init || {} };
  }

  it('lists published stories without article HTML and with a public cache policy', async () => {
    await SupabaseStoryStore.getPublishedStories();
    const { url, init } = lastRequest();

    expect(url.pathname).toBe('/rest/v1/stories');
    expect(url.searchParams.get('select')).toBe(STORY_LIST_SELECT);
    expect(url.searchParams.get('select')).not.toMatch(/(^|,)content(,|$)/);
    expect(url.searchParams.get('limit')).toBe(String(STORY_LIST_LIMIT));
    expect(url.searchParams.get('status')).toBe('eq.published');
    expect(init.cache).toBeUndefined();
    expect(init.next).toEqual({ revalidate: 60, tags: ['stories'] });
  });

  it('can scope homepage lists by recency and a tighter limit', async () => {
    await SupabaseStoryStore.getPublishedStories({
      limit: 24,
      publishedAfter: '2026-11-16T00:00:00.000Z',
    });
    const { url } = lastRequest();

    expect(url.searchParams.get('limit')).toBe('24');
    expect(url.searchParams.get('published_at')).toBe('gte.2026-11-16T00:00:00.000Z');
    expect(url.searchParams.get('select')).toBe(STORY_LIST_SELECT);
  });

  it('loads full article content only for a single story slug', async () => {
    await SupabaseStoryStore.getStoryBySlug('canadian-rockies-banff-and-jasper-adventure');
    const { url, init } = lastRequest();

    expect(url.searchParams.get('select')).toBe(STORY_DETAIL_SELECT);
    expect(url.searchParams.get('select')).toMatch(/(^|,)content(,|$)/);
    expect(url.searchParams.get('slug')).toBe('eq.canadian-rockies-banff-and-jasper-adventure');
    expect(url.searchParams.get('limit')).toBe('1');
    expect(init.next).toEqual({ revalidate: 60, tags: ['stories'] });
  });

  it('keeps admin/repair reads uncached when content is requested', async () => {
    await SupabaseStoryStore.getPublishedStories({
      includeContent: true,
      cache: 'none',
      limit: 40,
    });
    const { url, init } = lastRequest();

    expect(url.searchParams.get('select')).toBe(STORY_DETAIL_SELECT);
    expect(url.searchParams.get('limit')).toBe('40');
    expect(init.cache).toBe('no-store');
    expect(init.next).toBeUndefined();
  });
});
