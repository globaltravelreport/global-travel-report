import { MetadataRoute } from 'next'
import { getAllStories } from './lib/stories'
import { getFileModifiedDate } from './lib/utils'
import path from 'path'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com'
  const stories = await getAllStories()

  // Get unique countries and types for category pages
  const countries = Array.from(new Set(stories.map(story => story.country)))
  const types = Array.from(new Set(stories.map(story => story.type)))

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/filtered`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/subscribe`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Story pages
  const storyPages = await Promise.all(stories.map(async story => {
    const filePath = path.join(process.cwd(), 'content', 'articles', `${story.slug}.md`)
    const modifiedDate = await getFileModifiedDate(filePath) || new Date(story.date)

    return {
      url: `${baseUrl}/stories/${story.slug}`,
      lastModified: modifiedDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      // Add image data if available
      images: story.imageUrl ? [{
        url: story.imageUrl,
        title: story.imageAlt || story.title,
        // Only include photographer info if available in the source field
        ...(story.source?.includes('Unsplash') && {
          caption: `Photo from Unsplash`,
          license: 'https://unsplash.com/license',
        }),
      }] : [],
    }
  }))

  // Country pages
  const countryPages = countries.map(country => ({
    url: `${baseUrl}/filtered?country=${encodeURIComponent(country)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  // Type pages
  const typePages = types.map(type => ({
    url: `${baseUrl}/filtered?type=${encodeURIComponent(type)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...storyPages, ...countryPages, ...typePages]
} 