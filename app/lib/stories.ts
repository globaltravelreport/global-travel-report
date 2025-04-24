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
import fs from 'fs'
import matter from 'gray-matter'
import { isWithinLast7Days, isValidDate } from './utils'

export interface FrontMatter {
  title: string
  summary: string
  keywords: string[]
  slug: string
  date: string
  country: string
  type: string
  imageUrl?: string
  imageAlt?: string
  author?: string
  featured?: boolean
  editorsPick?: boolean
  readTime?: string
  published?: boolean
  category?: string
  metaDescription?: string
  body?: string
}

export interface Story extends FrontMatter {
  content: string
  timestamp: number
  lastModified: number
}

const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles')

export async function getAllStories(): Promise<Story[]> {
  const articlesDirectory = path.join(process.cwd(), 'content/articles')
  const filenames = await fs.promises.readdir(articlesDirectory)
  const mdFiles = filenames.filter((filename) => filename.endsWith('.md'))

  const stories = await Promise.all(
    mdFiles.map(async (filename) => {
      try {
        const filePath = path.join(articlesDirectory, filename)
        const fileContents = await fs.promises.readFile(filePath, 'utf8')
        const stats = await fs.promises.stat(filePath)
        const { data: frontmatter, content } = matter(fileContents)

        if (!frontmatter.date || !isValidDate(frontmatter.date)) {
          console.error(`Invalid or missing date in ${filename}`)
          return null
        }

        const timestamp = new Date(frontmatter.date).getTime()

        const story: Story = {
          ...(frontmatter as FrontMatter),
          content,
          timestamp,
          lastModified: stats.mtimeMs
        }

        return story
      } catch (error) {
        console.error(`Error processing ${filename}:`, error)
        return null
      }
    })
  )

  return stories.filter((story): story is Story => story !== null)
}

export async function getUniqueCountries(): Promise<string[]> {
  const stories = await getAllStories()
  return Array.from(new Set(stories.map(story => story.country))).sort()
}

export async function getUniqueTypes(): Promise<string[]> {
  const stories = await getAllStories()
  return Array.from(new Set(stories.map(story => story.type))).sort()
}

export function getStories(options: {
  recentOnly?: boolean
  country?: string
  type?: string
  tag?: string
  searchQuery?: string
} = {}): Promise<Story[]> {
  return getAllStories().then(stories => {
    let filteredStories = [...stories]

    if (options.recentOnly) {
      filteredStories = filteredStories.filter((story) => isWithinLast7Days(story.date))
    }

    if (options.country) {
      filteredStories = filteredStories.filter((story) => story.country === options.country)
    }

    if (options.type) {
      filteredStories = filteredStories.filter((story) => story.type === options.type)
    }

    if (options.tag) {
      filteredStories = filteredStories.filter((story) => story.keywords.includes(options.tag!))
    }

    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase()
      filteredStories = filteredStories.filter(
        (story) =>
          story.title.toLowerCase().includes(query) ||
          story.summary.toLowerCase().includes(query) ||
          story.content.toLowerCase().includes(query)
      )
    }

    return filteredStories.sort((a, b) => b.timestamp - a.timestamp)
  })
}

export async function getRecentStories({ country, type }: { country?: string, type?: string } = {}): Promise<Story[]> {
  return getStories({ recentOnly: true, country, type })
}

export async function getStoryBySlug(slug: string): Promise<Story | null> {
  try {
    const filePath = path.join(ARTICLES_DIRECTORY, `${slug}.md`)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContent)
    const frontmatter = data as FrontMatter
    
    const stats = fs.statSync(filePath)
    const lastModified = stats.mtime.toISOString()

    if (!frontmatter.date || !isValidDate(frontmatter.date)) {
      console.error(`Invalid or missing date in ${slug}.md`)
      return null
    }

    if (!frontmatter.country || !frontmatter.type) {
      console.error(`Missing required fields in ${slug}.md`)
      return null
    }

    return {
      ...frontmatter,
      content,
      lastModified
    } as Story
  } catch (error) {
    console.error(`Error reading story ${slug}:`, error)
    return null
  }
}

export function getPaginatedStories(stories: Story[], page: number = 1, perPage: number = 10) {
  const start = (page - 1) * perPage
  const end = start + perPage
  const paginatedStories = stories.slice(start, end)
  const totalPages = Math.ceil(stories.length / perPage)
  
  return {
    stories: paginatedStories,
    currentPage: page,
    totalPages
  }
}

export async function getPublishedStories(): Promise<Story[]> {
  const stories = await getAllStories()
  return stories.filter(story => story.published !== false)
}

export async function getStoriesByCategory(category: string): Promise<Story[]> {
  const stories = await getPublishedStories()
  return stories
    .filter(story => story.category === category)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export async function getStoriesByCountry(country: string): Promise<Story[]> {
  const stories = await getPublishedStories()
  return stories
    .filter(story => story.country === country)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
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
  const searchTerms = query.toLowerCase().split(' ')
  
  return stories.filter(story => {
    const searchableText = [
      story.title,
      story.metaDescription,
      story.body,
      story.author,
      ...story.keywords
    ].join(' ').toLowerCase()
    
    return searchTerms.every(term => searchableText.includes(term))
  })
}

export async function getStoriesByTag(tag: string): Promise<Story[]> {
  const stories = await getStories()
  return stories
    .filter(story => story.keywords.includes(tag))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
} 