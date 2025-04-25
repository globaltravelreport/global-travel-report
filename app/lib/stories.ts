/**
 * TODO: TypeScript Type Mismatch Issues
 * 
 * Current Issues:
 * 1. Frontmatter/Story Interface Mismatches:
 *    - Type conversion from gray-matter's data to FrontMatter interface
 *    - Timestamp and lastModified properties not properly typed in conversion
 *    - Some optional properties causing type narrowing issues
 * 
 * 2. Arithmetic Operation Type Warnings:
 *    - Sorting operations on timestamp/date fields trigger type warnings
 *    - Need proper type guards or conversions for date arithmetic
 * 
 * Note: These issues are temporarily deferred because:
 * - The code is functionally working as expected
 * - The type issues are mostly around runtime-safe operations
 * - We're prioritizing feature completion for initial deployment
 * 
 * Future Fix Approaches:
 * - Add proper type guards for frontmatter conversion
 * - Create a proper date handling utility for timestamp operations
 * - Consider using zod or io-ts for runtime type validation
 */

'use server'

import path from 'path'
import fs from 'fs/promises'
import matter from 'gray-matter'
import { Story, StoryDraft } from '../types/story'
import { logger } from '../utils/logger'
import {
  cleanCountryName,
  sortStoriesByDate,
  filterStoriesByCountry,
  filterStoriesByType,
  filterStoriesByCategory,
  filterStoriesByTag,
  filterStoriesBySearch,
  paginateStories
} from '../utils/storyUtils'

const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles')

export type { Story, StoryDraft }

export interface Country {
  name: string
  slug: string
}

export async function getAllStories(): Promise<Story[]> {
  const files = await fs.readdir(ARTICLES_DIRECTORY)
  const mdFiles = files.filter(file => file.endsWith('.md'))

  const stories = await Promise.all(mdFiles.map(async (filename) => {
    const filePath = path.join(ARTICLES_DIRECTORY, filename)
    const fileContents = await fs.readFile(filePath, 'utf8')
    const stats = await fs.stat(filePath)
    const { data, content } = matter(fileContents)

    // Convert date string to timestamp
    const timestamp = new Date(data.date).getTime()
    if (isNaN(timestamp)) {
      logger.warn(`Invalid date in ${filename}: ${data.date}`)
    }

    // Ensure all required fields are present
    if (!data.title || !data.summary || !data.date || !data.country || !data.type || !data.keywords) {
      logger.warn(`Missing required fields in ${filename}`)
      return null
    }

    const story: Story = {
      title: data.title,
      summary: data.summary,
      content,
      slug: filename.replace('.md', ''),
      date: data.date,
      timestamp: timestamp || Date.now(),
      lastModified: stats.mtimeMs,
      country: data.country,
      type: data.type,
      categories: data.categories || [],
      keywords: data.keywords,
      imageUrl: data.imageUrl,
      imageAlt: data.imageAlt,
      author: data.author,
      source: data.source,
      sourceUrl: data.sourceUrl,
      tags: data.tags || [],
      body: data.body,
      published: data.published,
      category: data.category,
      featured: data.featured,
      editorsPick: data.editorsPick,
      readTime: data.readTime,
      metaDescription: data.metaDescription,
      isSponsored: data.isSponsored,
      seo: data.seo
    }

    return story
  }))

  return stories.filter((story): story is Story => story !== null)
}

export async function getUniqueCountries(): Promise<string[]> {
  const stories = await getAllStories()
  
  // Get all countries from stories, including those with multiple countries
  const allCountries = stories.flatMap(story => {
    // Split by commas or 'and' if multiple countries
    const countryList = story.country.split(/,|\sand\s/);
    return countryList.map(country => cleanCountryName(country)).filter(Boolean);
  });

  // Create a Set for deduplication and sort alphabetically
  return Array.from(new Set(allCountries))
    .filter(country => 
      // Filter out invalid entries
      country.length > 0 && 
      // Filter out entries that are likely not countries
      !country.includes('Introduction') &&
      !country.includes('Conclusion') &&
      !country.includes('Summary') &&
      !country.includes('Chapter') &&
      !country.includes('Section')
    )
    .sort();
}

export async function getUniqueTypes(): Promise<string[]> {
  const stories = await getAllStories()
  return Array.from(new Set(stories.map(story => story.type))).sort()
}

export async function getStories(options: {
  recentOnly?: boolean
  country?: string
  type?: string
  category?: string
  tag?: string
  search?: string
} = {}): Promise<Story[]> {
  let stories = await getAllStories()
  
  if (options.recentOnly) {
    const now = Date.now()
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)
    stories = stories.filter(story => story.timestamp >= thirtyDaysAgo)
  }

  if (options.country) {
    stories = filterStoriesByCountry(stories, options.country)
  }

  if (options.type) {
    stories = filterStoriesByType(stories, options.type)
  }

  if (options.category) {
    stories = filterStoriesByCategory(stories, options.category)
  }

  if (options.tag) {
    stories = filterStoriesByTag(stories, options.tag)
  }

  if (options.search) {
    stories = filterStoriesBySearch(stories, options.search)
  }

  return sortStoriesByDate(stories)
}

export async function getRecentStories({ country, type }: { country?: string, type?: string } = {}): Promise<Story[]> {
  return getStories({ recentOnly: true, country, type })
}

export async function getStoryBySlug(slug: string): Promise<Story | null> {
  try {
    const filePath = path.join(ARTICLES_DIRECTORY, `${slug}.md`)
    const fileContent = await fs.readFile(filePath, 'utf8')
    const { data, content } = matter(fileContent)
    const stats = await fs.stat(filePath)
    const timestamp = new Date(data.date).getTime()
    const lastModified = stats.mtime.getTime()

    const story: Story = {
      title: data.title,
      summary: data.summary,
      content,
      slug,
      date: data.date,
      timestamp,
      lastModified,
      country: data.country,
      type: data.type,
      categories: data.categories || [],
      keywords: data.keywords,
      imageUrl: data.imageUrl,
      imageAlt: data.imageAlt,
      author: data.author,
      source: data.source,
      sourceUrl: data.sourceUrl,
      tags: data.keywords,
      body: data.body,
      published: data.published,
      category: data.category,
      featured: data.featured,
      editorsPick: data.editorsPick,
      readTime: data.readTime ? Number(data.readTime) : undefined,
      metaDescription: data.metaDescription,
      isSponsored: false,
      seo: data.seo
    }

    return story
  } catch (error) {
    logger.error(`Error reading story ${slug}:`, error)
    return null
  }
}

export async function getPaginatedStories(stories: Story[], page: number = 1, perPage: number = 10) {
  return paginateStories(stories, page, perPage)
}

export async function getPublishedStories(): Promise<Story[]> {
  const stories = await getAllStories()
  return stories.filter(story => story.published !== false)
}

export async function getStoriesByCategory(category: string): Promise<Story[]> {
  const stories = await getPublishedStories()
  return filterStoriesByCategory(stories, category)
}

export async function getStoriesByCountry(country: string): Promise<Story[]> {
  const stories = await getPublishedStories()
  return sortStoriesByDate(filterStoriesByCountry(stories, country))
}

export async function getTrendingStories(): Promise<Story[]> {
  const stories = await getPublishedStories()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  return stories
    .filter(story => 
      new Date(story.timestamp) > thirtyDaysAgo || 
      story.featured || 
      story.editorsPick
    )
    .sort((a, b) => {
      // Sort by a combination of recency, featured status, and read time
      const aScore = 
        (new Date(a.timestamp) > thirtyDaysAgo ? 3 : 0) +
        (a.featured ? 2 : 0) +
        (a.editorsPick ? 2 : 0) +
        (a.readTime || 0) / 10
      
      const bScore = 
        (new Date(b.timestamp) > thirtyDaysAgo ? 3 : 0) +
        (b.featured ? 2 : 0) +
        (b.editorsPick ? 2 : 0) +
        (b.readTime || 0) / 10
      
      return bScore - aScore
    })
    .slice(0, 6) // Return top 6 trending stories
}

export async function getMetrics() {
  const stories = await getAllStories()
  const publishedStories = stories.filter(story => story.published !== false)
  
  // Get top tags
  const tagCounts = stories.reduce((acc, story) => {
    story.keywords.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)
  
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag]) => tag)
  
  // Get unique countries and categories
  const countries = new Set(stories.map(story => story.country))
  const categories = new Set(stories.map(story => story.category))
  
  return {
    totalStories: stories.length,
    publishedStories: publishedStories.length,
    featuredCount: stories.filter(story => story.featured).length,
    editorsPickCount: stories.filter(story => story.editorsPick).length,
    topTags,
    countriesCount: countries.size,
    categoriesCount: categories.size
  }
}

export async function searchStories(query: string): Promise<Story[]> {
  const stories = await getAllStories()
  return filterStoriesBySearch(stories, query)
}

export async function getStoriesByTag(tag: string): Promise<Story[]> {
  const stories = await getPublishedStories()
  return sortStoriesByDate(filterStoriesByTag(stories, tag))
}

export async function getStoriesByType(type: string): Promise<Story[]> {
  const stories = await getAllStories()
  return sortStoriesByDate(filterStoriesByType(stories, type))
}

export async function getUniqueCategories(): Promise<string[]> {
  const stories = await getAllStories()
  return Array.from(new Set(stories.flatMap(story => story.categories || []))).sort()
} 