import { getServerSideSitemap } from 'next-sitemap';
import type { ISitemapField, IImageEntry } from 'next-sitemap';
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
  const storyFields: ISitemapField[] = stories.map(story => {
    // Safely handle the date - use current date if invalid
    let lastmod;
    try {
      const dateStr = story.updatedAt || story.publishedAt;
      const date = new Date(dateStr);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date in sitemap: ${dateStr}, using current date instead`);
        lastmod = new Date().toISOString();
      } else {
        lastmod = date.toISOString();
      }
    } catch (error) {
      console.error(`Error processing date for sitemap: ${error}`);
      lastmod = new Date().toISOString();
    }

    return {
      loc: `${baseUrl}/stories/${story.slug}`,
      lastmod,
      changefreq: 'weekly',
      priority: story.featured ? 0.9 : (story.editorsPick ? 0.8 : 0.7),
      // Add image data if available
      images: story.imageUrl ? [
        {
          loc: new URL(
            story.imageUrl.startsWith('http')
              ? story.imageUrl
              : `${baseUrl}${story.imageUrl.startsWith('/') ? story.imageUrl : `/${story.imageUrl}`}`
          ),
          title: story.title,
          caption: story.excerpt?.substring(0, 100) || story.title,
          geoLocation: story.country !== 'Global' ? story.country : undefined,
          license: new URL('https://creativecommons.org/licenses/by/4.0/')
        } as IImageEntry
      ] : undefined,
    };
  });

  // Category pages
  const categoryFields: ISitemapField[] = categories.map(category => {
    // Always use current date for category pages
    const lastmod = new Date().toISOString();

    return {
      loc: `${baseUrl}/categories/${category.slug}`,
      lastmod,
      changefreq: 'weekly',
      priority: category.featured ? 0.8 : 0.7,
    };
  });

  // Country pages
  const countryFields: ISitemapField[] = countries.map(country => {
    // Always use current date for country pages
    const lastmod = new Date().toISOString();

    return {
      loc: `${baseUrl}/countries/${country.toLowerCase().replace(/\s+/g, '-')}`,
      lastmod,
      changefreq: 'weekly',
      priority: 0.7,
    };
  });

  // Combine all fields
  const fields: ISitemapField[] = [
    ...storyFields,
    ...categoryFields,
    ...countryFields
  ];

  // Return the sitemap
  return getServerSideSitemap(fields);
}
