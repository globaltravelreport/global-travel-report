import { MetadataRoute } from "next";

/**
 * Generate robots.txt file
 * @returns Robots.txt configuration
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com';

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/_next/",
        "/private/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}