import path from 'path'
import fs from 'fs'
import matter from 'gray-matter'
import { isWithinLast7Days, isValidDate } from './utils'

export interface Story {
  title: string
  slug: string
  metaTitle: string
  metaDescription: string
  excerpt: string
  summary: string
  category: string
  type: string
  country: string
  body: string
  content: string
  date: string
  featured: boolean
  published: boolean
  timestamp: string
  imageName?: string
  imageUrl?: string
  imagePhotographer?: {
    name: string
    username: string
  }
  author: string
  readTime?: number
  keywords: string[]
  tags: string[]
  isSponsored?: boolean
  editorsPick?: boolean
  imageAlt?: string
  imageCredit?: string
  imageLink?: string
}

export interface RawStory extends Story {
  timestamp: string
}

interface StoryMetadata {
  title: string
  slug: string
  category: string
  country: string
  timestamp: string
  featured?: boolean
  published?: boolean
  tags: string[]
}

interface FrontMatter {
  title: string
  summary: string
  slug?: string
  date: string
  country: string
  type: string
  keywords?: string[]
  thumbnail?: string
  imageUrl?: string
  imageAlt?: string
  imageCredit?: string
  imageLink?: string
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

// Add caching for story metadata
let storyMetadataCache: StoryMetadata[] | null = null
let storyMetadataCacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles')
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

async function fetchStory(slug: string): Promise<Story | null> {
  try {
    // Check if the slug is an image file
    if (slug.match(/\.(jpg|jpeg|png|gif)$/i)) {
      console.warn(`Attempted to fetch image file as story: ${slug}`)
      return null
    }

    const storiesDir = path.join(process.cwd(), 'public', 'stories')
    const filePath = path.join(storiesDir, `${slug}.json`)
    
    const fileContent = await fs.promises.readFile(filePath, 'utf-8')
    const story = JSON.parse(fileContent) as Story
    
    // Calculate readTime if not provided
    if (!story.readTime) {
      const wordCount = story.body.split(/\s+/).length
      story.readTime = Math.ceil(wordCount / 200)
    }
    
    // Set excerpt if not provided
    if (!story.excerpt) {
      story.excerpt = story.metaDescription || story.body.split('\n')[0]
    }

    // Set default image if not provided
    if (!story.imageUrl) {
      story.imageUrl = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=800&fit=crop&q=80'
      story.imagePhotographer = {
        name: 'Dino Reichmuth',
        username: 'dinoreichmuth'
      }
    }
    
    return story
  } catch (error) {
    console.warn(`Failed to fetch story ${slug}:`, error)
    return null
  }
}

async function fetchStoryMetadata(): Promise<StoryMetadata[]> {
  try {
    // Check cache first
    const now = Date.now()
    if (storyMetadataCache && now - storyMetadataCacheTime < CACHE_DURATION) {
      return storyMetadataCache
    }

    const storiesDir = path.join(process.cwd(), 'public', 'stories')
    const indexPath = path.join(storiesDir, 'index.json')
    
    const fileContent = await fs.promises.readFile(indexPath, 'utf-8')
    const metadata = JSON.parse(fileContent) as StoryMetadata[]
    
    // Update cache
    storyMetadataCache = metadata
    storyMetadataCacheTime = now
    
    return metadata
  } catch (error) {
    console.warn('Failed to fetch story metadata:', error)
    return []
  }
}

// Function to get all stories without filtering
export async function getAllStories(): Promise<Story[]> {
  const files = fs.readdirSync(ARTICLES_DIRECTORY)
  const markdownFiles = files.filter((file: string) => file.endsWith('.md'))

  const stories = markdownFiles.map((filename: string) => {
    const filePath = path.join(ARTICLES_DIRECTORY, filename)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)
    const frontmatter = data as FrontMatter

    return {
      title: frontmatter.title,
      slug: frontmatter.slug || filename.replace(/\.md$/, ''),
      metaTitle: frontmatter.title,
      metaDescription: frontmatter.summary,
      excerpt: frontmatter.summary,
      category: 'Travel',
      country: frontmatter.country,
      body: content,
      featured: false,
      published: true,
      timestamp: frontmatter.date,
      author: 'Global Travel Report',
      readTime: Math.ceil(content.split(/\s+/).length / 200),
      keywords: frontmatter.keywords || [],
      tags: frontmatter.keywords || [],
      isSponsored: false,
      editorsPick: false,
      summary: frontmatter.summary,
      date: frontmatter.date,
      type: frontmatter.type,
      content: content,
      imageUrl: frontmatter.imageUrl,
      imageAlt: frontmatter.imageAlt,
      imageCredit: frontmatter.imageCredit,
      imageLink: frontmatter.imageLink
    }
  })

  return stories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Function to get unique countries from all stories
export async function getUniqueCountries(): Promise<string[]> {
  const stories = await getAllStories()
  const countries = new Set(stories.map(story => story.country))
  return Array.from(countries).sort()
}

// Function to get unique types from all stories
export async function getUniqueTypes(): Promise<string[]> {
  const stories = await getAllStories()
  const types = new Set(stories.map(story => story.type))
  return Array.from(types).sort()
}

// Function to get stories with optional filtering
export async function getStories(options: { 
  recentOnly?: boolean
  country?: string
  type?: string
  tag?: string
  searchQuery?: string
} = {}): Promise<Story[]> {
  const stories = await getAllStories()
  
  return stories.filter(story => {
    // Skip invalid dates
    if (!isValidDate(story.date)) return false

    // Apply recent filter if requested
    if (options.recentOnly && !isWithinLast7Days(story.date)) return false

    // Apply country filter if provided
    if (options.country && story.country.toLowerCase() !== options.country.toLowerCase()) return false

    // Apply type filter if provided
    if (options.type && story.type.toLowerCase() !== options.type.toLowerCase()) return false

    // Apply tag filter if provided
    if (options.tag && (!story.keywords || !story.keywords.some(k => 
      k.toLowerCase() === options.tag?.toLowerCase()
    ))) return false

    // Apply search filter if provided
    if (options.searchQuery) {
      const searchTerm = options.searchQuery.toLowerCase()
      const searchableText = [
        story.title,
        story.summary,
        ...(story.keywords || [])
      ].join(' ').toLowerCase()

      if (!searchableText.includes(searchTerm)) return false
    }

    return true
  })
}

// Function specifically for getting recent stories (used by homepage)
export async function getRecentStories(filters?: { country?: string; type?: string }): Promise<Story[]> {
  return getStories({ recentOnly: true, ...filters })
}

// Function to get a single story by slug
export async function getStoryBySlug(slug: string): Promise<Story | null> {
  const stories = await getAllStories()
  return stories.find(story => story.slug === slug) || null
}

export async function getPaginatedStories(stories: Story[], page: number = 1, perPage: number = 12) {
  const startIndex = (page - 1) * perPage
  const endIndex = startIndex + perPage
  const paginatedStories = stories.slice(startIndex, endIndex)
  const totalPages = Math.ceil(stories.length / perPage)

  return {
    stories: paginatedStories,
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