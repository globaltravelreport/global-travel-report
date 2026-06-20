/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  sitemapSize: 5000,
  exclude: [
    '/admin',
    '/admin/*',
    '/api/*',
    '/fallback',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
  },
};
