import { NextResponse } from 'next/server';
import { getStories } from '@/app/lib/stories';

interface Story {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  country: string;
  holidayType: string;
  imageUrl: string;
}

export async function GET() {
  const stories = await getStories();
  
  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
    <channel>
      <title>Global Travel Report</title>
      <link>https://globaltravelreport.com</link>
      <description>Latest travel stories and insights from around the world</description>
      <language>en</language>
      ${stories.map((story: Story) => `
        <item>
          <title>${story.title}</title>
          <link>https://globaltravelreport.com/stories/${story.slug}</link>
          <description>${story.excerpt}</description>
          <pubDate>${new Date().toUTCString()}</pubDate>
          <guid>https://globaltravelreport.com/stories/${story.slug}</guid>
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