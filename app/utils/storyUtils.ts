import { Story } from '../types/story'

// Helper function to clean country names
export function cleanCountryName(country: string): string {
  // Remove any leading/trailing whitespace
  let cleaned = country.trim()
  
  // Remove any text in parentheses
  cleaned = cleaned.replace(/\s*\([^)]*\)/g, '')
  
  // Remove any numbers and special characters
  cleaned = cleaned.replace(/[0-9!"#$%&'*+,-./:;<=>?@[\]^_`{|}~]/g, '')
  
  // Fix common country name issues
  cleaned = cleaned.replace(/\bUAE\b/g, 'United Arab Emirates')
  cleaned = cleaned.replace(/\bUK\b/g, 'United Kingdom')
  cleaned = cleaned.replace(/\bUSA?\b/g, 'United States')
  
  // Proper case words
  cleaned = cleaned.split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    
  return cleaned.trim()
}

export function sortStoriesByDate(stories: Story[]): Story[] {
  return [...stories].sort((a, b) => b.timestamp - a.timestamp)
}

export function filterStoriesByCountry(stories: Story[], country: string): Story[] {
  const cleanedTargetCountry = cleanCountryName(country)
  return stories.filter(story => {
    const storyCountries = story.country
      .split(/,|\sand\s/)
      .map(cleanCountryName)
      .filter(Boolean)
    return storyCountries.includes(cleanedTargetCountry)
  })
}

export function filterStoriesByType(stories: Story[], type: string): Story[] {
  return stories.filter(story => story.type.toLowerCase() === type.toLowerCase())
}

export function filterStoriesByCategory(stories: Story[], category: string): Story[] {
  return stories.filter(story => story.categories?.includes(category))
}

export function filterStoriesByTag(stories: Story[], tag: string): Story[] {
  return stories.filter(story => story.tags?.includes(tag))
}

export function filterStoriesBySearch(stories: Story[], query: string): Story[] {
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

export function paginateStories(stories: Story[], page: number = 1, perPage: number = 10) {
  const start = (page - 1) * perPage
  const end = start + perPage
  const paginatedStories = stories.slice(start, end)
  
  return {
    stories: paginatedStories,
    totalPages: Math.ceil(stories.length / perPage)
  }
} 