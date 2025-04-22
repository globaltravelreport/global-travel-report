import { MetadataRoute } from 'next'
import { getAllStories } from './lib/stories'
import { siteConfig } from './config/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await getAllStories()
  const baseUrl = siteConfig.siteUrl

  // Generate story URLs
  const storyUrls = stories.map(story => ({
    url: `${baseUrl}/stories/${story.slug}`,
    lastModified: new Date(story.timestamp),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Generate tag URLs
  const tagUrls = Array.from(new Set(stories.flatMap(story => story.tags))).map(tag => ({
    url: `${baseUrl}/tags/${tag}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Generate country URLs
  const countryUrls = Array.from(new Set(stories.map(story => story.country))).map(country => ({
    url: `${baseUrl}/countries/${country}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Generate category URLs
  const categoryUrls = Array.from(new Set(stories.map(story => story.category))).map(category => ({
    url: `${baseUrl}/categories/${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Add static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  return [
    ...staticPages,
    ...storyUrls,
    ...tagUrls,
    ...countryUrls,
    ...categoryUrls,
  ]
} 