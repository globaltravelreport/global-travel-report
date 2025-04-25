import { NextResponse } from 'next/server'
import { getUniqueCountries, getUniqueTypes, getPublishedStories } from '@/app/lib/stories'
import { Story } from '@/app/types/story'
import { getCountrySlug } from '@/app/utils/countryHelpers'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export async function GET() {
  try {
    const stories = await getPublishedStories()
    const countries = await getUniqueCountries()
    const types = await getUniqueTypes()

    // Get unique tags from all stories
    const tags = new Set<string>()
    stories.forEach((story: Story) => {
      if (story.keywords) {
        story.keywords.forEach((tag: string) => tags.add(tag))
      }
    })

    // Start building sitemap
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    // Add static pages
    sitemap += `
      <url>
        <loc>${BASE_URL}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${BASE_URL}/filtered</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>
    `

    // Add story pages
    stories.forEach((story: Story) => {
      sitemap += `
        <url>
          <loc>${BASE_URL}/stories/${story.slug}</loc>
          <lastmod>${formatDate(new Date(story.date))}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.8</priority>
        </url>
      `
    })

    // Add country pages
    countries.forEach((countryName: string) => {
      sitemap += `
        <url>
          <loc>${BASE_URL}/countries/${encodeURIComponent(getCountrySlug(countryName))}</loc>
          <changefreq>daily</changefreq>
          <priority>0.7</priority>
        </url>
      `
    })

    // Add type pages
    types.forEach((type: string) => {
      sitemap += `
        <url>
          <loc>${BASE_URL}/type/${encodeURIComponent(type)}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
      `
    })

    // Add tag pages
    Array.from(tags).forEach((tag: string) => {
      sitemap += `
        <url>
          <loc>${BASE_URL}/filtered?tag=${encodeURIComponent(tag)}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.6</priority>
        </url>
      `
    })

    sitemap += '</urlset>'

    // Return sitemap with proper content type
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
} 