import path from 'path'

export interface Story {
  title: string
  slug: string
  metaTitle: string
  metaDescription: string
  excerpt?: string
  category: string
  country: string
  body: string
  featured?: boolean
  published?: boolean
  timestamp: string
  imageName?: string
  author: string
  readTime?: number
  tags: string[]
  isSponsored?: boolean
  editorsPick?: boolean
}

async function fetchStory(slug: string): Promise<Story | null> {
  try {
    const response = await fetch(`/stories/${slug}.json`)
    if (!response.ok) return null
    const story = await response.json() as Story
    
    // Calculate readTime if not provided
    if (!story.readTime) {
      const wordCount = story.body.split(/\s+/).length
      story.readTime = Math.ceil(wordCount / 200)
    }
    
    // Set excerpt if not provided
    if (!story.excerpt) {
      story.excerpt = story.metaDescription || story.body.split('\n')[0]
    }
    
    return story
  } catch (error) {
    console.warn(`Failed to fetch story ${slug}:`, error)
    return null
  }
}

export async function getAllStories(): Promise<Story[]> {
  try {
    const response = await fetch('/stories/manifest.json')
    if (!response.ok) return []
    
    const manifest = await response.json() as string[]
    const stories = await Promise.all(
      manifest.map(slug => fetchStory(slug))
    )
    
    return stories
      .filter((story): story is Story => story !== null)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch (error) {
    console.warn('Failed to fetch stories:', error)
    return []
  }
}

export async function getPublishedStories(): Promise<Story[]> {
  const stories = await getAllStories()
  return stories.filter(story => story.published !== false)
}

export async function getStoryBySlug(slug: string): Promise<Story | null> {
  return fetchStory(slug)
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

export async function getRecentStories(): Promise<Story[]> {
  const stories = await getPublishedStories()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  return stories
    .filter(story => 
      new Date(story.timestamp) > thirtyDaysAgo || story.featured
    )
    .sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
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
    story.tags.forEach(tag => {
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
      ...story.tags
    ].join(' ').toLowerCase()
    
    return searchTerms.every(term => searchableText.includes(term))
  })
}

export async function getStoriesByTag(tag: string): Promise<Story[]> {
  const stories = await getAllStories()
  return stories
    .filter(story => story.tags.includes(tag))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export async function getPaginatedStories(
  stories: Story[],
  page: number = 1,
  perPage: number = 6
): Promise<{
  stories: Story[]
  totalPages: number
  currentPage: number
}> {
  const start = (page - 1) * perPage
  const end = start + perPage
  
  return {
    stories: stories.slice(start, end),
    totalPages: Math.ceil(stories.length / perPage),
    currentPage: page
  }
} 