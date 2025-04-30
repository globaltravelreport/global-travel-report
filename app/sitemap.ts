import { MetadataRoute } from 'next';
import { getStories } from '@/lib/stories';

/**
 * Generate a dynamic sitemap based on actual content
 * @returns A sitemap configuration for Next.js
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';
  const currentDate = new Date();

  // Get all stories
  const stories = await getStories();

  // Extract unique categories, countries, and tags from actual stories
  const categories = Array.from(new Set(stories
    .map(story => story.category)
    .filter(Boolean)
  ));

  const countries = Array.from(new Set(stories
    .map(story => story.country)
    .filter(Boolean)
  ));

  const allTags = stories.flatMap(story => story.tags || []);
  const tags = Array.from(new Set(allTags));

  // Static routes
  const routes = [
    '',
    '/about',
    '/contact',
    '/stories',
    '/search',
    '/privacy-policy',
    '/terms-of-service',
    '/categories/hotels',
    '/categories/airlines',
    '/categories/cruises',
    '/categories/destinations',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' || route === '/stories' ? 'daily' as const : 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes for stories with proper lastModified dates
  const storyRoutes = stories.map((story) => {
    // Use the story's published date as the lastModified date
    const lastModified = new Date(story.publishedAt);

    return {
      url: `${baseUrl}/stories/${story.slug}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: story.featured ? 0.9 : 0.7,
    };
  });

  // Category routes - dynamically generated from actual stories
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Country routes - dynamically generated from actual stories
  const countryRoutes = countries.map((country) => ({
    url: `${baseUrl}/countries/${country.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Tag routes - dynamically generated from actual stories
  const tagRoutes = tags.map((tag) => ({
    url: `${baseUrl}/tags/${tag.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  // Author routes - dynamically generated from actual stories
  const authors = Array.from(new Set(stories
    .map(story => story.author)
    .filter(Boolean)
  ));

  const authorRoutes = authors.map((author) => ({
    url: `${baseUrl}/authors/${author.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...routes,
    ...storyRoutes,
    ...categoryRoutes,
    ...countryRoutes,
    ...tagRoutes,
    ...authorRoutes,
  ];
}