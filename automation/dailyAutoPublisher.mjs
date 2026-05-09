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
import { SupabaseStoryStore } from '../src/services/supabaseStoryStore.ts';
import { UnsplashService } from '../src/services/unsplashService.ts';

dotenv.config({ path: '.env.local' });

const MAX_STORIES_PER_DAY = Number.parseInt(process.env.MAX_STORIES_PER_DAY || '1', 10);
const MIN_SOURCE_WORDS = Number.parseInt(process.env.MIN_RSS_SOURCE_WORDS || '120', 10);
const MAX_CANDIDATES_TO_REVIEW = Number.parseInt(process.env.MAX_RSS_CANDIDATES_TO_REVIEW || '4', 10);
const ARTICLE_FETCH_TIMEOUT_MS = Number.parseInt(process.env.ARTICLE_FETCH_TIMEOUT_MS || '2500', 10);
const AUTO_PUBLISH_STORIES = process.env.AUTO_PUBLISH_STORIES === 'true';

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

async function getRuntimeFeedUrls() {
  if (process.env.RSS_FEED_URLS) {
    return getFeedUrls();
  }

  if (SupabaseStoryStore.isConfigured()) {
    try {
      const feedUrls = await SupabaseStoryStore.getEnabledFeedUrls();
      if (feedUrls.length > 0) {
        return feedUrls;
      }
    } catch (error) {
      console.warn('Supabase RSS source lookup failed:', error instanceof Error ? error.message : String(error));
    }
  }

  return DEFAULT_FEEDS;
}

function stripHtml(value = '') {
  return String(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtmlEntities(value = '') {
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number.parseInt(code, 10)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function wordCount(value = '') {
  return stripHtml(value).split(/\s+/).filter(Boolean).length;
}

function truncate(value = '', limit = 7000) {
  const clean = stripHtml(value);
  return clean.length > limit ? `${clean.slice(0, limit)}...` : clean;
}

function extractMetaContent(html, property) {
  const pattern = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  return decodeHtmlEntities(pattern.exec(html)?.[1] || '');
}

function extractReadableArticleText(html = '') {
  const cleanedHtml = String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ');

  const candidates = [
    ...cleanedHtml.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/gi),
    ...cleanedHtml.matchAll(/<main\b[^>]*>([\s\S]*?)<\/main>/gi),
    ...cleanedHtml.matchAll(/<div\b[^>]+(?:class|id)=["'][^"']*(?:post-content|entry-content|article-content|story-content|content__article|article-body)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi)
  ].map((match) => stripHtml(decodeHtmlEntities(match[1])));

  const bestCandidate = candidates
    .filter((text) => wordCount(text) >= 80)
    .sort((a, b) => wordCount(b) - wordCount(a))[0];

  if (bestCandidate) {
    return bestCandidate;
  }

  const metaDescription = extractMetaContent(cleanedHtml, 'og:description') ||
    extractMetaContent(cleanedHtml, 'description');

  if (metaDescription) {
    return stripHtml(metaDescription);
  }

  const paragraphs = [...cleanedHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripHtml(decodeHtmlEntities(match[1])))
    .filter((paragraph) => wordCount(paragraph) >= 8);

  return paragraphs.join('\n\n');
}

async function fetchArticleText(url) {
  if (!url || !/^https?:\/\//i.test(url)) {
    return '';
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ARTICLE_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'GlobalTravelReport/2.0 (+https://www.globaltravelreport.com)',
        Accept: 'text/html,application/xhtml+xml'
      },
      redirect: 'follow'
    });

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.toLowerCase().includes('html')) {
      return '';
    }

    return extractReadableArticleText(await response.text());
  } catch (error) {
    console.warn('Article page lookup failed:', url, error instanceof Error ? error.message : String(error));
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

async function enrichCandidateContent(source) {
  if (wordCount(source.content) >= MIN_SOURCE_WORDS) {
    return source;
  }

  const articleText = await fetchArticleText(source.sourceUrl);
  if (wordCount(articleText) <= wordCount(source.content)) {
    return source;
  }

  return {
    ...source,
    content: articleText,
    rssSnippet: source.content
  };
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
    country: inferCountry(`${title} ${content}`),
    rssWordCount: wordCount(content)
  };
}

async function fetchRssCandidates(feedUrls) {
  const candidates = [];
  const failures = [];

  for (const feedUrl of feedUrls) {
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
    .sort((a, b) => {
      const aHasEnoughText = a.rssWordCount >= MIN_SOURCE_WORDS ? 1 : 0;
      const bHasEnoughText = b.rssWordCount >= MIN_SOURCE_WORDS ? 1 : 0;

      if (aHasEnoughText !== bHasEnoughText) {
        return bHasEnoughText - aHasEnoughText;
      }

      if (a.rssWordCount !== b.rssWordCount) {
        return b.rssWordCount - a.rssWordCount;
      }

      return new Date(b.originalPublishedAt).getTime() - new Date(a.originalPublishedAt).getTime();
    });

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
${truncate(source.content, 4200)}`;
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
    maxTokens: 1200
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
  const sourceHash = hash(`${source.sourceUrl}:${source.title}`);
  const sourceSlug = slugify(source.title);

  if (SupabaseStoryStore.isConfigured()) {
    try {
      return await SupabaseStoryStore.hasStoryOrDraft(source.sourceUrl, sourceHash, sourceSlug);
    } catch (error) {
      console.warn('Supabase duplicate lookup failed:', error instanceof Error ? error.message : String(error));
    }
  }

  const existing = await db.getAllStories();

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
      sourceUrl: source.sourceUrl,
      sourceWordCount: wordCount(source.content)
    };
  }

  const enrichedSource = await enrichCandidateContent(source);
  const sourceWordCount = wordCount(enrichedSource.content);
  const rewrite = await rewriteSource(enrichedSource);
  if (rewrite.status !== 'accepted') {
    return {
      status: 'rejected',
      title: enrichedSource.title,
      sourceUrl: enrichedSource.sourceUrl,
      sourceWordCount,
      reason: rewrite.reason
    };
  }

  const image = await findImage(rewrite.imageQuery);
  const story = buildStory(enrichedSource, rewrite, image);

  if (AUTO_PUBLISH_STORIES) {
    await db.addStory(story);
  } else if (SupabaseStoryStore.isConfigured()) {
    await SupabaseStoryStore.saveDraft(story);
  }

  return {
    status: AUTO_PUBLISH_STORIES ? 'published' : 'draft',
    story,
    sourceUrl: enrichedSource.sourceUrl,
    sourceWordCount
  };
}

async function runDailyAutomation() {
  validateEnvironment();

  const feedUrls = await getRuntimeFeedUrls();
  const startedAt = new Date().toISOString();
  const result = {
    success: false,
    mode: AUTO_PUBLISH_STORIES ? 'publish' : 'draft',
    startedAt,
    finishedAt: null,
    feedsChecked: feedUrls.length,
    feedFailures: [],
    candidatesFound: 0,
    eligibleCandidatesFound: 0,
    processed: [],
    summary: {
      drafts: 0,
      published: 0,
      duplicates: 0,
      rejected: 0,
      failed: 0,
      eligibleCandidates: 0,
      reviewedCandidates: 0
    }
  };

  console.log('Starting Global Travel Report daily story pipeline');
  console.log(`Mode: ${result.mode}`);

  const { candidates, failures } = await fetchRssCandidates(feedUrls);
  result.feedFailures = failures;
  result.candidatesFound = candidates.length;

  const selected = candidates.slice(0, MAX_CANDIDATES_TO_REVIEW);

  for (const source of selected) {
    try {
      const processed = await processCandidate(source);
      result.processed.push(processed);
      result.summary.reviewedCandidates++;

      if (processed.status === 'draft') result.summary.drafts++;
      if (processed.status === 'published') result.summary.published++;
      if (processed.status === 'duplicate') result.summary.duplicates++;
      if (processed.status === 'rejected') result.summary.rejected++;
      if ((processed.sourceWordCount || 0) >= MIN_SOURCE_WORDS) result.eligibleCandidatesFound++;

      if (result.summary.drafts + result.summary.published >= MAX_STORIES_PER_DAY) {
        break;
      }
    } catch (error) {
      result.summary.failed++;
      result.summary.reviewedCandidates++;
      result.processed.push({
        status: 'failed',
        title: source.title,
        sourceUrl: source.sourceUrl,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  result.summary.eligibleCandidates = result.eligibleCandidatesFound;

  result.finishedAt = new Date().toISOString();
  result.success = result.summary.failed === 0;

  if (SupabaseStoryStore.isConfigured()) {
    try {
      await SupabaseStoryStore.recordPipelineRun(result);
    } catch (error) {
      console.warn('Supabase pipeline run logging failed:', error instanceof Error ? error.message : String(error));
    }
  }

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
