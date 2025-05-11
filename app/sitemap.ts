import { MetadataRoute } from 'next';

/**
 * Generate a simplified static sitemap
 * @returns A sitemap configuration for Next.js
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://globaltravelreport.com';
  const currentDate = new Date();

  // Define categories for the sitemap
  const categories = [
    'cruises',
    'airlines',
    'hotels',
    'destinations',
    'travel-tips',
    'food-dining',
    'adventure',
    'culture',
    'nature',
    'luxury-travel',
    'budget-travel',
    'family-travel',
    'solo-travel',
  ];

  // Static routes
  const routes = [
    '',
    '/about',
    '/contact',
    '/categories',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' ? 'daily' as const : 'monthly' as const,
    priority: route === '' ? 1 : route === '/categories' ? 0.9 : 0.8,
  }));

  // Category routes
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/categories/${category}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    ...routes,
    ...categoryRoutes,
  ];
}