import { MetadataRoute } from 'next';
import { getAllStories } from '@/utils/stories';
import { enhanceStoryForSEO } from '@/utils/seoEnhancer';
import { optimizeStoryImageForSeo } from '@/utils/imageSeoOptimizer';
import { CATEGORIES } from '@/src/config/categories';

/**
 * Generate a dynamic sitemap based on actual content
 * @returns A sitemap configuration for Next.js
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';
  const currentDate = new Date();

  // Get all stories
  const stories = await getAllStories();

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
    '/categories', // Add the main categories page
    '/destinations',
    '/offers',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' || route === '/stories' || route === '/categories' ? 'daily' as const : 'monthly' as const,
    priority: route === '' ? 1 : route === '/categories' ? 0.9 : 0.8,
  }));

  // Dynamic routes for stories with proper lastModified dates and image sitemaps
  const storyRoutes = stories.map((story) => {
    try {
      // Enhance the story with SEO optimizations
      const enhancedStory = enhanceStoryForSEO(story);

      // Get optimized image data
      const { imageUrl, altText, caption } = optimizeStoryImageForSeo(enhancedStory);

      // Use the current date as the lastModified date to avoid any date validation issues
      const lastModified = currentDate;

      // Calculate priority based on multiple factors for better SEO
      let priority = 0.7; // Default priority

      // Increase priority for featured or editor's pick stories
      if (enhancedStory.featured) priority += 0.2;
      if (enhancedStory.editorsPick) priority += 0.1;

      // Increase priority for stories with more tags (indicates more comprehensive content)
      if (enhancedStory.tags && enhancedStory.tags.length > 5) priority += 0.05;

      // Cap priority at 1.0
      priority = Math.min(priority, 1.0);

      // Create the basic sitemap entry
      const sitemapEntry: any = {
        url: `${baseUrl}/stories/${enhancedStory.slug}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority,
      };

      // Add image data if available with enhanced SEO information
      if (imageUrl) {
        const fullImageUrl = imageUrl.startsWith('http')
          ? imageUrl
          : `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;

        // Enhanced image sitemap data with additional attributes
        sitemapEntry.images = [
          {
            url: fullImageUrl,
            title: altText || enhancedStory.title,
            caption: caption || enhancedStory.excerpt?.substring(0, 100),
            geo_location: enhancedStory.country !== 'Global' ? enhancedStory.country : undefined,
            license: 'https://creativecommons.org/licenses/by/4.0/'
          }
        ];
      }

      return sitemapEntry;
    } catch (error) {
      // If there's any error processing a story, return a basic entry with current date
      console.error(`Error processing story for sitemap: ${story.slug}`, error);
      return {
        url: `${baseUrl}/stories/${story.slug}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    }
  });

  // Category routes - use the CATEGORIES constant for all defined categories
  const categoryRoutes = CATEGORIES.map((category) => {
    // Featured categories get higher priority
    const priority = category.featured ? 0.8 : 0.6;

    return {
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority,
    };
  });

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