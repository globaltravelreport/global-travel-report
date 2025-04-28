import { MetadataRoute } from "next";
import { getStories } from '@/lib/stories';

// This would typically come from your database or API
const getCategories = () => {
  return [
    "adventure",
    "culture",
    "food",
    "nature",
    "urban",
  ];
};

const getCountries = () => {
  return [
    "japan",
    "tanzania",
    "italy",
    "france",
    "thailand",
  ];
};

const getTags = () => {
  return [
    "temples",
    "wildlife",
    "culinary",
    "history",
    "beaches",
  ];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await getStories();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';
  const categories = getCategories();
  const countries = getCountries();
  const tags = getTags();

  // Static routes
  const routes = [
    '',
    '/about',
    '/contact',
    '/stories',
    '/categories/hotels',
    '/categories/airlines',
    '/categories/cruises',
    '/categories/destinations',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes for stories
  const storyRoutes = stories.map((story) => ({
    url: `${baseUrl}/stories/${story.slug}`,
    lastModified: story.publishedAt,
    changeFrequency: 'weekly' as const,
    priority: story.featured ? 0.9 : 0.7,
  }));

  // Category routes
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/categories/${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  // Country routes
  const countryRoutes = countries.map((country) => ({
    url: `${baseUrl}/countries/${country}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  // Tag routes
  const tagRoutes = tags.map((tag) => ({
    url: `${baseUrl}/tags/${tag}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  return [
    ...routes,
    ...storyRoutes,
    ...categoryRoutes,
    ...countryRoutes,
    ...tagRoutes,
  ];
} 