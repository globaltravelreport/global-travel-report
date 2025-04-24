import { getAllStories, getUniqueCountries, getUniqueTypes, getStories, getRecentStories, getStoryBySlug } from '../../app/lib/stories'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// Mock the fs and path modules
jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
    stat: jest.fn()
  },
  readFileSync: jest.fn(),
  statSync: jest.fn()
}))

jest.mock('path', () => ({
  join: jest.fn()
}))

describe('Stories Library', () => {
  const mockStories = [
    {
      title: 'Test Story 1',
      summary: 'Summary 1',
      keywords: ['test', 'story'],
      slug: 'test-story-1',
      date: '2024-03-24',
      country: 'Australia',
      type: 'Travel News',
      content: 'Test content 1',
      lastModified: '2024-03-24T00:00:00.000Z'
    },
    {
      title: 'Test Story 2',
      summary: 'Summary 2',
      keywords: ['test', 'story'],
      slug: 'test-story-2',
      date: '2024-03-20',
      country: 'Japan',
      type: 'Guide',
      content: 'Test content 2',
      lastModified: '2024-03-20T00:00:00.000Z'
    }
  ]

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock fs.promises.readdir
    ;(fs.promises.readdir as jest.Mock).mockResolvedValue([
      'test-story-1.md',
      'test-story-2.md'
    ])

    // Mock fs.promises.readFile
    ;(fs.promises.readFile as jest.Mock).mockImplementation(async (filePath) => {
      const storyIndex = filePath.includes('test-story-1') ? 0 : 1
      const story = mockStories[storyIndex]
      return `---
title: "${story.title}"
summary: "${story.summary}"
keywords: ${JSON.stringify(story.keywords)}
slug: "${story.slug}"
date: "${story.date}"
country: "${story.country}"
type: "${story.type}"
---
${story.content}`
    })

    // Mock fs.promises.stat
    ;(fs.promises.stat as jest.Mock).mockImplementation(async (filePath) => ({
      mtimeMs: new Date(mockStories[filePath.includes('test-story-1') ? 0 : 1].lastModified).getTime()
    }))

    // Mock path.join
    ;(path.join as jest.Mock).mockImplementation((...args) => args.join('/'))
  })

  describe('getAllStories', () => {
    it('returns all stories sorted by date', async () => {
      const stories = await getAllStories()
      expect(stories).toHaveLength(2)
      expect(stories[0].title).toBe('Test Story 1') // Most recent first
      expect(stories[1].title).toBe('Test Story 2')
    })
  })

  describe('getUniqueCountries', () => {
    it('returns unique countries sorted alphabetically', async () => {
      const countries = await getUniqueCountries()
      expect(countries).toEqual(['Australia', 'Japan'])
    })
  })

  describe('getUniqueTypes', () => {
    it('returns unique types sorted alphabetically', async () => {
      const types = await getUniqueTypes()
      expect(types).toEqual(['Guide', 'Travel News'])
    })
  })

  describe('getStories', () => {
    beforeEach(() => {
      // Mock current date for isWithinLast7Days
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-03-24'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('filters stories by country', async () => {
      const stories = await getStories({ country: 'Japan' })
      expect(stories).toHaveLength(1)
      expect(stories[0].country).toBe('Japan')
    })

    it('filters stories by type', async () => {
      const stories = await getStories({ type: 'Guide' })
      expect(stories).toHaveLength(1)
      expect(stories[0].type).toBe('Guide')
    })

    it('filters recent stories', async () => {
      const stories = await getStories({ recentOnly: true })
      expect(stories).toHaveLength(2) // Both stories are within 7 days
    })

    it('combines multiple filters', async () => {
      const stories = await getStories({
        recentOnly: true,
        country: 'Japan',
        type: 'Guide'
      })
      expect(stories).toHaveLength(1)
      expect(stories[0].country).toBe('Japan')
      expect(stories[0].type).toBe('Guide')
    })
  })

  describe('getRecentStories', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-03-24'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('returns only recent stories with optional filters', async () => {
      const stories = await getRecentStories({ country: 'Japan' })
      expect(stories).toHaveLength(1)
      expect(stories[0].country).toBe('Japan')
    })
  })

  describe('getStoryBySlug', () => {
    it('returns a story by its slug', async () => {
      // Mock fs.readFileSync for this specific test
      ;(fs.readFileSync as jest.Mock).mockImplementation((filePath) => {
        const story = mockStories[0]
        return `---
title: "${story.title}"
summary: "${story.summary}"
keywords: ${JSON.stringify(story.keywords)}
slug: "${story.slug}"
date: "${story.date}"
country: "${story.country}"
type: "${story.type}"
---
${story.content}`
      })

      // Mock fs.statSync for this specific test
      ;(fs.statSync as jest.Mock).mockReturnValue({
        mtime: new Date(mockStories[0].lastModified)
      })

      const story = await getStoryBySlug('test-story-1')
      expect(story).not.toBeNull()
      expect(story?.title).toBe('Test Story 1')
    })

    it('returns null for non-existent story', async () => {
      // Mock fs.readFileSync to throw an error
      ;(fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found')
      })

      const story = await getStoryBySlug('non-existent')
      expect(story).toBeNull()
    })
  })
}) 