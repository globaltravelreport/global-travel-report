import { MetadataRoute } from "next";

/**
 * Generate robots.txt file with enhanced SEO instructions
 * @returns Robots.txt configuration for better search engine crawling
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com';

  return {
    rules: [
      {
        // Rules for Google bots - give them more access for better indexing
        userAgent: "Googlebot",
        allow: [
          "/",
          "/stories/",
          "/categories/",
          "/destinations/",
          "/countries/",
          "/offers/",
        ],
        disallow: [
          "/admin/",
          "/api/admin/",
          "/_next/",
          "/private/",
          "/search?*", // Disallow search with parameters to avoid duplicate content
          "/*.json$", // Disallow JSON files
          "/api/",
        ],
        // Crawl delay is not respected by Google, but included for completeness
        crawlDelay: 1,
      },
      {
        // Rules for Google Image bot
        userAgent: "Googlebot-Image",
        allow: [
          "/images/",
          "/public/images/",
        ],
        disallow: [
          "/_next/",
          "/api/",
        ],
      },
      {
        // Rules for Bing bots
        userAgent: "Bingbot",
        allow: [
          "/",
          "/stories/",
          "/categories/",
          "/destinations/",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/_next/",
          "/private/",
          "/search?*",
        ],
        crawlDelay: 2,
      },
      {
        // Rules for all other bots
        userAgent: "*",
        allow: [
          "/",
          "/stories/",
          "/categories/",
          "/destinations/",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/_next/",
          "/private/",
          "/search?*",
          "/api/feed/", // Disallow direct access to feed API
          "/*.json$", // Disallow JSON files
          "/*.js$", // Disallow JS files
          "/*.css$", // Disallow CSS files
        ],
        crawlDelay: 3,
      },
    ],
    // Add sitemap URLs - multiple sitemaps for better organization
    sitemap: [
      `${baseUrl}/sitemap.xml`,
    ],
    // Add host directive for better SEO
    host: baseUrl.replace(/^https?:\/\//, ''),
  };
}