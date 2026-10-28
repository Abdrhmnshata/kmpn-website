-- KMPN website schema
-- Run in the Supabase SQL editor (or `supabase db push`).

-- ---------------------------------------------------------------- stories --

create table if not exists public.success_stories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  client      text not null,
  sector      text,
  country     text,
  period      text,
  title       text not null,
  summary     text,
  tags        text[] not null default '{}',
  cats        text[] not null default '{}',
  from_value  text,
  to_value    text,
  metric      text,
  results     jsonb not null default '{}'::jsonb,
  cover_url   text,
  href        text,
  status      text not null default 'soon' check (status in ('live', 'soon')),
  sort_order  int  not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists success_stories_published_sort_idx
  on public.success_stories (published, sort_order);

-- ------------------------------------------------------------------- team --

create table if not exists public.team_members (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role       text not null,
  photo_url  text,
  accent_rgb text,
  sort_order int not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------ leads --

create table if not exists public.contact_leads (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  email      text,
  company    text,
  message    text,
  source     text,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------- RLS --

alter table public.success_stories enable row level security;
alter table public.team_members    enable row level security;
alter table public.contact_leads   enable row level security;

-- Public site reads published rows only.
drop policy if exists "read published stories" on public.success_stories;
create policy "read published stories"
  on public.success_stories for select
  to anon, authenticated
  using (published = true);

drop policy if exists "read published team" on public.team_members;
create policy "read published team"
  on public.team_members for select
  to anon, authenticated
  using (published = true);

-- Leads: the contact form may insert, nobody anonymous may read them back.
drop policy if exists "anon can submit leads" on public.contact_leads;
create policy "anon can submit leads"
  on public.contact_leads for insert
  to anon, authenticated
  with check (true);
