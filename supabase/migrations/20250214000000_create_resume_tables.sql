create extension if not exists "pgcrypto";

create table if not exists public.resumes (
  id uuid primary key,
  user_id uuid references auth.users(id),
  email text,
  full_name text not null,
  headline text,
  phone text,
  location text,
  objective text,
  summary text,
  experiences jsonb default '[]'::jsonb,
  education jsonb default '[]'::jsonb,
  skills text[] default '{}',
  certifications text[] default '{}',
  languages text[] default '{}',
  focus_role text,
  cover_letter text,
  template text default 'minimal',
  english_version text,
  ats_keywords text[] default '{}',
  created_at timestamptz default timezone('utc'::text, now()),
  updated_at timestamptz default timezone('utc'::text, now())
);

create table if not exists public.resume_exports (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid references public.resumes(id) on delete cascade,
  user_id uuid references auth.users(id),
  format text not null,
  created_at timestamptz default timezone('utc'::text, now())
);

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  plan text not null,
  status text not null default 'active',
  created_at timestamptz default timezone('utc'::text, now())
);

alter table public.resumes enable row level security;
alter table public.resume_exports enable row level security;
alter table public.billing_subscriptions enable row level security;

create policy "select_own_resumes" on public.resumes for select using (
  auth.uid() = user_id or user_id is null
);

create policy "insert_update_resumes" on public.resumes for all using (
  auth.uid() = user_id or user_id is null
) with check (
  auth.uid() = user_id or user_id is null
);

create policy "select_own_exports" on public.resume_exports for select using (
  auth.uid() = user_id or user_id is null
);

create policy "insert_own_exports" on public.resume_exports for insert with check (
  auth.uid() = user_id or user_id is null
);

create policy "select_own_subscription" on public.billing_subscriptions for select using (
  auth.uid() = user_id
);

create index if not exists idx_resumes_user on public.resumes(user_id);
create index if not exists idx_resume_exports_user on public.resume_exports(user_id);
create index if not exists idx_billing_subscriptions_user on public.billing_subscriptions(user_id);
