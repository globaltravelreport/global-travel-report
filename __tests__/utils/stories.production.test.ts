import { getAllStories, getStoryBySlug } from '../../src/utils/stories';
import { StoryDatabase } from '../../src/services/storyDatabase';
import { mockStories } from '../../src/mocks/stories';

jest.mock('../../src/services/storyDatabase', () => ({
  StoryDatabase: { getInstance: jest.fn() },
}));

const readStories = jest.fn();
const readSlug = jest.fn();

beforeEach(() => {
  jest.replaceProperty(process.env, 'NODE_ENV', 'production');
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  (StoryDatabase.getInstance as jest.Mock).mockReturnValue({
    getAllStories: readStories, getStoryBySlug: readSlug,
  });
  readStories.mockReset();
  readSlug.mockReset();
});

afterEach(() => jest.restoreAllMocks());

it('returns no sample stories for an empty production database', async () => {
  readStories.mockResolvedValue([]);
  expect(await getAllStories()).toEqual([]);
});

it('returns no sample stories when production reads fail', async () => {
  readStories.mockRejectedValue(new Error('database unavailable'));
  expect(await getAllStories()).toEqual([]);
});

it('does not resolve sample slugs when production reads fail', async () => {
  readStories.mockRejectedValue(new Error('database unavailable'));
  readSlug.mockRejectedValue(new Error('database unavailable'));
  expect(await getStoryBySlug(mockStories[0].slug)).toBeNull();
});

it('does not resolve sample slugs when production reads are empty', async () => {
  readStories.mockResolvedValue([]);
  readSlug.mockResolvedValue(null);
  expect(await getStoryBySlug(mockStories[0].slug)).toBeNull();
});

it('preserves and sorts real production content', async () => {
  const older = { ...mockStories[0], id: 'real-older', publishedAt: '2026-11-01' };
  const newer = { ...mockStories[0], id: 'real-newer', publishedAt: '2026-11-07' };
  readStories.mockResolvedValue([older, newer]);
  expect(await getAllStories()).toEqual([newer, older]);
});

it.each(['development', 'test'] as const)('retains sample fallback in %s', async (env) => {
  jest.replaceProperty(process.env, 'NODE_ENV', env);
  readStories.mockResolvedValue([]);
  expect(await getAllStories()).toHaveLength(mockStories.length);
  readStories.mockRejectedValue(new Error('local database unavailable'));
  expect(await getAllStories()).toHaveLength(mockStories.length);
});
