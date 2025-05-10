import { validateDate, getSafeDateString } from '../date-utils';
import { StoryDatabase } from '@/src/services/storyDatabase';
import { getAllStories, saveStory } from '@/src/utils/fileStorage';
import { Story } from '@/types/Story';

// Mock the fileStorage module
jest.mock('@/src/utils/fileStorage', () => ({
  getAllStories: jest.fn(),
  saveStory: jest.fn().mockResolvedValue(undefined),
}));

describe('Story Date Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the StoryDatabase singleton
    // @ts-ignore - accessing private property for testing
    StoryDatabase.instance = null;
  });

  it('should preserve future dates when loading stories', async () => {
    // Create a mock story with a future date
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1); // One year in the future
    const futureDateString = futureDate.toISOString();

    const mockStory: Story = {
      id: 'test-story',
      slug: 'test-story',
      title: 'Test Story',
      content: 'Test content',
      excerpt: 'Test excerpt',
      author: 'Test Author',
      publishedAt: futureDateString,
      date: futureDateString,
      category: 'Test',
      country: 'Global',
      imageUrl: '',
      featured: false,
      editorsPick: false,
      tags: ['test']
    };

    // Mock the getAllStories function to return our mock story
    (getAllStories as jest.Mock).mockResolvedValue([mockStory]);

    // Initialize the StoryDatabase
    const db = StoryDatabase.getInstance();
    await db.initialize();

    // Get all stories
    const stories = await db.getAllStories();

    // Verify that the future date was preserved
    expect(stories.length).toBe(1);
    expect(stories[0].publishedAt).toBe(futureDateString);
    expect(stories[0].date).toBe(futureDateString);

    // Verify that getAllStories was called
    expect(getAllStories).toHaveBeenCalled();
  });

  it('should handle invalid dates and replace them with current date', async () => {
    // Create a mock story with an invalid date
    const invalidDateString = 'not-a-date';

    const mockStory: Story = {
      id: 'test-story-invalid',
      slug: 'test-story-invalid',
      title: 'Test Story Invalid',
      content: 'Test content',
      excerpt: 'Test excerpt',
      author: 'Test Author',
      publishedAt: invalidDateString,
      date: invalidDateString,
      category: 'Test',
      country: 'Global',
      imageUrl: '',
      featured: false,
      editorsPick: false,
      tags: ['test']
    };

    // Mock the getAllStories function to return our mock story
    (getAllStories as jest.Mock).mockResolvedValue([mockStory]);

    // Initialize the StoryDatabase
    const db = StoryDatabase.getInstance();
    await db.initialize();

    // Get all stories
    const stories = await db.getAllStories();

    // Verify that the invalid date was replaced with a valid date
    expect(stories.length).toBe(1);
    expect(stories[0].publishedAt).not.toBe(invalidDateString);
    expect(isValidISOString(stories[0].publishedAt)).toBe(true);

    // Verify that getAllStories was called
    expect(getAllStories).toHaveBeenCalled();
  });
});

// Helper function to check if a string is a valid ISO date string
function isValidISOString(dateStr: string): boolean {
  try {
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) && date.toISOString() === dateStr;
  } catch (e) {
    return false;
  }
}
