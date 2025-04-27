import { MetadataRoute } from "next";

// This would typically come from your database or API
const getStories = async () => {
  return [
    {
      slug: "exploring-kyoto",
      lastModified: "2024-03-15",
    },
    {
      slug: "safari-adventure",
      lastModified: "2024-03-10",
    },
    {
      slug: "italian-cuisine",
      lastModified: "2024-03-05",
    },
  ];
};

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
  const baseUrl = "https://globaltravelreport.com"; // Replace with your actual domain
  const stories = await getStories();
  const categories = getCategories();
  const countries = getCountries();
  const tags = getTags();

  // Static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/stories`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  // Story routes
  const storyRoutes = stories.map((story) => ({
    url: `${baseUrl}/stories/${story.slug}`,
    lastModified: new Date(story.lastModified),
    changeFrequency: "weekly" as const,
    priority: 0.6,
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