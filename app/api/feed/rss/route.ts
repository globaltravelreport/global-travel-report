import { NextResponse } from 'next/server';
import { getAllStories } from '@/utils/stories';
import { CATEGORIES, getCategoryBySlug } from '@/src/config/categories';
import DOMPurify from 'isomorphic-dompurify';

// Set cache control headers for better performance
const CACHE_CONTROL = 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400';

// Define RSS feed namespaces for enhanced functionality
const RSS_NAMESPACES = {
  atom: 'http://www.w3.org/2005/Atom',
  content: 'http://purl.org/rss/1.0/modules/content/',
  dc: 'http://purl.org/dc/elements/1.1/',
  media: 'http://search.yahoo.com/mrss/',
  sy: 'http://purl.org/rss/1.0/modules/syndication/',
  slash: 'http://purl.org/rss/1.0/modules/slash/',
  georss: 'http://www.georss.org/georss',
  wfw: 'http://wellformedweb.org/CommentAPI/'
};

/**
 * Escape XML special characters to prevent malformed XML
 * @param text - The text to escape
 * @returns Escaped text safe for XML
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format a date for RSS feed (RFC 822 format)
 * @param date - The date to format
 * @returns Formatted date string
 */
function formatRssDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toUTCString();
}

/**
 * Clean HTML content for RSS feed
 * @param html - The HTML content to clean
 * @returns Cleaned HTML content
 */
function cleanHtml(html: string): string {
  // Sanitize HTML to remove potentially harmful content
  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'ul', 'ol', 'li',
      'strong', 'em', 'a', 'blockquote', 'img', 'figure', 'figcaption'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class']
  });

  return clean;
}

/**
 * Generate RSS feed for the site
 */
export async function GET(request: Request) {
  // Get the URL to check for category parameter
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  // Get all stories
  const stories = await getAllStories();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';

  // Filter stories by category if specified
  let filteredStories = stories;
  let categoryInfo = null;

  if (categorySlug) {
    categoryInfo = getCategoryBySlug(categorySlug);
    if (categoryInfo) {
      filteredStories = stories.filter(story => {
        const storyCategory = story.category?.toLowerCase().replace(/\s+/g, '-');
        return storyCategory === categorySlug;
      });
    }
  }

  // Sort by publication date (newest first) and limit
  filteredStories = filteredStories
    .sort((a, b) => {
      const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
      const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, limit);

  // Generate feed title and description based on category
  const feedTitle = categoryInfo
    ? `${categoryInfo.name} - Global Travel Report`
    : 'Global Travel Report';

  const feedDescription = categoryInfo
    ? `Latest ${categoryInfo.name.toLowerCase()} travel stories and insights from Global Travel Report`
    : 'Latest travel stories and insights from around the world';

  const feedUrl = categorySlug
    ? `${baseUrl}/api/feed/rss?category=${categorySlug}`
    : `${baseUrl}/api/feed/rss`;

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0"
      xmlns:atom="${RSS_NAMESPACES.atom}"
      xmlns:content="${RSS_NAMESPACES.content}"
      xmlns:dc="${RSS_NAMESPACES.dc}"
      xmlns:media="${RSS_NAMESPACES.media}"
      xmlns:sy="${RSS_NAMESPACES.sy}"
      xmlns:slash="${RSS_NAMESPACES.slash}"
      xmlns:georss="${RSS_NAMESPACES.georss}"
      xmlns:wfw="${RSS_NAMESPACES.wfw}">
    <channel>
      <title>${escapeXml(feedTitle)}</title>
      <link>${baseUrl}</link>
      <description>${escapeXml(feedDescription)}</description>
      <language>en-au</language>
      <lastBuildDate>${formatRssDate(new Date())}</lastBuildDate>
      <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
      <copyright>Copyright ${new Date().getFullYear()} Global Travel Report</copyright>
      <managingEditor>editorial@globaltravelreport.com (Global Travel Report Editorial Team)</managingEditor>
      <webMaster>editorial@globaltravelreport.com (Global Travel Report Editorial Team)</webMaster>
      <docs>https://validator.w3.org/feed/docs/rss2.html</docs>
      <generator>Global Travel Report RSS Generator</generator>
      <sy:updatePeriod>hourly</sy:updatePeriod>
      <sy:updateFrequency>24</sy:updateFrequency>
      <image>
        <url>${baseUrl}/logo-gtr.png</url>
        <title>${escapeXml(feedTitle)}</title>
        <link>${baseUrl}</link>
        <width>144</width>
        <height>144</height>
      </image>
      ${filteredStories.map((story) => {
        // Prepare content with proper CDATA wrapping
        const content = story.content ? `<content:encoded><![CDATA[${cleanHtml(story.content)}]]></content:encoded>` : '';

        // Prepare image data
        const imageUrl = story.imageUrl?.startsWith('http')
          ? story.imageUrl
          : `${baseUrl}${story.imageUrl || '/images/default-story.jpg'}`;

        // Prepare photographer credit
        const photographerCredit = story.photographer
          ? `Photo by ${story.photographer.name}`
          : (story.imageCredit || '');

        // Generate a unique comment feed URL
        const commentFeedUrl = `${baseUrl}/stories/${story.slug}#comments`;

        // Generate geographic information if available
        const geoRssTag = story.country && story.country !== 'Global'
          ? `<georss:featurename>${escapeXml(story.country)}</georss:featurename>`
          : '';

        // Add social sharing links
        const socialSharingHtml = `
          <p>Share this story:</p>
          <ul>
            <li><a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${baseUrl}/stories/${story.slug}`)}" target="_blank" rel="noopener noreferrer">Share on Facebook</a></li>
            <li><a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(`${baseUrl}/stories/${story.slug}`)}&text=${encodeURIComponent(story.title)}" target="_blank" rel="noopener noreferrer">Share on Twitter</a></li>
            <li><a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${baseUrl}/stories/${story.slug}`)}" target="_blank" rel="noopener noreferrer">Share on LinkedIn</a></li>
          </ul>
        `;

        // Enhance content with social sharing buttons if content exists
        const enhancedContent = story.content
          ? `<content:encoded><![CDATA[${cleanHtml(story.content)}${socialSharingHtml}]]></content:encoded>`
          : '';

        return `
        <item>
          <title>${escapeXml(story.title)}</title>
          <link>${baseUrl}/stories/${story.slug}</link>
          <description><![CDATA[${story.excerpt}]]></description>
          ${enhancedContent}
          <pubDate>${formatRssDate(story.publishedAt)}</pubDate>
          <guid isPermaLink="true">${baseUrl}/stories/${story.slug}</guid>
          <dc:creator>Global Travel Report Editorial Team</dc:creator>
          <dc:publisher>Global Travel Report</dc:publisher>
          <dc:rights>Copyright ${new Date().getFullYear()} Global Travel Report</dc:rights>
          ${story.category ? `<category>${escapeXml(story.category)}</category>` : ''}
          ${story.tags?.map(tag => `<category>${escapeXml(tag)}</category>`).join('') || ''}
          ${story.country ? `<category domain="country">${escapeXml(story.country)}</category>` : ''}
          <wfw:commentRss>${commentFeedUrl}</wfw:commentRss>
          <slash:comments>0</slash:comments>
          ${geoRssTag}
          ${imageUrl ? `
          <media:content url="${escapeXml(imageUrl)}" medium="image" type="image/jpeg">
            ${photographerCredit ? `<media:credit role="photographer">${escapeXml(photographerCredit)}</media:credit>` : ''}
            <media:title>${escapeXml(story.title)}</media:title>
            <media:description>${escapeXml(story.excerpt)}</media:description>
            <media:thumbnail url="${escapeXml(imageUrl)}" width="300" height="200" />
            <media:copyright>Photo credit: ${escapeXml(photographerCredit || 'Unsplash')}</media:copyright>
          </media:content>` : ''}
        </item>
      `}).join('')}
    </channel>
    </rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': CACHE_CONTROL,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  });
}