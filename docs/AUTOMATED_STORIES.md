# Automated Story Pipeline

Global Travel Report now uses the Supabase/Vercel story queue for daily story generation.

## Active Flow

1. Supabase cron calls `POST /api/cron/dailyAutoPublisher`.
2. The API queues a story generation job in Supabase.
3. Supabase cron calls `/api/cron/storyQueueWorker` on an interval.
4. The worker claims one queued job, fetches approved RSS feeds, rewrites eligible stories with the configured AI provider, adds Unsplash image data, and writes drafts or published stories to Supabase.

The old GitHub Actions and local markdown generator path has been removed. Do not recreate scheduled workflows that write to `content/articles`; that creates a second publishing system and can reintroduce duplicate stories, stale dates, and inconsistent categories.

## Required Vercel Variables

```text
AI_PROVIDER=cloudflare
CLOUDFLARE_AI_WORKER_URL=...
CLOUDFLARE_AI_WORKER_TOKEN=...
CLOUDFLARE_AI_MODEL=...
SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
UNSPLASH_ACCESS_KEY=...
AUTO_PUBLISH_STORIES=false
```

Set `AUTO_PUBLISH_STORIES=true` only when drafts are consistently good enough to publish without review.

## RSS Sources

RSS sources are managed in the Supabase `rss_sources` table. Disabled feeds are skipped. Feed health is tracked with `last_checked_at`, `last_success_at`, and `last_error`.

## Manual Checks

- Queue a run: `POST /api/cron/dailyAutoPublisher`
- Process a queued run: `GET /api/cron/storyQueueWorker`
- Health check: `GET /api/cron/storyQueueWorker?health=1`
- Public RSS feed: `GET /api/feed/rss`

All cron endpoints require the configured cron bearer token unless called with `?health=1`.
