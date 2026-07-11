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

export type StoryDraft = {
  id: string;
  story_id?: string | null;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  original_published_at?: string | null;
  source?: string | null;
  source_url?: string | null;
  ingestion_source?: string | null;
  content_hash?: string | null;
  category: string;
  country: string;
  tags: string[];
  image_url?: string | null;
  image_alt?: string | null;
  image_credit?: string | null;
  image_credit_url?: string | null;
  photographer?: Story['photographer'] | null;
  status: 'pending_review' | 'approved' | 'rejected' | 'published';
  rejection_reason?: string | null;
  story: Story;
  created_at: string;
  updated_at: string;
};

export type StoryPipelineRun = {
  id: string;
  mode: string;
  success: boolean;
  started_at: string;
  finished_at?: string | null;
  feeds_checked: number;
  candidates_found: number;
  summary: Record<string, unknown>;
  feed_failures: unknown[];
  processed: unknown[];
  created_at: string;
};

type SupabaseRequestOptions = {
  method?: string;
  query?: Record<string, string>;
  body?: unknown;
  prefer?: string;
};

export type StoryGenerationJob = {
  id: string;
  job_type: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'retry';
  attempts: number;
  max_attempts: number;
  payload: Record<string, unknown>;
  result?: unknown;
  last_error?: string | null;
  locked_by?: string | null;
  locked_at?: string | null;
  requested_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  created_at: string;
  updated_at: string;
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
      author: row.author || '',
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
    const publishedAt = cleanDate(story.publishedAt) || cleanDate(story.originalPublishedAt) || '2025-04-24T09:00:00.000Z';

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
      author: story.author || '',
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
        order: 'published_at.desc.nullslast'
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

  public static async getStoryDrafts(limit = 50): Promise<StoryDraft[]> {
    return this.request<StoryDraft[]>('story_drafts', {
      query: {
        select: '*',
        order: 'created_at.desc',
        limit: String(limit)
      }
    });
  }

  public static async getStoryDraftById(id: string): Promise<StoryDraft | null> {
    const rows = await this.request<StoryDraft[]>('story_drafts', {
      query: {
        select: '*',
        id: `eq.${id}`,
        limit: '1'
      }
    });

    return rows[0] || null;
  }

  public static async publishDraft(id: string): Promise<Story> {
    const draft = await this.getStoryDraftById(id);

    if (!draft) {
      throw new Error('Story draft not found');
    }

    const publishedAt = new Date().toISOString();
    const originalPublishedAt = draft.original_published_at || draft.story?.originalPublishedAt || draft.story?.publishedAt;

    const story: Story = {
      ...draft.story,
      id: draft.story_id || draft.story?.id || id.replace(/^draft-/, ''),
      slug: draft.slug,
      title: draft.title,
      excerpt: draft.excerpt,
      content: draft.content,
      publishedAt,
      updatedAt: publishedAt,
      date: publishedAt,
      originalPublishedAt,
      category: draft.category,
      country: draft.country,
      tags: toArray(draft.tags),
      imageUrl: draft.image_url || draft.story?.imageUrl,
      imageAlt: draft.image_alt || draft.story?.imageAlt,
      imageCredit: draft.image_credit || draft.story?.imageCredit,
      imageCreditUrl: draft.image_credit_url || draft.story?.imageCreditUrl,
      photographer: draft.photographer || draft.story?.photographer,
      featured: Boolean(draft.story?.featured),
      editorsPick: Boolean(draft.story?.editorsPick),
      author: '',
      status: undefined
    } as Story;

    const published = await this.upsertStory(story);

    await this.request('story_drafts', {
      method: 'PATCH',
      body: {
        status: 'published',
        story: published,
        updated_at: new Date().toISOString()
      },
      query: {
        id: `eq.${id}`
      }
    });

    return published;
  }

  public static async rejectDraft(id: string, reason: string): Promise<void> {
    await this.request('story_drafts', {
      method: 'PATCH',
      body: {
        status: 'rejected',
        rejection_reason: reason || null,
        updated_at: new Date().toISOString()
      },
      query: {
        id: `eq.${id}`
      }
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

  public static async recordFeedCheck(feedUrl: string, error?: string | null): Promise<void> {
    const checkedAt = new Date().toISOString();
    await this.request('rss_sources', {
      method: 'PATCH',
      query: {
        feed_url: `eq.${feedUrl}`
      },
      body: {
        last_checked_at: checkedAt,
        last_success_at: error ? undefined : checkedAt,
        last_error: error || null,
        updated_at: checkedAt
      }
    });
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

  public static async getLatestPipelineRuns(limit = 10): Promise<StoryPipelineRun[]> {
    return this.request<StoryPipelineRun[]>('story_pipeline_runs', {
      query: {
        select: '*',
        order: 'started_at.desc',
        limit: String(limit)
      }
    });
  }

  public static async enqueueStoryGenerationJob(payload: Record<string, unknown> = {}): Promise<StoryGenerationJob> {
    const rows = await this.request<StoryGenerationJob[]>('story_generation_jobs', {
      method: 'POST',
      body: {
        job_type: 'daily_auto_publisher',
        status: 'queued',
        payload
      },
      query: {
        select: '*'
      },
      prefer: 'return=representation'
    });

    if (!rows[0]) {
      throw new Error('Supabase did not return the queued story generation job');
    }

    return rows[0];
  }

  public static async getLatestStoryGenerationJobs(limit = 5): Promise<StoryGenerationJob[]> {
    return this.request<StoryGenerationJob[]>('story_generation_jobs', {
      query: {
        select: '*',
        order: 'created_at.desc',
        limit: String(limit)
      }
    });
  }

  public static async claimStoryGenerationJob(workerId: string): Promise<StoryGenerationJob | null> {
    await this.resetStaleStoryGenerationJobs();

    const queued = await this.request<StoryGenerationJob[]>('story_generation_jobs', {
      query: {
        select: '*',
        status: 'in.(queued,retry)',
        order: 'requested_at.asc',
        limit: '1'
      }
    });

    const job = queued[0];
    if (!job) {
      return null;
    }

    const rows = await this.request<StoryGenerationJob[]>('story_generation_jobs', {
      method: 'PATCH',
      body: {
        status: 'running',
        attempts: job.attempts + 1,
        locked_by: workerId,
        locked_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
        last_error: null
      },
      query: {
        id: `eq.${job.id}`,
        status: `eq.${job.status}`,
        select: '*'
      },
      prefer: 'return=representation'
    });

    return rows[0] || null;
  }

  public static async resetStaleStoryGenerationJobs(maxAgeMinutes = 15): Promise<void> {
    const staleBefore = new Date(Date.now() - maxAgeMinutes * 60 * 1000).toISOString();

    await this.request('story_generation_jobs', {
      method: 'PATCH',
      body: {
        status: 'retry',
        locked_by: null,
        locked_at: null,
        last_error: `Worker timed out or stopped before completion; retrying after ${maxAgeMinutes} minutes`
      },
      query: {
        status: 'eq.running',
        locked_at: `lt.${staleBefore}`
      }
    });
  }

  public static async completeStoryGenerationJob(jobId: string, result: unknown): Promise<void> {
    await this.request('story_generation_jobs', {
      method: 'PATCH',
      body: {
        status: 'completed',
        result,
        finished_at: new Date().toISOString(),
        locked_by: null,
        locked_at: null
      },
      query: {
        id: `eq.${jobId}`
      }
    });
  }

  public static async failStoryGenerationJob(job: StoryGenerationJob, error: unknown): Promise<void> {
    const message = error instanceof Error ? error.message : String(error);
    const shouldRetry = job.attempts < job.max_attempts;

    await this.request('story_generation_jobs', {
      method: 'PATCH',
      body: {
        status: shouldRetry ? 'retry' : 'failed',
        last_error: message,
        finished_at: new Date().toISOString(),
        locked_by: null,
        locked_at: null
      },
      query: {
        id: `eq.${job.id}`
      }
    });
  }

    public static async getRelatedStories(
          story: { slug: string; category: string; country: string },
          limit = 3
        ): Promise<Story[]> {
          // First try: same category AND country, excluding current slug
          const rows = await this.request<SupabaseStoryRow[]>('stories', {
                  query: {
                            select: '*',
                            status: 'eq.published',
                            category: `eq.${story.category}`,
                            country: `eq.${story.country}`,
                            slug: `neq.${story.slug}`,
                            order: 'published_at.desc.nullslast',
                            limit: String(limit),
                          },
                });
          if (rows.length >= limit) return rows.map((r) => this.toStory(r));

          // Fallback: same category only, excluding current slug
          const byCat = await this.request<SupabaseStoryRow[]>('stories', {
                  query: {
                            select: '*',
                            status: 'eq.published',
                            category: `eq.${story.category}`,
                            slug: `neq.${story.slug}`,
                            order: 'published_at.desc.nullslast',
                            limit: String(limit),
                          },
                });
          if (byCat.length >= limit) return byCat.map((r) => this.toStory(r));

          // Final fallback: most recent published stories, excluding current slug
          const recent = await this.request<SupabaseStoryRow[]>('stories', {
                  query: {
                            select: '*',
                            status: 'eq.published',
                            slug: `neq.${story.slug}`,
                            order: 'published_at.desc.nullslast',
                            limit: String(limit),
                          },
                });
          return recent.map((r) => this.toStory(r));
        }
}
