import { NextResponse } from 'next/server';
import { getAllStories } from '@/src/utils/stories';
import { Story } from '@/types/Story';
import { getCategoryUrl, getCountryUrl } from '@/src/utils/url';

export const dynamic = 'force-dynamic';

function escapeXml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeIsoDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export async function GET() {
  try {
    const stories = await getAllStories();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com';

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/stories</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/destinations</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms-of-service</loc>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Story pages -->
  ${stories.map((story: Story) => `
  <url>
    <loc>${escapeXml(`${baseUrl}/stories/${story.slug}`)}</loc>
    <lastmod>${safeIsoDate(story.publishedAt)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}

  <!-- Category pages -->
  ${Array.from(new Set(stories.map(story => story.category))).map(category => `
  <url>
    <loc>${escapeXml(getCategoryUrl(category, true))}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}

  <!-- Country pages -->
  ${Array.from(new Set(stories.map(story => story.country))).map(country => `
  <url>
    <loc>${escapeXml(getCountryUrl(country, true))}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (_error) {
    // Log error in production environments using proper logging
    return NextResponse.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 }
    );
  }
}
