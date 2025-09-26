-- Create pipeline management tables

create table if not exists public.pipeline (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  company_id bigint not null references public.company(id) on delete cascade,
  name text not null,
  description text
);

create table if not exists public.stage (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  pipeline_id uuid not null references public.pipeline(id) on delete cascade,
  name text not null,
  position integer not null default 0
);

create table if not exists public.card (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  pipeline_id uuid not null references public.pipeline(id) on delete cascade,
  stage_id uuid not null references public.stage(id) on delete cascade,
  title text not null,
  description text,
  value numeric(18,2),
  contact_name text,
  contact_email text,
  order_index integer not null default 0
);

create index if not exists pipeline_company_idx on public.pipeline(company_id);
create index if not exists stage_pipeline_idx on public.stage(pipeline_id);
create index if not exists card_stage_idx on public.card(stage_id);
create index if not exists card_pipeline_idx on public.card(pipeline_id);

alter table public.pipeline enable row level security;
alter table public.stage enable row level security;
alter table public.card enable row level security;

-- Pipeline policies

drop policy if exists pipeline_select_own on public.pipeline;
create policy pipeline_select_own on public.pipeline
  for select
  using (
    exists (
      select 1
      from public.company
      where company.id = pipeline.company_id
        and company.user_id = auth.uid()
    )
  );

drop policy if exists pipeline_insert_own on public.pipeline;
create policy pipeline_insert_own on public.pipeline
  for insert
  with check (
    exists (
      select 1
      from public.company
      where company.id = pipeline.company_id
        and company.user_id = auth.uid()
    )
  );

drop policy if exists pipeline_update_own on public.pipeline;
create policy pipeline_update_own on public.pipeline
  for update
  using (
    exists (
      select 1
      from public.company
      where company.id = pipeline.company_id
        and company.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.company
      where company.id = pipeline.company_id
        and company.user_id = auth.uid()
    )
  );

drop policy if exists pipeline_delete_own on public.pipeline;
create policy pipeline_delete_own on public.pipeline
  for delete
  using (
    exists (
      select 1
      from public.company
      where company.id = pipeline.company_id
        and company.user_id = auth.uid()
    )
  );

-- Stage policies

drop policy if exists stage_select_own on public.stage;
create policy stage_select_own on public.stage
  for select
  using (
    exists (
      select 1
      from public.pipeline
      join public.company on company.id = pipeline.company_id
      where stage.pipeline_id = pipeline.id
        and company.user_id = auth.uid()
    )
  );

drop policy if exists stage_write_own on public.stage;
create policy stage_write_own on public.stage
  for all
  using (
    exists (
      select 1
      from public.pipeline
      join public.company on company.id = pipeline.company_id
      where stage.pipeline_id = pipeline.id
        and company.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.pipeline
      join public.company on company.id = pipeline.company_id
      where stage.pipeline_id = pipeline.id
        and company.user_id = auth.uid()
    )
  );

-- Card policies

drop policy if exists card_select_own on public.card;
create policy card_select_own on public.card
  for select
  using (
    exists (
      select 1
      from public.pipeline
      join public.company on company.id = pipeline.company_id
      where card.pipeline_id = pipeline.id
        and company.user_id = auth.uid()
    )
  );

drop policy if exists card_write_own on public.card;
create policy card_write_own on public.card
  for all
  using (
    exists (
      select 1
      from public.pipeline
      join public.company on company.id = pipeline.company_id
      where card.pipeline_id = pipeline.id
        and company.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.pipeline
      join public.company on company.id = pipeline.company_id
      where card.pipeline_id = pipeline.id
        and company.user_id = auth.uid()
    )
  );
