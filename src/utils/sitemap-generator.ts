import fs from 'fs';
import path from 'path';
import { getAllStories } from './stories';
import { CATEGORIES } from '@/src/config/categories';
import { getAllCountries } from './countries';

interface SitemapURL {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate a sitemap XML string
 * @param urls Array of sitemap URLs
 * @returns XML string
 */
function generateSitemapXML(urls: SitemapURL[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const sitemapStart = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const sitemapEnd = '</urlset>';
  
  const urlsXML = urls.map(({ url, lastmod, changefreq, priority }) => {
    let urlXML = `<url><loc>${url}</loc>`;
    
    if (lastmod) {
      urlXML += `<lastmod>${lastmod}</lastmod>`;
    }
    
    if (changefreq) {
      urlXML += `<changefreq>${changefreq}</changefreq>`;
    }
    
    if (priority !== undefined) {
      urlXML += `<priority>${priority.toFixed(1)}</priority>`;
    }
    
    urlXML += '</url>';
    
    return urlXML;
  }).join('');
  
  return `${xmlHeader}${sitemapStart}${urlsXML}${sitemapEnd}`;
}

/**
 * Generate a sitemap index XML string
 * @param sitemaps Array of sitemap URLs
 * @returns XML string
 */
function generateSitemapIndexXML(sitemaps: { url: string; lastmod?: string }[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const sitemapStart = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const sitemapEnd = '</sitemapindex>';
  
  const sitemapsXML = sitemaps.map(({ url, lastmod }) => {
    let sitemapXML = `<sitemap><loc>${url}</loc>`;
    
    if (lastmod) {
      sitemapXML += `<lastmod>${lastmod}</lastmod>`;
    }
    
    sitemapXML += '</sitemap>';
    
    return sitemapXML;
  }).join('');
  
  return `${xmlHeader}${sitemapStart}${sitemapsXML}${sitemapEnd}`;
}

/**
 * Generate a sitemap for the website
 * @param baseUrl Base URL of the website
 * @param outputPath Output path for the sitemap
 */
export async function generateSitemap(baseUrl: string, outputPath: string): Promise<void> {
  try {
    // Get all stories
    const stories = await getAllStories();
    
    // Get all categories
    const categories = CATEGORIES;
    
    // Get all countries
    const countries = getAllCountries();
    
    // Static pages
    const staticPages: SitemapURL[] = [
      { url: `${baseUrl}/`, priority: 1.0, changefreq: 'daily' },
      { url: `${baseUrl}/about`, priority: 0.7, changefreq: 'monthly' },
      { url: `${baseUrl}/contact`, priority: 0.7, changefreq: 'monthly' },
      { url: `${baseUrl}/categories-main`, priority: 0.8, changefreq: 'weekly' },
      { url: `${baseUrl}/destinations`, priority: 0.8, changefreq: 'weekly' },
      { url: `${baseUrl}/search`, priority: 0.6, changefreq: 'weekly' },
      { url: `${baseUrl}/privacy-policy`, priority: 0.3, changefreq: 'yearly' },
      { url: `${baseUrl}/terms-of-service`, priority: 0.3, changefreq: 'yearly' },
    ];
    
    // Story pages
    const storyPages: SitemapURL[] = stories.map(story => ({
      url: `${baseUrl}/stories/${story.slug}`,
      lastmod: story.updatedAt || story.publishedAt,
      priority: story.featured ? 0.9 : (story.editorsPick ? 0.8 : 0.7),
      changefreq: 'monthly'
    }));
    
    // Category pages
    const categoryPages: SitemapURL[] = categories.map(category => ({
      url: `${baseUrl}/categories/${category.slug}`,
      priority: category.featured ? 0.8 : 0.7,
      changefreq: 'weekly'
    }));
    
    // Country pages
    const countryPages: SitemapURL[] = countries.map(country => ({
      url: `${baseUrl}/countries/${country.toLowerCase().replace(/\s+/g, '-')}`,
      priority: 0.7,
      changefreq: 'weekly'
    }));
    
    // Combine all URLs
    const allUrls = [
      ...staticPages,
      ...storyPages,
      ...categoryPages,
      ...countryPages
    ];
    
    // Generate sitemap XML
    const sitemapXML = generateSitemapXML(allUrls);
    
    // Write sitemap to file
    fs.writeFileSync(path.join(outputPath, 'sitemap.xml'), sitemapXML);
    
    console.log(`Sitemap generated at ${path.join(outputPath, 'sitemap.xml')}`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

/**
 * Generate a sitemap index for the website
 * @param baseUrl Base URL of the website
 * @param outputPath Output path for the sitemap index
 */
export async function generateSitemapIndex(baseUrl: string, outputPath: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Define sitemaps
    const sitemaps = [
      { url: `${baseUrl}/sitemap.xml`, lastmod: today },
      { url: `${baseUrl}/sitemap-stories.xml`, lastmod: today },
      { url: `${baseUrl}/sitemap-categories.xml`, lastmod: today },
      { url: `${baseUrl}/sitemap-countries.xml`, lastmod: today },
    ];
    
    // Generate sitemap index XML
    const sitemapIndexXML = generateSitemapIndexXML(sitemaps);
    
    // Write sitemap index to file
    fs.writeFileSync(path.join(outputPath, 'sitemap-index.xml'), sitemapIndexXML);
    
    console.log(`Sitemap index generated at ${path.join(outputPath, 'sitemap-index.xml')}`);
  } catch (error) {
    console.error('Error generating sitemap index:', error);
  }
}

export default {
  generateSitemap,
  generateSitemapIndex
};
