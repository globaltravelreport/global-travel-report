-- Supabase-owned application roles. Never use user_metadata for authorization:
-- authenticated users can edit it themselves.
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

-- Users may only read their own role. There are intentionally no client-side
-- insert, update, or delete policies: role assignment is an administrator-only
-- database operation.
create policy "users can read their own role"
  on public.user_roles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Keep the table private from unauthenticated callers and prevent accidental
-- role management through the Data API.
revoke all on table public.user_roles from anon;
grant select on table public.user_roles to authenticated;

