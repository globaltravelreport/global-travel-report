/**
 * Global Travel Report Daily Story Pipeline
 *
 * RSS sources -> fact-safe AI rewrite -> Unsplash image -> draft/publish -> site RSS.
 *
 * By default this creates validated drafts in the run result. Set
 * AUTO_PUBLISH_STORIES=true only after editorial review is ready.
 */

import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import Parser from 'rss-parser';
import dotenv from 'dotenv';
import { generateStoryContent } from '../src/services/aiService.ts';
import { StoryDatabase } from '../src/services/storyDatabase.ts';
import { UnsplashService } from '../src/services/unsplashService.ts';

dotenv.config({ path: '.env.local' });

const MAX_STORIES_PER_DAY = Number.parseInt(process.env.MAX_STORIES_PER_DAY || '5', 10);
const MIN_SOURCE_WORDS = Number.parseInt(process.env.MIN_RSS_SOURCE_WORDS || '120', 10);
const AUTO_PUBLISH_STORIES = process.env.AUTO_PUBLISH_STORIES === 'true';
const RSS_FEED_URLS = getFeedUrls();

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'GlobalTravelReport/2.0 (+https://www.globaltravelreport.com)'
  },
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
      ['media:content', 'media'],
      ['media:thumbnail', 'thumbnail']
    ]
  }
});

const db = StoryDatabase.getInstance();
const unsplashService = UnsplashService.getInstance();

const DEFAULT_FEEDS = [
  'https://www.travelweekly.com/rss',
  'https://www.travelpulse.com/rss',
  'https://www.travelandleisure.com/feeds/all.rss',
  'https://www.timeout.com/travel/rss',
  'https://www.cruiseindustrynews.com/cruise-news/rss.xml',
  'https://www.cruisecritic.com/rss/news.xml'
];

const CATEGORY_KEYWORDS = {
  'Air Travel': ['flight', 'airline', 'airport', 'aviation', 'aircraft', 'route'],
  Cruise: ['cruise', 'ship', 'voyage', 'port', 'sailing'],
  Accommodation: ['hotel', 'resort', 'accommodation', 'suite', 'lodging'],
  Destinations: ['destination', 'city', 'country', 'island', 'beach', 'region'],
  Tours: ['tour', 'itinerary', 'guide', 'excursion', 'experience'],
  Safety: ['warning', 'advice', 'visa', 'passport', 'safety', 'alert'],
  Deals: ['deal', 'sale', 'discount', 'offer', 'fare']
};

function getFeedUrls() {
  const configured = process.env.RSS_FEED_URLS;
  if (!configured) {
    return DEFAULT_FEEDS;
  }

  return configured
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
}

function stripHtml(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordCount(value = '') {
  return stripHtml(value).split(/\s+/).filter(Boolean).length;
}

function truncate(value = '', limit = 7000) {
  const clean = stripHtml(value);
  return clean.length > limit ? `${clean.slice(0, limit)}...` : clean;
}

function slugify(value = '') {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90);
}

function hash(value = '') {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 20);
}

function parseDate(value) {
  if (!value) {
    return new Date().toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function inferCategory(text) {
  const lower = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return category;
    }
  }

  return 'Travel News';
}

function inferCountry(text) {
  const countries = [
    'Australia', 'New Zealand', 'Japan', 'Thailand', 'Indonesia', 'Fiji',
    'United States', 'Canada', 'United Kingdom', 'France', 'Italy', 'Spain',
    'Greece', 'Singapore', 'China', 'India', 'Vietnam', 'Global'
  ];
  const lower = text.toLowerCase();
  return countries.find((country) => lower.includes(country.toLowerCase())) || 'Global';
}

function extractTags(text) {
  const lower = text.toLowerCase();
  const candidates = [
    'travel news', 'air travel', 'cruise', 'hotels', 'destinations',
    'australian travellers', 'travel safety', 'deals', 'tours', 'family travel',
    'luxury travel', 'sustainable travel'
  ];

  return candidates.filter((tag) => lower.includes(tag.replace(' travel', ''))).slice(0, 6);
}

function extractNumbers(text) {
  return new Set((text.match(/\b\d+(?:[.,]\d+)?%?\b/g) || []).map((value) => value.replace(/,/g, '')));
}

function hasUnsupportedNumbers(sourceText, rewrittenText) {
  const sourceNumbers = extractNumbers(sourceText);
  const rewrittenNumbers = extractNumbers(rewrittenText);

  for (const value of rewrittenNumbers) {
    if (!sourceNumbers.has(value)) {
      return true;
    }
  }

  return false;
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI response did not contain a JSON object');
  }

  return JSON.parse(candidate.slice(start, end + 1));
}

function normaliseFeedItem(item, feedUrl) {
  const content = stripHtml(
    item.contentEncoded ||
    item.content ||
    item['content:encoded'] ||
    item.summary ||
    item.contentSnippet ||
    item.description ||
    ''
  );

  const link = item.link || item.guid || '';
  const title = stripHtml(item.title || '');

  return {
    id: hash(`${link}:${title}`),
    title,
    content,
    sourceUrl: link,
    sourceFeedUrl: feedUrl,
    sourceName: stripHtml(item.creator || item.author || item.feedTitle || ''),
    guid: item.guid || link,
    originalPublishedAt: parseDate(item.isoDate || item.pubDate || item.published),
    category: inferCategory(`${title} ${content}`),
    country: inferCountry(`${title} ${content}`)
  };
}

async function fetchRssCandidates() {
  const candidates = [];
  const failures = [];

  for (const feedUrl of RSS_FEED_URLS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const items = (feed.items || [])
        .slice(0, 8)
        .map((item) => normaliseFeedItem({ ...item, feedTitle: feed.title }, feedUrl))
        .filter((item) => item.title && item.sourceUrl && item.content);

      candidates.push(...items);
    } catch (error) {
      failures.push({ feedUrl, error: error instanceof Error ? error.message : String(error) });
    }
  }

  const seen = new Set();
  const unique = candidates
    .filter((item) => {
      const key = item.sourceUrl || item.guid || item.title;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.originalPublishedAt).getTime() - new Date(a.originalPublishedAt).getTime());

  return { candidates: unique, failures };
}

function buildRewritePrompt(source) {
  return `You are the Global Travel Report editorial desk for Australian readers.

Rewrite this RSS source into an original travel news draft.

Hard rules:
- Return only valid JSON. No markdown.
- Do not invent dates, prices, passenger numbers, route details, opening dates, warnings, visa rules, quotes, or statistics.
- If the source text does not support a detail, omit it.
- If the source is too thin or mostly promotional, return {"status":"rejected","reason":"..."}.
- Use Australian English.
- Keep the tone clear, practical, and editorial.
- Mention why the story matters to Australian travellers where supported by the source.
- Do not mention AI, automation, RSS, rewriting, or prompts.

Return this JSON shape:
{
  "status": "accepted",
  "title": "clear factual headline",
  "excerpt": "one sentence",
  "paragraphs": ["5 to 8 short paragraphs"],
  "category": "Air Travel | Cruise | Accommodation | Destinations | Tours | Safety | Deals | Travel News",
  "country": "best matching country or Global",
  "tags": ["5", "short", "tags"],
  "imageQuery": "specific travel image search query"
}

Source title: ${source.title}
Source URL: ${source.sourceUrl}
Source published date: ${source.originalPublishedAt}
Source category hint: ${source.category}
Source text:
${truncate(source.content)}`;
}

async function rewriteSource(source) {
  if (wordCount(source.content) < MIN_SOURCE_WORDS) {
    return {
      status: 'rejected',
      reason: `Source too thin: ${wordCount(source.content)} words`
    };
  }

  const response = await generateStoryContent(buildRewritePrompt(source), {
    temperature: 0.2,
    maxTokens: 1800
  });

  const parsed = extractJson(response.content);

  if (parsed.status !== 'accepted') {
    return {
      status: 'rejected',
      reason: parsed.reason || 'AI rejected source'
    };
  }

  const paragraphs = Array.isArray(parsed.paragraphs)
    ? parsed.paragraphs.map(stripHtml).filter(Boolean)
    : [];

  const rewrittenText = [
    parsed.title,
    parsed.excerpt,
    ...paragraphs
  ].join('\n');

  if (!parsed.title || !parsed.excerpt || paragraphs.length < 4) {
    return {
      status: 'rejected',
      reason: 'AI response was incomplete'
    };
  }

  if (hasUnsupportedNumbers(source.content, rewrittenText)) {
    return {
      status: 'rejected',
      reason: 'AI introduced numbers not present in source'
    };
  }

  return {
    status: 'accepted',
    title: stripHtml(parsed.title),
    excerpt: stripHtml(parsed.excerpt),
    content: paragraphs.join('\n\n'),
    category: parsed.category || source.category || 'Travel News',
    country: parsed.country || source.country || 'Global',
    tags: Array.isArray(parsed.tags) ? parsed.tags.map(stripHtml).filter(Boolean).slice(0, 8) : extractTags(rewrittenText),
    imageQuery: stripHtml(parsed.imageQuery || `${source.country} ${source.category} travel`)
  };
}

async function triggerUnsplashDownload(downloadLocation) {
  if (!downloadLocation || !process.env.UNSPLASH_ACCESS_KEY) {
    return;
  }

  try {
    await fetch(`${downloadLocation}?client_id=${process.env.UNSPLASH_ACCESS_KEY}`);
  } catch (error) {
    console.warn('Unsplash download tracking failed:', error instanceof Error ? error.message : String(error));
  }
}

async function findImage(query) {
  try {
    const images = await unsplashService.searchImages(query, {
      orientation: 'landscape',
      perPage: 1
    });

    const image = images[0];
    if (!image) {
      return null;
    }

    await triggerUnsplashDownload(image.downloadLocation);

    return {
      imageUrl: image.url,
      imageAlt: image.alt,
      photographer: {
        name: image.photographer.name,
        username: image.photographer.username,
        url: image.photographer.profileUrl,
        profileUrl: image.photographer.profileUrl
      },
      imageCredit: `Photo by ${image.photographer.name} on Unsplash`,
      imageCreditUrl: image.photographer.profileUrl
    };
  } catch (error) {
    console.warn('Unsplash image lookup failed:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function isDuplicate(source) {
  const existing = await db.getAllStories();
  const sourceHash = hash(`${source.sourceUrl}:${source.title}`);
  const sourceSlug = slugify(source.title);

  return existing.some((story) => (
    story.sourceUrl === source.sourceUrl ||
    story.contentHash === sourceHash ||
    story.slug === sourceSlug
  ));
}

function buildStory(source, rewrite, image) {
  const now = new Date().toISOString();
  const slug = slugify(rewrite.title);
  const contentHash = hash(`${source.sourceUrl}:${source.title}`);

  return {
    id: `rss-${contentHash}`,
    slug,
    title: rewrite.title,
    excerpt: rewrite.excerpt,
    content: rewrite.content,
    author: 'Global Travel Report Editorial Team',
    publishedAt: now,
    updatedAt: now,
    originalPublishedAt: source.originalPublishedAt,
    firstSeenAt: now,
    source: source.sourceName || source.sourceFeedUrl,
    sourceUrl: source.sourceUrl,
    ingestionSource: source.sourceFeedUrl,
    contentHash,
    category: rewrite.category,
    country: rewrite.country,
    tags: rewrite.tags?.length ? rewrite.tags : ['travel news'],
    featured: false,
    editorsPick: false,
    rewritten: true,
    processedAt: now,
    wordCount: wordCount(rewrite.content),
    imageUrl: image?.imageUrl || '',
    imageAlt: image?.imageAlt || rewrite.title,
    imageCredit: image?.imageCredit,
    imageCreditUrl: image?.imageCreditUrl,
    photographer: image?.photographer
  };
}

async function processCandidate(source) {
  if (await isDuplicate(source)) {
    return {
      status: 'duplicate',
      title: source.title,
      sourceUrl: source.sourceUrl
    };
  }

  const rewrite = await rewriteSource(source);
  if (rewrite.status !== 'accepted') {
    return {
      status: 'rejected',
      title: source.title,
      sourceUrl: source.sourceUrl,
      reason: rewrite.reason
    };
  }

  const image = await findImage(rewrite.imageQuery);
  const story = buildStory(source, rewrite, image);

  if (AUTO_PUBLISH_STORIES) {
    await db.addStory(story);
  }

  return {
    status: AUTO_PUBLISH_STORIES ? 'published' : 'draft',
    story,
    sourceUrl: source.sourceUrl
  };
}

async function runDailyAutomation() {
  validateEnvironment();

  const startedAt = new Date().toISOString();
  const result = {
    success: false,
    mode: AUTO_PUBLISH_STORIES ? 'publish' : 'draft',
    startedAt,
    finishedAt: null,
    feedsChecked: RSS_FEED_URLS.length,
    feedFailures: [],
    candidatesFound: 0,
    processed: [],
    summary: {
      drafts: 0,
      published: 0,
      duplicates: 0,
      rejected: 0,
      failed: 0
    }
  };

  console.log('Starting Global Travel Report daily story pipeline');
  console.log(`Mode: ${result.mode}`);

  const { candidates, failures } = await fetchRssCandidates();
  result.feedFailures = failures;
  result.candidatesFound = candidates.length;

  const selected = candidates.slice(0, MAX_STORIES_PER_DAY);

  for (const source of selected) {
    try {
      const processed = await processCandidate(source);
      result.processed.push(processed);

      if (processed.status === 'draft') result.summary.drafts++;
      if (processed.status === 'published') result.summary.published++;
      if (processed.status === 'duplicate') result.summary.duplicates++;
      if (processed.status === 'rejected') result.summary.rejected++;
    } catch (error) {
      result.summary.failed++;
      result.processed.push({
        status: 'failed',
        title: source.title,
        sourceUrl: source.sourceUrl,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  result.finishedAt = new Date().toISOString();
  result.success = result.summary.failed === 0;

  console.log('Daily story pipeline finished', result.summary);
  return result;
}

function validateEnvironment() {
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
  const required = ['UNSPLASH_ACCESS_KEY'];

  if (provider === 'cloudflare') {
    required.push('CLOUDFLARE_AI_WORKER_URL', 'CLOUDFLARE_AI_WORKER_TOKEN');
  } else if (provider === 'google') {
    required.push('GOOGLE_API_KEY');
  } else {
    required.push('OPENAI_API_KEY');
  }

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runDailyAutomation()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

export { runDailyAutomation };
