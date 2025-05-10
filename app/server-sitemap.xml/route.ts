import { getServerSideSitemap } from 'next-sitemap';
import type { ISitemapField } from 'next-sitemap';
import { getAllStories } from '@/src/utils/stories';
import { CATEGORIES } from '@/src/config/categories';
import { getAllCountries } from '@/src/utils/countries';

/**
 * Generate a server-side sitemap for the website
 * This is a Next.js App Router API route that generates a sitemap
 * @returns Server-side sitemap
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';

  // Get all stories
  const stories = await getAllStories();

  // Get all categories
  const categories = CATEGORIES;

  // Get all countries
  const countries = getAllCountries();

  // Story pages
  const storyFields: ISitemapField[] = stories.map(story => ({
    loc: `${baseUrl}/stories/${story.slug}`,
    lastmod: new Date(story.updatedAt || story.publishedAt).toISOString(),
    changefreq: 'weekly',
    priority: story.featured ? 0.9 : (story.editorsPick ? 0.8 : 0.7),
    // Add image data if available
    images: story.imageUrl ? [
      {
        loc: story.imageUrl.startsWith('http')
          ? story.imageUrl
          : `${baseUrl}${story.imageUrl.startsWith('/') ? story.imageUrl : `/${story.imageUrl}`}`,
        title: story.title,
        caption: story.excerpt?.substring(0, 100) || story.title,
        geo_location: story.country !== 'Global' ? story.country : undefined,
        license: 'https://creativecommons.org/licenses/by/4.0/'
      }
    ] : undefined,
  }));

  // Category pages
  const categoryFields: ISitemapField[] = categories.map(category => ({
    loc: `${baseUrl}/categories/${category.slug}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: category.featured ? 0.8 : 0.7,
  }));

  // Country pages
  const countryFields: ISitemapField[] = countries.map(country => ({
    loc: `${baseUrl}/countries/${country.toLowerCase().replace(/\s+/g, '-')}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: 0.7,
  }));

  // Combine all fields
  const fields: ISitemapField[] = [
    ...storyFields,
    ...categoryFields,
    ...countryFields
  ];

  // Return the sitemap
  return getServerSideSitemap(fields);
}
