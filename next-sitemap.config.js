/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com',
  generateRobotsTxt: false, // We're using the App Router robots.ts
  sitemapSize: 5000,
  exclude: [
    '/admin/*',
    '/api/*',
    '/private/*',
    '/server-sitemap.xml', // Exclude the server-side sitemap from the static sitemap
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/private/',
          '/search?*',
        ],
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com'}/server-sitemap.xml`,
    ],
  },
  // Add transform function to add image data to sitemap
  transform: async (config, path) => {
    // Basic configuration for all paths
    const sitemapConfig = {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };

    // Add image data for story pages
    if (path.startsWith('/stories/')) {
      // This is a placeholder - in a real implementation, you would fetch the actual image data
      // from your database or API
      sitemapConfig.images = [
        {
          loc: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com'}/images/og-image.jpg`,
          title: 'Global Travel Report',
          caption: 'Your trusted source for travel news, guides, and insights',
        },
      ];
    }

    return sitemapConfig;
  },
};
