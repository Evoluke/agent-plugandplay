-- Criação das tabelas de funil de vendas
create table if not exists public.pipeline (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  company_id bigint not null,
  name text not null,
  constraint pipeline_pkey primary key (id),
  constraint pipeline_company_id_fkey foreign key (company_id) references public.company (id) on delete cascade
);

create index if not exists pipeline_company_id_idx on public.pipeline (company_id);

create table if not exists public.stage (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  pipeline_id uuid not null,
  title text not null,
  position integer not null default 0,
  constraint stage_pkey primary key (id),
  constraint stage_pipeline_id_fkey foreign key (pipeline_id) references public.pipeline (id) on delete cascade
);

create index if not exists stage_pipeline_id_idx on public.stage (pipeline_id);
create index if not exists stage_pipeline_position_idx on public.stage (pipeline_id, position);

create table if not exists public.card (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  stage_id uuid not null,
  title text not null,
  description text null,
  value numeric(18,2) null,
  position integer not null default 0,
  constraint card_pkey primary key (id),
  constraint card_stage_id_fkey foreign key (stage_id) references public.stage (id) on delete cascade
);

create index if not exists card_stage_id_idx on public.card (stage_id);
create index if not exists card_stage_position_idx on public.card (stage_id, position);

-- Habilita RLS e políticas de acesso por empresa
alter table public.pipeline enable row level security;
create policy if not exists pipeline_select_own on public.pipeline
  for select
  using (
    exists (
      select 1
      from public.company
      where company.id = pipeline.company_id
        and company.user_id = auth.uid()
    )
  );

create policy if not exists pipeline_insert_own on public.pipeline
  for insert
  with check (
    exists (
      select 1
      from public.company
      where company.id = pipeline.company_id
        and company.user_id = auth.uid()
    )
  );

create policy if not exists pipeline_update_own on public.pipeline
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

create policy if not exists pipeline_delete_own on public.pipeline
  for delete
  using (
    exists (
      select 1
      from public.company
      where company.id = pipeline.company_id
        and company.user_id = auth.uid()
    )
  );

alter table public.stage enable row level security;
create policy if not exists stage_select_own on public.stage
  for select
  using (
    exists (
      select 1
      from public.pipeline
      join public.company on company.id = pipeline.company_id
      where pipeline.id = stage.pipeline_id
        and company.user_id = auth.uid()
    )
  );

create policy if not exists stage_insert_own on public.stage
  for insert
  with check (
    exists (
      select 1
      from public.pipeline
      join public.company on company.id = pipeline.company_id
      where pipeline.id = stage.pipeline_id
        and company.user_id = auth.uid()
    )
  );

create policy if not exists stage_update_own on public.stage
  for update
  using (
    exists (
      select 1
      from public.pipeline
      join public.company on company.id = pipeline.company_id
      where pipeline.id = stage.pipeline_id
        and company.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.pipeline
      join public.company on company.id = pipeline.company_id
      where pipeline.id = stage.pipeline_id
        and company.user_id = auth.uid()
    )
  );

create policy if not exists stage_delete_own on public.stage
  for delete
  using (
    exists (
      select 1
      from public.pipeline
      join public.company on company.id = pipeline.company_id
      where pipeline.id = stage.pipeline_id
        and company.user_id = auth.uid()
    )
  );

alter table public.card enable row level security;
create policy if not exists card_select_own on public.card
  for select
  using (
    exists (
      select 1
      from public.stage
      join public.pipeline on pipeline.id = stage.pipeline_id
      join public.company on company.id = pipeline.company_id
      where stage.id = card.stage_id
        and company.user_id = auth.uid()
    )
  );

create policy if not exists card_insert_own on public.card
  for insert
  with check (
    exists (
      select 1
      from public.stage
      join public.pipeline on pipeline.id = stage.pipeline_id
      join public.company on company.id = pipeline.company_id
      where stage.id = card.stage_id
        and company.user_id = auth.uid()
    )
  );

create policy if not exists card_update_own on public.card
  for update
  using (
    exists (
      select 1
      from public.stage
      join public.pipeline on pipeline.id = stage.pipeline_id
      join public.company on company.id = pipeline.company_id
      where stage.id = card.stage_id
        and company.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.stage
      join public.pipeline on pipeline.id = stage.pipeline_id
      join public.company on company.id = pipeline.company_id
      where stage.id = card.stage_id
        and company.user_id = auth.uid()
    )
  );

create policy if not exists card_delete_own on public.card
  for delete
  using (
    exists (
      select 1
      from public.stage
      join public.pipeline on pipeline.id = stage.pipeline_id
      join public.company on company.id = pipeline.company_id
      where stage.id = card.stage_id
        and company.user_id = auth.uid()
    )
  );
