import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles');
const BATCH_SIZE = 10;

function loadEnvFile(filePath) {
  return fs.readFile(filePath, 'utf8')
    .then((contents) => {
      contents.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
          return;
        }

        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');
        if (key && value && !process.env[key]) {
          process.env[key] = value;
        }
      });
    })
    .catch(() => {});
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseDate(value, fallback) {
  const date = value ? new Date(String(value)) : new Date(fallback);
  return Number.isNaN(date.getTime()) ? new Date('2025-04-24T09:00:00.000Z').toISOString() : date.toISOString();
}

function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return ['true', 'yes', '1'].includes(value.toLowerCase());
  }

  return fallback;
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function normaliseCategory(value) {
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

function firstParagraph(markdown) {
  return markdown
    .split(/\n{2,}/)
    .map((part) => part.replace(/^#+\s+/, '').trim())
    .find((part) => part.length > 40) || '';
}

function truncate(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function toRow(fileName, parsed, stat) {
  const data = parsed.data || {};
  const body = String(parsed.content || '').trim();
  const slug = slugify(data.slug || fileName.replace(/\.md$/, ''));
  const title = String(data.title || slug.replace(/-/g, ' ')).replace(/^['"]|['"]$/g, '').trim();
  const publishedAt = parseDate(data.date || data.publishedAt || data.timestamp, stat.mtime);
  const tags = toArray(data.keywords || data.tags);
  const photographer = data.photographer && typeof data.photographer === 'object'
    ? {
      name: String(data.photographer.name || data.name || '').trim(),
      url: data.photographer.url || data.url || undefined
    }
    : data.name
      ? { name: String(data.name), url: data.url || undefined }
      : null;

  const contentHash = crypto.createHash('sha256').update(`${slug}\n${body}`).digest('hex');

  return {
    id: `legacy-${slug}`,
    slug,
    title,
    excerpt: truncate(data.summary || data.excerpt || data.metaDescription || firstParagraph(body), 320),
    content: body,
    published_at: publishedAt,
    updated_at: null,
    original_published_at: publishedAt,
    first_seen_at: publishedAt,
    author: '',
    category: normaliseCategory(data.category || data.type),
    country: String(data.country || 'Global').trim(),
    tags,
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
    content_hash: contentHash,
    word_count: body.split(/\s+/).filter(Boolean).length,
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

function makeSlugsUnique(rows) {
  const counts = new Map();

  return rows.map((row) => {
    const count = counts.get(row.slug) || 0;
    counts.set(row.slug, count + 1);

    if (count === 0) {
      return row;
    }

    const slug = `${row.slug}-${count + 1}`;
    return {
      ...row,
      id: `legacy-${slug}`,
      slug,
      metadata: {
        ...row.metadata,
        duplicateSlugOf: row.slug
      }
    };
  });
}

async function requestSupabase(table, rows) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const url = new URL(`/rest/v1/${table}`, supabaseUrl);
  url.searchParams.set('on_conflict', 'id');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify(rows)
  });

  if (!response.ok) {
    throw new Error(`Supabase import failed: ${response.status} ${await response.text()}`);
  }
}

function escapeSqlString(value) {
  return String(value).replace(/'/g, "''");
}

function buildInsertSql(rows) {
  const json = escapeSqlString(JSON.stringify(rows));

  return `
with payload(data) as (
  values ('${json}'::jsonb)
)
insert into public.stories (
  id,
  slug,
  title,
  excerpt,
  content,
  published_at,
  updated_at,
  original_published_at,
  first_seen_at,
  author,
  category,
  country,
  tags,
  featured,
  editors_pick,
  image_url,
  image_alt,
  image_credit,
  image_credit_url,
  photographer,
  source,
  source_url,
  ingestion_source,
  content_hash,
  word_count,
  rewritten,
  processed_at,
  status,
  metadata
)
select
  row.id,
  row.slug,
  row.title,
  row.excerpt,
  row.content,
  row.published_at,
  row.updated_at,
  row.original_published_at,
  row.first_seen_at,
  row.author,
  row.category,
  row.country,
  row.tags,
  row.featured,
  row.editors_pick,
  row.image_url,
  row.image_alt,
  row.image_credit,
  row.image_credit_url,
  row.photographer,
  row.source,
  row.source_url,
  row.ingestion_source,
  row.content_hash,
  row.word_count,
  row.rewritten,
  row.processed_at,
  row.status,
  row.metadata
from payload,
jsonb_to_recordset(payload.data) as row(
  id text,
  slug text,
  title text,
  excerpt text,
  content text,
  published_at timestamptz,
  updated_at timestamptz,
  original_published_at timestamptz,
  first_seen_at timestamptz,
  author text,
  category text,
  country text,
  tags text[],
  featured boolean,
  editors_pick boolean,
  image_url text,
  image_alt text,
  image_credit text,
  image_credit_url text,
  photographer jsonb,
  source text,
  source_url text,
  ingestion_source text,
  content_hash text,
  word_count integer,
  rewritten boolean,
  processed_at timestamptz,
  status text,
  metadata jsonb
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  published_at = excluded.published_at,
  updated_at = excluded.updated_at,
  original_published_at = excluded.original_published_at,
  first_seen_at = excluded.first_seen_at,
  author = excluded.author,
  category = excluded.category,
  country = excluded.country,
  tags = excluded.tags,
  featured = excluded.featured,
  editors_pick = excluded.editors_pick,
  image_url = excluded.image_url,
  image_alt = excluded.image_alt,
  image_credit = excluded.image_credit,
  image_credit_url = excluded.image_credit_url,
  photographer = excluded.photographer,
  source = excluded.source,
  source_url = excluded.source_url,
  ingestion_source = excluded.ingestion_source,
  content_hash = excluded.content_hash,
  word_count = excluded.word_count,
  rewritten = excluded.rewritten,
  processed_at = excluded.processed_at,
  status = excluded.status,
  metadata = excluded.metadata;
`.trim();
}

async function main() {
  await loadEnvFile(path.join(process.cwd(), '.env.local'));

  const dryRun = process.argv.includes('--dry-run');
  const sqlDirArg = process.argv.find((arg) => arg.startsWith('--sql-dir='));
  const sqlDir = sqlDirArg ? sqlDirArg.split('=').slice(1).join('=') : null;
  const fileNames = (await fs.readdir(ARTICLES_DIR)).filter((file) => file.endsWith('.md')).sort();
  const rows = [];
  const skipped = [];

  for (const fileName of fileNames) {
    const filePath = path.join(ARTICLES_DIR, fileName);
    const [contents, stat] = await Promise.all([fs.readFile(filePath, 'utf8'), fs.stat(filePath)]);

    try {
      const row = toRow(fileName, matter(contents), stat);
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
  const uniqueRows = makeSlugsUnique(rows);

  console.log(JSON.stringify({
    dryRun,
    filesFound: fileNames.length,
    rowsPrepared: uniqueRows.length,
    skipped,
    duplicateSlugCount: new Set(duplicateSlugs).size,
    duplicateSlugs: [...new Set(duplicateSlugs)].sort(),
    sample: uniqueRows.slice(0, 3).map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      published_at: row.published_at,
      category: row.category,
      country: row.country,
      author: row.author
    }))
  }, null, 2));

  if (dryRun) {
    return;
  }

  if (sqlDir) {
    await fs.mkdir(sqlDir, { recursive: true });

    for (let index = 0; index < uniqueRows.length; index += BATCH_SIZE) {
      const batch = uniqueRows.slice(index, index + BATCH_SIZE);
      const batchNumber = String(Math.floor(index / BATCH_SIZE) + 1).padStart(2, '0');
      await fs.writeFile(path.join(sqlDir, `markdown-story-import-${batchNumber}.sql`), buildInsertSql(batch));
    }

    console.log(`Wrote ${Math.ceil(uniqueRows.length / BATCH_SIZE)} SQL batch files to ${sqlDir}`);
    return;
  }

  for (let index = 0; index < uniqueRows.length; index += BATCH_SIZE) {
    const batch = uniqueRows.slice(index, index + BATCH_SIZE);
    await requestSupabase('stories', batch);
    console.log(`Imported ${Math.min(index + batch.length, uniqueRows.length)} / ${uniqueRows.length}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
