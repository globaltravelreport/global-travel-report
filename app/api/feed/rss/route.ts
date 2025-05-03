import { NextResponse } from 'next/server';
import { getAllStories } from '@/src/utils/stories';
import { CATEGORIES, getCategoryBySlug } from '@/src/config/categories';
import DOMPurify from 'isomorphic-dompurify';

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
    .replace(/'/g, '&apos;');
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
      xmlns:atom="http://www.w3.org/2005/Atom"
      xmlns:content="http://purl.org/rss/1.0/modules/content/"
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:media="http://search.yahoo.com/mrss/">
    <channel>
      <title>${escapeXml(feedTitle)}</title>
      <link>${baseUrl}</link>
      <description>${escapeXml(feedDescription)}</description>
      <language>en</language>
      <lastBuildDate>${formatRssDate(new Date())}</lastBuildDate>
      <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
      <copyright>Copyright ${new Date().getFullYear()} Global Travel Report</copyright>
      <managingEditor>editorial@globaltravelreport.com (Global Travel Report Editorial Team)</managingEditor>
      <webMaster>editorial@globaltravelreport.com (Global Travel Report Editorial Team)</webMaster>
      <image>
        <url>${baseUrl}/logo-gtr.png</url>
        <title>${escapeXml(feedTitle)}</title>
        <link>${baseUrl}</link>
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

        return `
        <item>
          <title>${escapeXml(story.title)}</title>
          <link>${baseUrl}/stories/${story.slug}</link>
          <description><![CDATA[${story.excerpt}]]></description>
          ${content}
          <pubDate>${formatRssDate(story.publishedAt)}</pubDate>
          <guid isPermaLink="true">${baseUrl}/stories/${story.slug}</guid>
          <dc:creator>Global Travel Report Editorial Team</dc:creator>
          ${story.category ? `<category>${escapeXml(story.category)}</category>` : ''}
          ${story.tags?.map(tag => `<category>${escapeXml(tag)}</category>`).join('') || ''}
          ${story.country ? `<category domain="country">${escapeXml(story.country)}</category>` : ''}
          ${imageUrl ? `
          <media:content url="${escapeXml(imageUrl)}" medium="image" type="image/jpeg">
            ${photographerCredit ? `<media:credit>${escapeXml(photographerCredit)}</media:credit>` : ''}
            <media:title>${escapeXml(story.title)}</media:title>
            <media:description>${escapeXml(story.excerpt)}</media:description>
          </media:content>` : ''}
        </item>
      `}).join('')}
    </channel>
    </rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}