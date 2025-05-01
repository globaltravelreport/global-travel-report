import { NextResponse } from 'next/server';
import { getAllStories } from '@/src/utils/stories';

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
 * Generate RSS feed for the site
 */
export async function GET() {
  const stories = await getAllStories();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
    <channel>
      <title>Global Travel Report</title>
      <link>${baseUrl}</link>
      <description>Latest travel stories and insights from around the world</description>
      <language>en</language>
      <lastBuildDate>${formatRssDate(new Date())}</lastBuildDate>
      <atom:link href="${baseUrl}/api/feed/rss" rel="self" type="application/rss+xml" />
      ${stories.map((story) => `
        <item>
          <title>${escapeXml(story.title)}</title>
          <link>${baseUrl}/stories/${story.slug}</link>
          <description>${escapeXml(story.excerpt)}</description>
          <pubDate>${formatRssDate(story.publishedAt)}</pubDate>
          <guid isPermaLink="true">${baseUrl}/stories/${story.slug}</guid>
          ${story.category ? `<category>${escapeXml(story.category)}</category>` : ''}
          ${story.tags?.map(tag => `<category>${escapeXml(tag)}</category>`).join('') || ''}
          ${story.author ? `<author>${escapeXml(story.author)}</author>` : ''}
          ${story.imageUrl ? `<enclosure url="${escapeXml(story.imageUrl)}" type="image/jpeg" />` : ''}
        </item>
      `).join('')}
    </channel>
    </rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}