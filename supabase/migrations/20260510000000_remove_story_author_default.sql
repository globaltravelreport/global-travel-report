alter table public.stories alter column author set default '';

update public.stories
set author = ''
where author = 'Global Travel Report Editorial Team';

update public.story_drafts
set story = jsonb_set(
  jsonb_set(
    story,
    '{author}',
    to_jsonb(''::text),
    true
  ),
  '{publishedAt}',
  to_jsonb(to_char(original_published_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
  true
),
updated_at = now()
where original_published_at is not null
  and (
    story->>'author' = 'Global Travel Report Editorial Team'
    or story->>'publishedAt' is distinct from to_char(original_published_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  );
