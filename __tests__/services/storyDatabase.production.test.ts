jest.mock('../../src/services/supabaseStoryStore', () => ({
  SupabaseStoryStore: {
    isConfigured: jest.fn(),
    getPublishedStories: jest.fn(),
    getStoryBySlug: jest.fn(),
  },
}));

beforeEach(() => {
  jest.resetModules();
  jest.replaceProperty(process.env, 'NODE_ENV', 'production');
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

async function database(configured: boolean) {
  const { SupabaseStoryStore } = await import('../../src/services/supabaseStoryStore');
  (SupabaseStoryStore.isConfigured as jest.Mock).mockReturnValue(configured);
  const { StoryDatabase } = await import('../../src/services/storyDatabase');
  return { db: StoryDatabase.getInstance(), store: SupabaseStoryStore };
}

it('does not initialize production with samples when Supabase is unconfigured', async () => {
  const { db } = await database(false);
  expect(await db.getAllStories()).toEqual([]);
  const { mockStories } = await import('../../src/mocks/stories');
  expect(await db.getStoryBySlug(mockStories[0].slug)).toBeNull();
});

it('does not leak samples after a configured Supabase failure', async () => {
  const { db, store } = await database(true);
  (store.getPublishedStories as jest.Mock).mockRejectedValue(new Error('quota exceeded'));
  (store.getStoryBySlug as jest.Mock).mockRejectedValue(new Error('quota exceeded'));
  expect(await db.getAllStories()).toEqual([]);
  const { mockStories } = await import('../../src/mocks/stories');
  expect(await db.getStoryBySlug(mockStories[0].slug)).toBeNull();
});

it('does not leak samples from an empty configured Supabase database', async () => {
  const { db, store } = await database(true);
  (store.getPublishedStories as jest.Mock).mockResolvedValue([]);
  expect(await db.getAllStories()).toEqual([]);
});

it('keeps local sample data for development without Supabase', async () => {
  jest.replaceProperty(process.env, 'NODE_ENV', 'development');
  const { db } = await database(false);
  expect((await db.getAllStories()).length).toBeGreaterThan(0);
});
