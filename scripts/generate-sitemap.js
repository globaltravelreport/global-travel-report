/**
 * Enhanced Sitemap Generator for Global Travel Report
 *
 * This script generates a comprehensive XML sitemap with:
 * - All static pages from the app directory
 * - All story pages with proper lastmod dates
 * - All category pages
 * - All country pages
 * - All tag pages
 *
 * It also includes proper priorities and change frequencies.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
// Use glob instead of globby since globby is ESM-only

/**
 * Get all static pages from the app directory
 * @returns {Promise<string[]>} Array of page URLs
 */
async function getStaticPages(baseUrl) {
  try {
    // Get all page files using glob
    const pagePatterns = [
      'app/**/page.tsx',
      'app/**/page.jsx'
    ];

    const pages = [];
    for (const pattern of pagePatterns) {
      const matches = await glob(pattern);
      pages.push(...matches);
    }

    // Filter out dynamic routes and API routes
    const filteredPages = pages.filter(page => {
      return !page.includes('/[') && !page.includes('/api/');
    });

    // Convert file paths to URLs
    return filteredPages.map(page => {
      // Remove 'app/' and '/page.tsx'
      const pagePath = page
        .replace('app/', '/')
        .replace('/page.tsx', '')
        .replace('/page.jsx', '');

      // Handle index routes
      const route = pagePath === '/index' ? '' : pagePath;

      return {
        url: `${baseUrl}${route}`,
        changefreq: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? '1.0' : '0.5'
      };
    });
  } catch (error) {
    console.error('Error getting static pages:', error);
    return [];
  }
}

/**
 * Get all story URLs with metadata
 */
async function getStoryUrls(baseUrl) {
  try {
    const storiesDir = path.join(process.cwd(), 'data', 'stories');
    const storyFiles = await glob('**/*.json', { cwd: storiesDir });

    return storyFiles.map(storyFile => {
      try {
        const storyPath = path.join(storiesDir, storyFile);
        const data = JSON.parse(fs.readFileSync(storyPath, 'utf8'));
        const slug = path.basename(storyFile, '.json');

        // Get the last modified date
        const stats = fs.statSync(storyPath);
        const lastmod = data.updatedAt || data.publishedAt || stats.mtime.toISOString();

        return {
          url: `${baseUrl}/stories/${slug}`,
          lastmod: new Date(lastmod).toISOString(),
          changefreq: 'weekly',
          priority: data.featured ? '0.8' : '0.7'
        };
      } catch (error) {
        console.error(`Error processing story file ${storyFile}:`, error);
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error('Error getting story URLs:', error);
    return [];
  }
}

/**
 * Get all tag, category, and country URLs
 */
async function getTaxonomyUrls(baseUrl) {
  try {
    const storiesDir = path.join(process.cwd(), 'data', 'stories');
    const storyFiles = await glob('**/*.json', { cwd: storiesDir });

    const tags = new Set();
    const categories = new Set();
    const countries = new Set();

    storyFiles.forEach(storyFile => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(storiesDir, storyFile), 'utf8'));

        // Add tags
        if (data.tags && Array.isArray(data.tags)) {
          data.tags.forEach(tag => tags.add(tag));
        }

        // Add category
        if (data.category) {
          categories.add(data.category);
        }

        // Add country
        if (data.country) {
          countries.add(data.country);
        }
      } catch (error) {
        console.error(`Error processing taxonomy for ${storyFile}:`, error);
      }
    });

    // Convert to URL objects
    const tagUrls = Array.from(tags).map(tag => ({
      url: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
      changefreq: 'weekly',
      priority: '0.6'
    }));

    const categoryUrls = Array.from(categories).map(category => ({
      url: `${baseUrl}/categories/${encodeURIComponent(category.toLowerCase())}`,
      changefreq: 'weekly',
      priority: '0.7'
    }));

    const countryUrls = Array.from(countries).map(country => ({
      url: `${baseUrl}/countries/${encodeURIComponent(country.toLowerCase())}`,
      changefreq: 'weekly',
      priority: '0.7'
    }));

    return [...tagUrls, ...categoryUrls, ...countryUrls];
  } catch (error) {
    console.error('Error getting taxonomy URLs:', error);
    return [];
  }
}

/**
 * Generate the XML sitemap
 */
async function generateSitemap() {
  try {
    console.log('Generating enhanced sitemap...');

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com';

    // Get all URLs
    const staticPages = await getStaticPages(baseUrl);
    const storyUrls = await getStoryUrls(baseUrl);
    const taxonomyUrls = await getTaxonomyUrls(baseUrl);

    // Combine all URLs
    const allUrls = [...staticPages, ...storyUrls, ...taxonomyUrls];

    // Generate XML
    const sitemap = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',

      // Add all URLs
      ...allUrls.map(({ url, lastmod, changefreq, priority }) => {
        const parts = ['<url>'];
        parts.push(`<loc>${url}</loc>`);

        if (lastmod) {
          parts.push(`<lastmod>${lastmod}</lastmod>`);
        }

        if (changefreq) {
          parts.push(`<changefreq>${changefreq}</changefreq>`);
        }

        if (priority) {
          parts.push(`<priority>${priority}</priority>`);
        }

        parts.push('</url>');
        return parts.join('');
      }),

      '</urlset>'
    ].join('\n');

    // Write sitemap to public directory
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);

    console.log(`Sitemap generated successfully at ${sitemapPath}`);
    console.log(`Total URLs: ${allUrls.length}`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

generateSitemap().catch(console.error)