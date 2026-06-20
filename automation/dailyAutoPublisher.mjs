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

// Vercel executes this pipeline in short-lived functions. Each scheduled run
// deliberately publishes at most one story; five separate runs are scheduled
// each day so one slow rewrite cannot prevent the day from being completed.
const MAX_STORIES_PER_RUN = 1;
const MIN_SOURCE_WORDS = Number.parseInt(process.env.MIN_RSS_SOURCE_WORDS || '120', 10);
const MIN_REWRITTEN_WORDS = Number.parseInt(process.env.MIN_REWRITTEN_STORY_WORDS || '180', 10);
const MAX_CANDIDATES_TO_REVIEW = Math.min(Number.parseInt(process.env.MAX_RSS_CANDIDATES_TO_REVIEW || '4', 10), 6);
const MAX_AI_REWRITE_ATTEMPTS = Math.min(Number.parseInt(process.env.MAX_AI_REWRITE_ATTEMPTS || '2', 10), 2);
const MAX_PIPELINE_RUNTIME_MS = Math.min(Number.parseInt(process.env.MAX_STORY_PIPELINE_RUNTIME_MS || '45000', 10), 50000);
const MIN_TIME_FOR_NEXT_CANDIDATE_MS = 8000;
const ARTICLE_FETCH_TIMEOUT_MS = Number.parseInt(process.env.ARTICLE_FETCH_TIMEOUT_MS || '2500', 10);
const AUTO_PUBLISH_STORIES = process.env.AUTO_PUBLISH_STORIES === 'true';

const parser = new Parser({
  timeout: Number.parseInt(process.env.RSS_FETCH_TIMEOUT_MS || '5000', 10),
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
  'Air Travel': ['flight', 'airline', 'airport', 'aviation', 'aircraft', 'route', 'lounge'],
  Cruise: ['cruise', 'ship', 'voyage', 'port', 'sailing', 'river cruise'],
  Accommodation: ['hotel', 'resort', 'accommodation', 'suite', 'lodging', 'villa'],
  Destinations: ['destination', 'city', 'country', 'island', 'beach', 'region'],
  Tours: ['tour', 'itinerary', 'guide', 'excursion', 'experience', 'activity', 'rail', 'train'],
  'Travel Deals': ['deal', 'sale', 'discount', 'offer', 'fare', 'value', 'budget'],
  'Travel Safety': ['warning', 'advice', 'visa', 'passport', 'safety', 'alert', 'security', 'health'],
  'Food & Drink': ['food', 'drink', 'dining', 'restaurant', 'cuisine', 'culinary', 'wine', 'bar'],
  'Luxury Travel': ['luxury', 'premium', 'first class', 'business class', 'high-end', 'exclusive'],
  'Sustainable Travel': ['sustainable', 'eco', 'responsible', 'carbon', 'green', 'conservation'],
  'Travel Tech': ['app', 'technology', 'digital', 'esim', 'wifi', 'booking platform', 'online'],
  'Finance & Points': ['points', 'miles', 'credit card', 'currency', 'bank', 'insurance', 'money', 'rewards'],
  'Travel News': ['travel news', 'tourism', 'travel industry', 'industry', 'association', 'council', 'merger', 'agency', 'agent', 'operator']
};

const ALLOWED_CATEGORIES = [...Object.keys(CATEGORY_KEYWORDS), 'Travel News'];

const CATEGORY_ALIASES = {
  airline: 'Air Travel',
  airlines: 'Air Travel',
  'air travel': 'Air Travel',
  flights: 'Air Travel',
  cruises: 'Cruise',
  hotels: 'Accommodation',
  hotel: 'Accommodation',
  deals: 'Travel Deals',
  safety: 'Travel Safety',
  'travel tips': 'Travel News',
  'food dining': 'Food & Drink',
  'food & dining': 'Food & Drink',
  'food wine': 'Food & Drink',
  adventure: 'Tours',
  culture: 'Destinations',
  nature: 'Destinations',
  luxury: 'Luxury Travel',
  budget: 'Travel Deals',
  finance: 'Finance & Points',
  insurance: 'Finance & Points',
  rail: 'Tours',
  tech: 'Travel Tech',
  sustainability: 'Sustainable Travel',
  sustainable: 'Sustainable Travel'
};

const FALLBACK_UNSPLASH_IMAGES = [
  {
    category: 'Cruise',
    imageUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&q=80&w=2400',
    imageAlt: 'Cruise ship at sea',
    photographer: { name: 'Alonso Reyes', username: 'alonsoreyes', url: 'https://unsplash.com/@alonsoreyes', profileUrl: 'https://unsplash.com/@alonsoreyes' }
  },
  {
    category: 'Air Travel',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&q=80&w=2400',
    imageAlt: 'Aircraft wing above the clouds',
    photographer: { name: 'Ross Parmly', username: 'rparmly', url: 'https://unsplash.com/@rparmly', profileUrl: 'https://unsplash.com/@rparmly' }
  },
  {
    category: 'Accommodation',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&q=80&w=2400',
    imageAlt: 'Hotel resort pool',
    photographer: { name: 'Emile Guillemot', username: 'emilegt', url: 'https://unsplash.com/@emilegt', profileUrl: 'https://unsplash.com/@emilegt' }
  },
  {
    category: 'Destinations',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&q=80&w=2400',
    imageAlt: 'Ocean beach destination',
    photographer: { name: 'Jared Rice', username: 'jareddrice', url: 'https://unsplash.com/@jareddrice', profileUrl: 'https://unsplash.com/@jareddrice' }
  },
  {
    category: 'Travel News',
    imageUrl: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&q=80&w=2400',
    imageAlt: 'Traveller looking at an airport departure board',
    photographer: { name: 'Jakob Owens', username: 'jakobowens1', url: 'https://unsplash.com/@jakobowens1', profileUrl: 'https://unsplash.com/@jakobowens1' }
  }
];

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
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function inferCategory(text) {
  const lower = text.toLowerCase();
  const scores = Object.entries(CATEGORY_KEYWORDS).map(([category, keywords]) => ({
    category,
    score: keywords.reduce((total, keyword) => {
      const matches = lower.match(new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'));
      return total + (matches?.length || 0);
    }, 0)
  }));

  const industryScore = scores.find((item) => item.category === 'Travel News')?.score || 0;
  const specialistBest = scores
    .filter((item) => item.category !== 'Travel News')
    .sort((a, b) => b.score - a.score)[0];

  if (industryScore >= 2 && (!specialistBest || industryScore > specialistBest.score)) {
    return 'Travel News';
  }

  if (specialistBest?.score) {
    return specialistBest.category;
  }

  return 'Travel News';
}

function normaliseCategory(value, fallback = 'Travel News') {
  const candidates = String(value || '')
    .split(/[|,;/]/)
    .map((category) => category.trim())
    .filter(Boolean);

  for (const candidate of candidates) {
    const alias = CATEGORY_ALIASES[candidate.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim()];
    if (alias) {
      return alias;
    }

    const exact = ALLOWED_CATEGORIES.find((category) => category.toLowerCase() === candidate.toLowerCase());
    if (exact) {
      return exact;
    }
  }

  const inferred = inferCategory(`${value || ''} ${fallback || ''}`);
  return ALLOWED_CATEGORIES.includes(inferred) ? inferred : 'Travel News';
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
    'travel news', 'air travel', 'cruise', 'accommodation', 'destinations',
    'australian travellers', 'travel safety', 'travel deals', 'tours', 'food and drink',
    'luxury travel', 'sustainable travel', 'travel tech', 'finance and points'
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

function normaliseForComparison(text = '') {
  return stripHtml(text)
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^a-z0-9%.' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasCopiedSentence(sourceText = '', rewrittenText = '') {
  const source = normaliseForComparison(sourceText);
  return splitSentences(rewrittenText)
    .map(normaliseForComparison)
    .some((sentence) => wordCount(sentence) >= 8 && source.includes(sentence));
}

function splitSentences(text = '') {
  return stripHtml(text)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => wordCount(sentence) >= 8);
}

function buildFallbackTitle(text = '') {
  const clean = stripHtml(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= 60) {
    return clean;
  }

  const words = clean.split(/\s+/);
  let title = '';
  for (const word of words) {
    const next = title ? `${title} ${word}` : word;
    if (next.length > 60) {
      break;
    }
    title = next;
  }

  const weakEndings = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'the', 'to', 'with']);
  const titleWords = title.split(/\s+/).filter(Boolean);
  while (titleWords.length > 4 && weakEndings.has(titleWords[titleWords.length - 1].toLowerCase())) {
    titleWords.pop();
  }

  return titleWords.join(' ') || clean.slice(0, 60).replace(/\s+\S*$/, '');
}

function extractTravelBrand(text = '') {
  const normalized = stripHtml(text).toLowerCase();
  const brands = [
    ['royal caribbean', 'Royal Caribbean'],
    ['princess cruises', 'Princess Cruises'],
    ['norwegian cruise line', 'Norwegian Cruise Line'],
    ['carnival cruise', 'Carnival Cruise Line'],
    ['virgin voyages', 'Virgin Voyages'],
    ['celebrity cruises', 'Celebrity Cruises'],
    ['msc cruises', 'MSC Cruises'],
    ['viking', 'Viking'],
    ['qantas', 'Qantas'],
    ['jetstar', 'Jetstar'],
    ['virgin australia', 'Virgin Australia'],
    ['emirates', 'Emirates'],
    ['singapore airlines', 'Singapore Airlines'],
    ['air new zealand', 'Air New Zealand'],
    ['airbnb', 'Airbnb'],
    ['marriott', 'Marriott'],
    ['hilton', 'Hilton'],
    ['accor', 'Accor'],
    ['ihg', 'IHG']
  ];

  return brands.find(([needle]) => normalized.includes(needle))?.[1] || '';
}

function buildOriginalFallbackTitle(source, category) {
  const country = inferCountry(`${source.title} ${source.content}`);
  const brand = extractTravelBrand(source.title);
  const categoryLabel = category === 'Air Travel' ? 'Airline' : category;
  const countryPrefix = country !== 'Global' && !brand ? `${country} ` : '';
  const base = brand
    ? `${brand} ${categoryLabel} Update for Travellers`
    : `${countryPrefix}${categoryLabel} Update for Travellers`;

  return buildFallbackTitle(base);
}

function buildMetaExcerpt(text = '') {
  const base = stripHtml(text).replace(/\s+/g, ' ').trim();
  const fallback = 'Global Travel Report covers the latest travel development with practical context for Australian travellers planning upcoming trips.';
  let excerpt = base || fallback;

  if (excerpt.length < 140) {
    excerpt = `${excerpt.replace(/[.!?]?$/, '')}. ${fallback}`;
  }

  if (excerpt.length > 155) {
    return `${excerpt.slice(0, 152).replace(/\s+\S*$/, '')}...`;
  }

  return excerpt;
}

function buildFallbackRewrite(source, reason = '') {
  const category = normaliseCategory(source.category, inferCategory(`${source.title} ${source.content}`));
  const country = inferCountry(`${source.title} ${source.content}`);
  const brand = extractTravelBrand(source.title);
  const title = buildOriginalFallbackTitle(source, category);
  const locationContext = country !== 'Global' ? ` in ${country}` : '';
  const categoryContext = category.toLowerCase();
  const subject = brand
    ? `${brand}'s latest ${categoryContext} update`
    : `the latest ${categoryContext} update${locationContext}`;
  const context = `For Australian travellers, the update is worth noting as part of the wider ${categoryContext} picture. Travellers should check the original source and official operator guidance before making firm plans.`;
  const paragraphs = [
    `A fresh ${categoryContext} development${locationContext} is giving travellers another reason to check the details behind their next trip. The story concerns ${subject}, and it points to the kind of travel change that is worth checking before booking or departure.`,
    `For readers comparing options, the practical message is to look beyond the headline and confirm what has changed, who is affected and when the change applies. Airline, cruise, hotel and destination updates can all carry booking conditions, timing issues or availability limits that are easy to miss during a quick search.`,
    `The safest approach is to treat the story as a prompt for further checking before making a firm booking. Travellers should review the operator's current advice, compare it with any existing reservation details and keep a copy of relevant terms in case schedules, inclusions or requirements shift later.`,
    `This is especially important for Australian travellers planning overseas trips, where time zones, long-haul connections and supplier policies can make small changes more disruptive. A short check before payment or departure can reduce the chance of surprise costs or avoidable itinerary problems.`,
    context
  ].filter((paragraph) => wordCount(paragraph) >= 8);

  return {
    status: 'accepted',
    title,
    excerpt: buildMetaExcerpt(`${title}. Practical context for travellers checking bookings, timing, operator advice and destination details before making plans.`),
    publishedAt: source.originalPublishedAt,
    paragraphs: paragraphs.slice(0, 5),
    content: paragraphs.slice(0, 5).join('\n\n'),
    category,
    country,
    tags: extractTags(`${source.title} ${source.content} ${category}`),
    imageQuery: `${country !== 'Global' ? country : category} ${category} travel news`,
    imageAltText: `${category} scene connected to ${title}`,
    fallbackReason: reason,
    fallback: true,
    safeFallback: true
  };
}

function shouldRepairFallbackStory(story) {
  if (!story?.rewritten) {
    return false;
  }

  const title = story.title || '';
  const content = story.content || '';
  return (
    (title.includes('“') && title.includes('Travel Update')) ||
    content.includes('update centres on')
  );
}

async function repairPublishedFallbackStories() {
  if (!AUTO_PUBLISH_STORIES || !SupabaseStoryStore.isConfigured()) {
    return 0;
  }

  try {
    const stories = await SupabaseStoryStore.getPublishedStories();
    const repairable = stories.slice(0, 12).filter(shouldRepairFallbackStory);

    for (const story of repairable) {
      const rewrite = buildFallbackRewrite({
        title: story.title,
        content: story.content,
        category: story.category,
        originalPublishedAt: story.originalPublishedAt || story.publishedAt
      }, 'cleaned previous safe fallback copy');

      await SupabaseStoryStore.upsertStory({
        ...story,
        title: rewrite.title,
        slug: slugify(rewrite.title),
        excerpt: rewrite.excerpt,
        content: rewrite.content,
        author: '',
        category: rewrite.category,
        country: story.country || rewrite.country,
        tags: rewrite.tags,
        imageAlt: rewrite.imageAltText,
        wordCount: wordCount(rewrite.content),
        rewritten: true,
        updatedAt: new Date().toISOString()
      });
    }

    return repairable.length;
  } catch (error) {
    console.warn('Published fallback story repair skipped:', error instanceof Error ? error.message : String(error));
    return 0;
  }
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
    sourceName: stripHtml(item.feedTitle || ''),
    guid: item.guid || link,
    originalPublishedAt: parseDate(item.isoDate || item.pubDate || item.published),
    category: inferCategory(`${title} ${content}`),
    country: inferCountry(`${title} ${content}`),
    rssWordCount: wordCount(content)
  };
}

async function fetchFeedCandidates(feedUrl) {
  try {
    const feed = await parser.parseURL(feedUrl);
    const items = (feed.items || [])
      .slice(0, 8)
      .map((item) => normaliseFeedItem({ ...item, feedTitle: feed.title }, feedUrl))
      .filter((item) => item.title && item.sourceUrl && item.content);

    if (SupabaseStoryStore.isConfigured()) {
      try {
        await SupabaseStoryStore.recordFeedCheck(feedUrl, null);
      } catch (error) {
        console.warn('Supabase feed success logging failed:', error instanceof Error ? error.message : String(error));
      }
    }

    return { candidates: items, failure: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (SupabaseStoryStore.isConfigured()) {
      try {
        await SupabaseStoryStore.recordFeedCheck(feedUrl, message);
      } catch (loggingError) {
        console.warn('Supabase feed failure logging failed:', loggingError instanceof Error ? loggingError.message : String(loggingError));
      }
    }

    return { candidates: [], failure: { feedUrl, error: message } };
  }
}

async function fetchRssCandidates(feedUrls) {
  const feedResults = await Promise.all(feedUrls.map((feedUrl) => fetchFeedCandidates(feedUrl)));
  const candidates = feedResults.flatMap((result) => result.candidates);
  const failures = feedResults
    .map((result) => result.failure)
    .filter(Boolean);

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

      return (new Date(b.originalPublishedAt || 0).getTime()) - (new Date(a.originalPublishedAt || 0).getTime());
    });

  return { candidates: unique, failures };
}

function buildRewritePrompt(source, previousError = '') {
  return `You are the Global Travel Report editorial desk for Australian readers.

Rewrite this RSS source into an original travel news draft.

Hard rules:
- Return only valid JSON. No markdown.
- Do not invent dates, prices, passenger numbers, route details, opening dates, warnings, visa rules, quotes, or statistics.
- If the source text does not support a detail, omit it.
  - The source has already passed the minimum quality check. Do not reject normal travel news, aviation, cruise, hotel, destination, travel technology, travel safety or travel industry stories.
  - Return "status": "accepted" unless the source is unrelated to travel or impossible to understand.
- Use Australian English.
- Keep the tone clear, practical, and editorial.
- Mention why the story matters to Australian travellers where supported by the source.
- Do not mention AI, automation, RSS, rewriting, or prompts.
- Choose exactly one category from this list: ${ALLOWED_CATEGORIES.join(', ')}. Do not invent or modify category names.
- The "title" must be a catchy, engaging headline under 60 characters.
- The "excerpt" must be a Google meta description between 140 and 155 characters for Google search snippets.
- The "publishedAt" field must use the source.originalPublishedAt value provided below. Do not use the current time.
- The "imageQuery" must be a vivid, specific scene description for an Unsplash image search (e.g. "Sydney Harbour Bridge at sunset aerial view"). Avoid generic terms like "travel" or "holiday".
- The "imageAltText" must be a descriptive 10 to 15 word sentence for Google image SEO, describing the scene as it relates to the article.
${previousError ? `- Your previous response failed validation: ${previousError}. Return only the JSON object this time.` : ''}

Return this JSON shape:
{
  "status": "accepted",
      "title": "catchy headline under 60 characters",
      "excerpt": "Google meta description between 140 and 155 characters",
          "publishedAt": "${source.originalPublishedAt || new Date().toISOString()}",
  "paragraphs": ["4 to 7 short paragraphs"],
  "category": "one exact category from the allowed list",
  "country": "best matching country or Global",
  "tags": ["5", "short", "tags"],
      "imageQuery": "vivid specific Unsplash travel scene search query",
          "imageAltText": "10 to 15 word descriptive sentence for Google image SEO"
}

Source title: ${source.title}
Source URL: ${source.sourceUrl}
Source published date: ${source.originalPublishedAt || 'unknown'}
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

  let parsed;
  let previousError = '';

  for (let attempt = 0; attempt < MAX_AI_REWRITE_ATTEMPTS; attempt++) {
    const response = await generateStoryContent(buildRewritePrompt(source, previousError), {
      temperature: attempt === 0 ? 0.2 : 0,
      maxTokens: 1200
    });

    try {
      const candidate = extractJson(response.content);
      if (candidate.status !== 'accepted') {
        previousError = candidate.reason
          ? `You returned rejected: ${candidate.reason}. This source is eligible; rewrite it as accepted JSON unless it is unrelated to travel.`
          : 'You returned rejected. This source is eligible; rewrite it as accepted JSON unless it is unrelated to travel.';
        continue;
      }

      parsed = candidate;
      break;
    } catch (error) {
      previousError = error instanceof Error ? error.message : String(error);
    }
  }

  if (!parsed) {
    parsed = buildFallbackRewrite(source, previousError || 'AI response was not valid JSON');
  }

  const paragraphs = Array.isArray(parsed.paragraphs)
    ? parsed.paragraphs.map(stripHtml).filter(Boolean)
    : [];

  if (!parsed.title || !parsed.excerpt || paragraphs.length < 3) {
    parsed = buildFallbackRewrite(source, 'AI response was incomplete');
  }

  const finalParagraphs = Array.isArray(parsed.paragraphs)
    ? parsed.paragraphs.map(stripHtml).filter(Boolean)
    : [];

  const finalText = [
    parsed.title,
    parsed.excerpt,
    ...finalParagraphs
  ].join('\n');

  if (hasUnsupportedNumbers(`${source.title} ${source.content}`, finalText)) {
    return {
      status: 'rejected',
      reason: 'AI introduced numbers not present in source'
    };
  }

  return {
    status: 'accepted',
    title: stripHtml(parsed.title),
    excerpt: stripHtml(parsed.excerpt),
    paragraphs: finalParagraphs,
    content: finalParagraphs.join('\n\n'),
    publishedAt: parsed.publishedAt || source.originalPublishedAt,
    category: normaliseCategory(parsed.category, source.category),
    country: parsed.country || source.country || 'Global',
    tags: Array.isArray(parsed.tags) ? parsed.tags.map(stripHtml).filter(Boolean).slice(0, 8) : extractTags(finalText),
    imageQuery: stripHtml(parsed.imageQuery || `${source.country} ${source.category} travel`),
    imageAltText: stripHtml(parsed.imageAltText || parsed.title || source.title),
    fallback: Boolean(parsed.fallback),
    safeFallback: Boolean(parsed.safeFallback)
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

function fallbackImage(query, context = {}) {
  const text = `${context.category || ''} ${context.title || ''} ${query || ''}`.toLowerCase();
  const preferred = FALLBACK_UNSPLASH_IMAGES.find((image) => text.includes(image.category.toLowerCase())) ||
    FALLBACK_UNSPLASH_IMAGES.find((image) => text.includes('cruise') && image.category === 'Cruise') ||
    FALLBACK_UNSPLASH_IMAGES.find((image) => text.includes('airline') && image.category === 'Air Travel') ||
    FALLBACK_UNSPLASH_IMAGES.find((image) => text.includes('hotel') && image.category === 'Accommodation') ||
    FALLBACK_UNSPLASH_IMAGES.find((image) => text.includes('destination') && image.category === 'Destinations') ||
    FALLBACK_UNSPLASH_IMAGES[Math.abs(hash(text).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % FALLBACK_UNSPLASH_IMAGES.length];

  return {
    imageUrl: preferred.imageUrl,
    imageAlt: preferred.imageAlt,
    photographer: preferred.photographer,
    imageCredit: `Photo by ${preferred.photographer.name} on Unsplash`,
    imageCreditUrl: preferred.photographer.profileUrl
  };
}

async function findImage(query, context = {}) {
  try {
    const images = await unsplashService.searchImages(query, {
      orientation: 'landscape',
      perPage: 1
    });

    const image = images[0];
    if (!image) {
      return fallbackImage(query, context);
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
    return fallbackImage(query, context);
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
  if (!rewrite.title || rewrite.title.length < 20) {
    console.warn(`[VALIDATION FAILED] Skipping story: ${rewrite.title || 'Untitled'} - title too short or missing`);
    return null;
  }
  if (!rewrite.excerpt || rewrite.excerpt.length < 50) {
    console.warn(`[VALIDATION FAILED] Skipping story: ${rewrite.title || 'Untitled'} - excerpt too short or missing`);
    return null;
  }
  const paragraphs = Array.isArray(rewrite.paragraphs)
    ? rewrite.paragraphs
    : String(rewrite.content || '').split(/\n{2,}/).map(stripHtml).filter(Boolean);

  if (paragraphs.length < 3) {
    console.warn(`[VALIDATION FAILED] Skipping story: ${rewrite.title || 'Untitled'} - fewer than 3 paragraphs`);
    return null;
  }
  const contentWordCount = wordCount(rewrite.content);
  if (contentWordCount < MIN_REWRITTEN_WORDS) {
    console.warn(`[VALIDATION FAILED] Skipping story: ${rewrite.title || 'Untitled'} - fewer than ${MIN_REWRITTEN_WORDS} rewritten words`);
    return null;
  }
  if (normaliseForComparison(rewrite.title) === normaliseForComparison(source.title)) {
    console.warn(`[VALIDATION FAILED] Skipping story: ${rewrite.title || 'Untitled'} - copied source title`);
    return null;
  }
  if (hasCopiedSentence(source.content, `${rewrite.excerpt}\n${rewrite.content}`)) {
    console.warn(`[VALIDATION FAILED] Skipping story: ${rewrite.title || 'Untitled'} - copied source sentence`);
    return null;
  }

  const now = new Date().toISOString();
  const publishedAt = rewrite.publishedAt || source.originalPublishedAt || now;
  const slug = slugify(rewrite.title);
  const contentHash = hash(`${source.sourceUrl}:${source.title}`);

  let excerpt = rewrite.excerpt || '';
  if (excerpt.length > 155) {
    excerpt = excerpt.slice(0, 152) + '...';
  }

  return {
    id: `rss-${contentHash}`,
    slug,
    title: rewrite.title,
    excerpt,
    content: rewrite.content,
    author: '',
    publishedAt,
    updatedAt: now,
    date: publishedAt,
    originalPublishedAt: publishedAt,
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
    wordCount: contentWordCount,
    imageUrl: image?.imageUrl || '',
    imageAlt: rewrite.imageAltText || image?.imageAlt || rewrite.title,
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

  if (AUTO_PUBLISH_STORIES && rewrite.fallback && !rewrite.safeFallback) {
    return {
      status: 'rejected',
      title: enrichedSource.title,
      sourceUrl: enrichedSource.sourceUrl,
      sourceWordCount,
      reason: 'fallback-rewrite-not-auto-published'
    };
  }

  const image = await findImage(rewrite.imageQuery, rewrite);
  const story = buildStory(enrichedSource, rewrite, image);
  if (!story) {
    return {
      status: 'rejected',
      title: rewrite.title || 'Untitled',
      sourceUrl: enrichedSource.sourceUrl,
      sourceWordCount,
      reason: 'validation-failed'
    };
  }

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

  const deadline = Date.now() + MAX_PIPELINE_RUNTIME_MS;
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

  const repairedStories = await repairPublishedFallbackStories();
  if (repairedStories > 0) {
    console.log(`Cleaned ${repairedStories} previously published fallback story`);
  }

  const { candidates, failures } = await fetchRssCandidates(feedUrls);
  result.feedFailures = failures;
  result.candidatesFound = candidates.length;

  const selected = candidates.slice(0, MAX_CANDIDATES_TO_REVIEW);

  for (const source of selected) {
    if (Date.now() + MIN_TIME_FOR_NEXT_CANDIDATE_MS > deadline) {
      result.processed.push({
        status: 'stopped',
        reason: 'time-budget-exhausted',
        message: 'Stopped before the next candidate so the Vercel function could finish cleanly.'
      });
      break;
    }

    try {
      const processed = await processCandidate(source);
      result.processed.push(processed);
      result.summary.reviewedCandidates++;

      if (processed.status === 'draft') result.summary.drafts++;
      if (processed.status === 'published') result.summary.published++;
      if (processed.status === 'duplicate') result.summary.duplicates++;
      if (processed.status === 'rejected') result.summary.rejected++;
      if ((processed.sourceWordCount || 0) >= MIN_SOURCE_WORDS) result.eligibleCandidatesFound++;

      if (result.summary.drafts + result.summary.published >= MAX_STORIES_PER_RUN) {
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
