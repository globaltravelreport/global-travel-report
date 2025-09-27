// Universal RSS Parsing Utility for Node.js and Edge
import { extract } from '@extractus/feed-extractor';

export interface NormalizedStory {
  title: string;
  link: string;
  content: string;
  published: string;
  author?: string;
  imageUrl?: string;
  categories?: string[];
  [key: string]: any;
}

export async function parseRSSFeed(feedUrl: string, options: { etag?: string; lastModified?: string } = {}): Promise<{ stories: NormalizedStory[]; etag?: string; lastModified?: string }> {
  try {
    const result = await extract(feedUrl, {
      getExtraFeedFields: true,
      getExtraEntryFields: true,
      headers: {
        'If-None-Match': options.etag || '',
        'If-Modified-Since': options.lastModified || ''
      }
    });
    if (!result || !result.entries) return { stories: [] };
    const stories = result.entries.map(entry => normalizeEntry(entry));
    return {
      stories,
      etag: result.etag,
      lastModified: result.lastModified
    };
  } catch (error) {
    return { stories: [] };
  }
}

function normalizeEntry(entry: any): NormalizedStory {
  return {
    title: cleanText(entry.title),
    link: entry.link,
    content: cleanContent(entry.content || entry.summary || ''),
    published: parseDate(entry.published || entry.updated),
    author: entry.author || '',
    imageUrl: extractImage(entry),
    categories: entry.categories || [],
    ...entry
  };
}

function cleanText(text: string): string {
  return text.replace(/<[^>]+>/g, '').trim();
}

function cleanContent(html: string): string {
  // Remove unwanted tags, normalize whitespace
  return html.replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDate(dateStr: string): string {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? '' : date.toISOString();
}

function extractImage(entry: any): string | undefined {
  if (entry.image) return entry.image;
  if (entry.enclosure && entry.enclosure.url) return entry.enclosure.url;
  if (entry.media && entry.media.url) return entry.media.url;
  // Try to find image in content
  const match = (entry.content || '').match(/<img[^>]+src=["']([^"'>]+)["']/i);
  return match ? match[1] : undefined;
}
