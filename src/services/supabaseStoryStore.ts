import { Story } from '@/types/Story';

type SupabaseStoryRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published_at: string;
  updated_at?: string | null;
  original_published_at?: string | null;
  first_seen_at?: string | null;
  author: string;
  category: string;
  country: string;
  tags: string[];
  featured: boolean;
  editors_pick: boolean;
  image_url?: string | null;
  image_alt?: string | null;
  image_credit?: string | null;
  image_credit_url?: string | null;
  photographer?: Story['photographer'] | null;
  source?: string | null;
  source_url?: string | null;
  ingestion_source?: string | null;
  content_hash?: string | null;
  word_count?: number | null;
  rewritten: boolean;
  processed_at?: string | null;
  status?: string;
  metadata?: Record<string, unknown>;
};

type SupabaseRequestOptions = {
  method?: string;
  query?: Record<string, string>;
  body?: unknown;
  prefer?: string;
};

function getSupabaseUrl(): string | null {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || null;
}

function getSupabaseServiceKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || null;
}

function cleanDate(value: unknown): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

export class SupabaseStoryStore {
  public static isConfigured(): boolean {
    if (typeof window !== 'undefined') {
      return false;
    }

    return Boolean(getSupabaseUrl() && getSupabaseServiceKey());
  }

  private static async request<T>(table: string, options: SupabaseRequestOptions = {}): Promise<T> {
    const supabaseUrl = getSupabaseUrl();
    const serviceKey = getSupabaseServiceKey();

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Supabase is not configured');
    }

    const url = new URL(`/rest/v1/${table}`, supabaseUrl);
    Object.entries(options.query || {}).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      method: options.method || 'GET',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        ...(options.prefer ? { Prefer: options.prefer } : {})
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: 'no-store'
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Supabase ${table} request failed: ${response.status} ${message}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }

  private static toStory(row: SupabaseStoryRow): Story {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt || '',
      content: row.content || '',
      publishedAt: row.published_at,
      updatedAt: row.updated_at || undefined,
      originalPublishedAt: row.original_published_at || undefined,
      firstSeenAt: row.first_seen_at || undefined,
      author: row.author || 'Global Travel Report Editorial Team',
      category: row.category || 'Travel News',
      country: row.country || 'Global',
      tags: toArray(row.tags),
      featured: Boolean(row.featured),
      editorsPick: Boolean(row.editors_pick),
      imageUrl: row.image_url || undefined,
      image: row.image_url || undefined,
      imageAlt: row.image_alt || undefined,
      imageCredit: row.image_credit || undefined,
      imageCreditUrl: row.image_credit_url || undefined,
      photographer: row.photographer || undefined,
      source: row.source || undefined,
      sourceUrl: row.source_url || undefined,
      ingestionSource: row.ingestion_source || undefined,
      contentHash: row.content_hash || undefined,
      wordCount: row.word_count || undefined,
      rewritten: Boolean(row.rewritten),
      processedAt: row.processed_at || undefined,
      date: row.published_at,
      summary: row.excerpt || '',
      keywords: toArray(row.tags),
      type: row.category || 'Travel News'
    };
  }

  private static toStoryRow(story: Story, status: 'published' | 'archived' = 'published'): SupabaseStoryRow {
    const publishedAt = cleanDate(story.publishedAt) || new Date().toISOString();

    return {
      id: story.id,
      slug: story.slug,
      title: story.title,
      excerpt: story.excerpt || story.summary || '',
      content: story.content || '',
      published_at: publishedAt,
      updated_at: cleanDate(story.updatedAt),
      original_published_at: cleanDate(story.originalPublishedAt),
      first_seen_at: cleanDate(story.firstSeenAt),
      author: story.author || 'Global Travel Report Editorial Team',
      category: story.category || 'Travel News',
      country: story.country || 'Global',
      tags: toArray(story.tags || story.keywords),
      featured: Boolean(story.featured),
      editors_pick: Boolean(story.editorsPick),
      image_url: story.imageUrl || story.image || null,
      image_alt: story.imageAlt || null,
      image_credit: story.imageCredit || null,
      image_credit_url: story.imageCreditUrl || null,
      photographer: story.photographer || null,
      source: story.source || null,
      source_url: story.sourceUrl || null,
      ingestion_source: story.ingestionSource || null,
      content_hash: story.contentHash || null,
      word_count: story.wordCount || null,
      rewritten: Boolean(story.rewritten),
      processed_at: cleanDate(story.processedAt),
      status,
      metadata: {}
    };
  }

  public static async getPublishedStories(): Promise<Story[]> {
    const rows = await this.request<SupabaseStoryRow[]>('stories', {
      query: {
        select: '*',
        status: 'eq.published',
        order: 'published_at.desc'
      }
    });

    return rows.map((row) => this.toStory(row));
  }

  public static async getStoryById(id: string): Promise<Story | null> {
    const rows = await this.request<SupabaseStoryRow[]>('stories', {
      query: {
        select: '*',
        id: `eq.${id}`,
        status: 'eq.published',
        limit: '1'
      }
    });

    return rows[0] ? this.toStory(rows[0]) : null;
  }

  public static async getStoryBySlug(slug: string): Promise<Story | null> {
    const rows = await this.request<SupabaseStoryRow[]>('stories', {
      query: {
        select: '*',
        slug: `eq.${slug}`,
        status: 'eq.published',
        limit: '1'
      }
    });

    return rows[0] ? this.toStory(rows[0]) : null;
  }

  public static async upsertStory(story: Story): Promise<Story> {
    const rows = await this.request<SupabaseStoryRow[]>('stories', {
      method: 'POST',
      body: this.toStoryRow(story),
      query: {
        on_conflict: 'id',
        select: '*'
      },
      prefer: 'resolution=merge-duplicates,return=representation'
    });

    return rows[0] ? this.toStory(rows[0]) : story;
  }

  public static async saveDraft(story: Story): Promise<void> {
    const row = this.toStoryRow(story);
    await this.request('story_drafts', {
      method: 'POST',
      body: {
        id: `draft-${story.id}`,
        story_id: story.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        content: row.content,
        original_published_at: row.original_published_at,
        source: row.source,
        source_url: row.source_url,
        ingestion_source: row.ingestion_source,
        content_hash: row.content_hash,
        category: row.category,
        country: row.country,
        tags: row.tags,
        image_url: row.image_url,
        image_alt: row.image_alt,
        image_credit: row.image_credit,
        image_credit_url: row.image_credit_url,
        photographer: row.photographer,
        status: 'pending_review',
        story
      },
      query: {
        on_conflict: 'id'
      },
      prefer: 'resolution=merge-duplicates'
    });
  }

  public static async hasStoryOrDraft(sourceUrl: string, contentHash: string, slug: string): Promise<boolean> {
    const [stories, drafts] = await Promise.all([
      this.request<Array<{ id: string }>>('stories', {
        query: {
          select: 'id',
          or: `(source_url.eq.${sourceUrl},content_hash.eq.${contentHash},slug.eq.${slug})`,
          limit: '1'
        }
      }),
      this.request<Array<{ id: string }>>('story_drafts', {
        query: {
          select: 'id',
          or: `(source_url.eq.${sourceUrl},content_hash.eq.${contentHash},slug.eq.${slug})`,
          limit: '1'
        }
      })
    ]);

    return stories.length > 0 || drafts.length > 0;
  }

  public static async getEnabledFeedUrls(): Promise<string[]> {
    const rows = await this.request<Array<{ feed_url: string }>>('rss_sources', {
      query: {
        select: 'feed_url',
        enabled: 'eq.true',
        order: 'created_at.asc'
      }
    });

    return rows.map((row) => row.feed_url).filter(Boolean);
  }

  public static async recordPipelineRun(result: {
    mode: string;
    success: boolean;
    startedAt: string;
    finishedAt: string | null;
    feedsChecked: number;
    candidatesFound: number;
    summary: unknown;
    feedFailures: unknown;
    processed: unknown;
  }): Promise<void> {
    await this.request('story_pipeline_runs', {
      method: 'POST',
      body: {
        mode: result.mode,
        success: result.success,
        started_at: result.startedAt,
        finished_at: result.finishedAt,
        feeds_checked: result.feedsChecked,
        candidates_found: result.candidatesFound,
        summary: result.summary,
        feed_failures: result.feedFailures,
        processed: result.processed
      }
    });
  }
}
