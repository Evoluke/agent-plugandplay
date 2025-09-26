create table if not exists public.pipeline (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  company_id bigint not null references public.company(id) on delete cascade,
  name text not null,
  constraint pipeline_pkey primary key (id)
);

create table if not exists public.stage (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  pipeline_id uuid not null references public.pipeline(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  constraint stage_pkey primary key (id)
);

create table if not exists public.card (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  company_id bigint not null references public.company(id) on delete cascade,
  pipeline_id uuid not null references public.pipeline(id) on delete cascade,
  stage_id uuid not null references public.stage(id) on delete cascade,
  title text not null,
  customer_name text null,
  description text null,
  value numeric(14, 2) null,
  position integer not null default 0,
  constraint card_pkey primary key (id)
);

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

create index if not exists stage_pipeline_id_idx on public.stage(pipeline_id);
create index if not exists stage_position_idx on public.stage(position);
create index if not exists card_stage_id_idx on public.card(stage_id);
create index if not exists card_pipeline_id_idx on public.card(pipeline_id);
create index if not exists card_company_id_idx on public.card(company_id);
create index if not exists card_position_idx on public.card(position);

alter table public.pipeline enable row level security;
alter table public.stage enable row level security;
alter table public.card enable row level security;

drop policy if exists "Pipeline acesso por empresa" on public.pipeline;

create policy "Pipeline acesso por empresa" on public.pipeline
  for select using (
    exists (
      select 1
      from public.company c
      where c.id = pipeline.company_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Pipeline inserção por empresa" on public.pipeline;

create policy "Pipeline inserção por empresa" on public.pipeline
  for insert with check (
    exists (
      select 1
      from public.company c
      where c.id = pipeline.company_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Pipeline atualização por empresa" on public.pipeline;

create policy "Pipeline atualização por empresa" on public.pipeline
  for update using (
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

drop policy if exists "Pipeline exclusão por empresa" on public.pipeline;

create policy "Pipeline exclusão por empresa" on public.pipeline
  for delete using (
    exists (
      select 1
      from public.company c
      where c.id = pipeline.company_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Stage acesso por empresa" on public.stage;

create policy "Stage acesso por empresa" on public.stage
  for select using (
    exists (
      select 1
      from public.pipeline p
      join public.company c on c.id = p.company_id
      where p.id = stage.pipeline_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Stage inserção por empresa" on public.stage;

create policy "Stage inserção por empresa" on public.stage
  for insert with check (
    exists (
      select 1
      from public.pipeline p
      join public.company c on c.id = p.company_id
      where p.id = stage.pipeline_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Stage atualização por empresa" on public.stage;

create policy "Stage atualização por empresa" on public.stage
  for update using (
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

drop policy if exists "Stage exclusão por empresa" on public.stage;

create policy "Stage exclusão por empresa" on public.stage
  for delete using (
    exists (
      select 1
      from public.pipeline p
      join public.company c on c.id = p.company_id
      where p.id = stage.pipeline_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Card acesso por empresa" on public.card;

create policy "Card acesso por empresa" on public.card
  for select using (
    exists (
      select 1
      from public.pipeline p
      join public.company c on c.id = p.company_id
      where p.id = card.pipeline_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Card inserção por empresa" on public.card;

create policy "Card inserção por empresa" on public.card
  for insert with check (
    exists (
      select 1
      from public.pipeline p
      join public.company c on c.id = p.company_id
      where p.id = card.pipeline_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Card atualização por empresa" on public.card;

create policy "Card atualização por empresa" on public.card
  for update using (
    exists (
      select 1
      from public.pipeline p
      join public.company c on c.id = p.company_id
      where p.id = card.pipeline_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.pipeline p
      join public.company c on c.id = p.company_id
      where p.id = card.pipeline_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Card exclusão por empresa" on public.card;

create policy "Card exclusão por empresa" on public.card
  for delete using (
    exists (
      select 1
      from public.pipeline p
      join public.company c on c.id = p.company_id
      where p.id = card.pipeline_id
        and c.user_id = auth.uid()
    )
  );
