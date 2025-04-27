import { getStories, Story } from '@/lib/stories';

export async function GET() {
  try {
    const stories = await getStories();
    
    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
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
        <content:encoded><![CDATA[${story.content}]]></content:encoded>
        <pubDate>${new Date(story.publishedAt).toUTCString()}</pubDate>
        <author>${story.author}</author>
        ${story.tags.map((tag: string) => `<category>${tag}</category>`).join('')}
      </item>
    `).join('')}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new Response('Error generating RSS feed', { status: 500 });
  }
} 