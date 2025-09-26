create table if not exists public.pipeline (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pipeline_company_id_idx on public.pipeline (company_id);

create table if not exists public.stage (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references public.pipeline(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stage_pipeline_id_idx on public.stage (pipeline_id);

create table if not exists public.card (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.stage(id) on delete cascade,
  title text not null,
  description text,
  value numeric(12,2),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists card_stage_id_idx on public.card (stage_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pipeline_set_updated_at
before update on public.pipeline
for each row
execute function public.set_updated_at();

create trigger stage_set_updated_at
before update on public.stage
for each row
execute function public.set_updated_at();

create trigger card_set_updated_at
before update on public.card
for each row
execute function public.set_updated_at();

alter table public.pipeline enable row level security;
alter table public.stage enable row level security;
alter table public.card enable row level security;

create policy "Allow company owner manage pipelines"
on public.pipeline
for all
using (
  exists (
    select 1
    from public.company c
    where c.id = pipeline.company_id
      and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.company c
    where c.id = pipeline.company_id
      and c.user_id = auth.uid()
  )
);

create policy "Allow company owner manage stages"
on public.stage
for all
using (
  exists (
    select 1
    from public.pipeline p
    join public.company c on c.id = p.company_id
    where p.id = stage.pipeline_id
      and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.pipeline p
    join public.company c on c.id = p.company_id
    where p.id = stage.pipeline_id
      and c.user_id = auth.uid()
  )
);

create policy "Allow company owner manage cards"
on public.card
for all
using (
  exists (
    select 1
    from public.stage s
    join public.pipeline p on p.id = s.pipeline_id
    join public.company c on c.id = p.company_id
    where s.id = card.stage_id
      and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.stage s
    join public.pipeline p on p.id = s.pipeline_id
    join public.company c on c.id = p.company_id
    where s.id = card.stage_id
      and c.user_id = auth.uid()
  )
);
