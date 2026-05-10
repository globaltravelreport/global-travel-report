import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles');
const BATCH_SIZE = 25;
const CONFIRMATION = 'global-travel-report-markdown-2026-05-11';

type StoryRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published_at: string;
  updated_at: string | null;
  original_published_at: string;
  first_seen_at: string;
  author: string;
  category: string;
  country: string;
  tags: string[];
  featured: boolean;
  editors_pick: boolean;
  image_url: string | null;
  image_alt: string | null;
  image_credit: string | null;
  image_credit_url: string | null;
  photographer: { name: string; url?: string } | null;
  source: string;
  source_url: string | null;
  ingestion_source: string;
  content_hash: string;
  word_count: number;
  rewritten: boolean;
  processed_at: string;
  status: 'published';
  metadata: Record<string, unknown>;
};

function slugify(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseDate(value: unknown, fallback: Date): string {
  const date = value ? new Date(String(value)) : fallback;
  return Number.isNaN(date.getTime()) ? '2025-04-24T09:00:00.000Z' : date.toISOString();
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function normaliseCategory(value: unknown): string {
  const raw = String(value || 'Travel News').trim();
  const lower = raw.toLowerCase();

  if (lower.includes('cruise')) return 'Cruises';
  if (lower.includes('airline') || lower.includes('flight') || lower.includes('airport')) return 'Airlines';
  if (lower.includes('hotel') || lower.includes('accommodation') || lower.includes('resort')) return 'Hotels';
  if (lower.includes('food') || lower.includes('wine') || lower.includes('dining')) return 'Food & Dining';
  if (lower.includes('culture') || lower.includes('museum')) return 'Culture';
  if (lower.includes('adventure')) return 'Adventure';
  if (lower.includes('deal')) return 'Travel Deals';
  if (lower.includes('tip') || lower.includes('guide')) return 'Travel Tips';
  if (lower.includes('destination') || lower.includes('travel')) return 'Destinations';

  return raw;
}

function firstParagraph(markdown: string): string {
  return markdown
    .split(/\n{2,}/)
    .map((part) => part.replace(/^#+\s+/, '').trim())
    .find((part) => part.length > 40) || '';
}

function truncate(value: unknown, maxLength: number): string {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1).trim()}...`;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', 'yes', '1'].includes(value.toLowerCase());
  return false;
}

function toRow(fileName: string, parsed: matter.GrayMatterFile<string>, mtime: Date): StoryRow {
  const data = parsed.data || {};
  const content = String(parsed.content || '').trim();
  const slug = slugify(data.slug || fileName.replace(/\.md$/, ''));
  const title = String(data.title || slug.replace(/-/g, ' ')).replace(/^['"]|['"]$/g, '').trim();
  const publishedAt = parseDate(data.date || data.publishedAt || data.timestamp, mtime);
  const photographer = data.photographer && typeof data.photographer === 'object'
    ? {
      name: String(data.photographer.name || data.name || '').trim(),
      url: data.photographer.url || data.url || undefined
    }
    : data.name
      ? { name: String(data.name), url: data.url || undefined }
      : null;

  return {
    id: `legacy-${slug}`,
    slug,
    title,
    excerpt: truncate(data.summary || data.excerpt || data.metaDescription || firstParagraph(content), 320),
    content,
    published_at: publishedAt,
    updated_at: null,
    original_published_at: publishedAt,
    first_seen_at: publishedAt,
    author: '',
    category: normaliseCategory(data.category || data.type),
    country: String(data.country || 'Global').trim(),
    tags: toArray(data.keywords || data.tags),
    featured: toBoolean(data.featured),
    editors_pick: toBoolean(data.editorsPick || data.editors_pick),
    image_url: data.imageUrl || data.image || null,
    image_alt: data.imageAlt || null,
    image_credit: photographer?.name || data.imageCredit || null,
    image_credit_url: photographer?.url || data.imageCreditUrl || null,
    photographer,
    source: 'Legacy markdown archive',
    source_url: null,
    ingestion_source: 'markdown_migration',
    content_hash: crypto.createHash('sha256').update(`${slug}\n${content}`).digest('hex'),
    word_count: content.split(/\s+/).filter(Boolean).length,
    rewritten: true,
    processed_at: new Date().toISOString(),
    status: 'published',
    metadata: {
      migratedFrom: `content/articles/${fileName}`,
      legacyMetaTitle: data.metaTitle || null,
      legacyMetaDescription: data.metaDescription || null
    }
  };
}

function makeSlugsUnique(rows: StoryRow[]): StoryRow[] {
  const counts = new Map<string, number>();

  return rows.map((row) => {
    const count = counts.get(row.slug) || 0;
    counts.set(row.slug, count + 1);

    if (count === 0) return row;

    const slug = `${row.slug}-${count + 1}`;
    return {
      ...row,
      id: `legacy-${slug}`,
      slug,
      content_hash: crypto.createHash('sha256').update(`${slug}\n${row.content}`).digest('hex'),
      metadata: {
        ...row.metadata,
        duplicateSlugOf: row.slug
      }
    };
  });
}

async function prepareRows() {
  const fileNames = (await fs.readdir(ARTICLES_DIR)).filter((file) => file.endsWith('.md')).sort();
  const rows: StoryRow[] = [];
  const skipped: Array<{ fileName: string; reason: string }> = [];

  for (const fileName of fileNames) {
    const filePath = path.join(ARTICLES_DIR, fileName);
    const [contents, stat] = await Promise.all([fs.readFile(filePath, 'utf8'), fs.stat(filePath)]);

    try {
      const row = toRow(fileName, matter(contents), stat.mtime);
      if (!row.slug || !row.title || !row.content) {
        skipped.push({ fileName, reason: 'missing slug, title, or content' });
        continue;
      }
      rows.push(row);
    } catch (error) {
      skipped.push({ fileName, reason: error instanceof Error ? error.message : String(error) });
    }
  }

  const duplicateSlugs = rows
    .map((row) => row.slug)
    .filter((slug, index, all) => all.indexOf(slug) !== index);

  return {
    filesFound: fileNames.length,
    skipped,
    duplicateSlugs: [...new Set(duplicateSlugs)].sort(),
    rows: makeSlugsUnique(rows)
  };
}

async function upsertRows(rows: StoryRow[]) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase is not configured');
  }

  let imported = 0;

  for (let index = 0; index < rows.length; index += BATCH_SIZE) {
    const batch = rows.slice(index, index + BATCH_SIZE);
    const url = new URL('/rest/v1/stories', supabaseUrl);
    url.searchParams.set('on_conflict', 'id');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify(batch),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Supabase import failed: ${response.status} ${await response.text()}`);
    }

    imported += batch.length;
  }

  return imported;
}

export async function POST(request: NextRequest) {
  try {
    if (request.nextUrl.searchParams.get('confirm') !== CONFIRMATION) {
      return NextResponse.json({ error: 'Missing migration confirmation' }, { status: 401 });
    }

    const prepared = await prepareRows();
    const imported = await upsertRows(prepared.rows);

    return NextResponse.json({
      success: true,
      filesFound: prepared.filesFound,
      imported,
      skipped: prepared.skipped,
      duplicateSlugCount: prepared.duplicateSlugs.length,
      duplicateSlugs: prepared.duplicateSlugs
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
