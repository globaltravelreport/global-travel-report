import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://globaltravelreport.com"; // Replace with your actual domain

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

  // Add dynamic story routes
  // In a real application, you would fetch this from your database
  const storyRoutes = [
    "exploring-kyoto",
    "safari-adventure",
    "italian-cuisine",
  ].map((slug) => ({
    url: `${baseUrl}/stories/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...routes, ...storyRoutes];
} 