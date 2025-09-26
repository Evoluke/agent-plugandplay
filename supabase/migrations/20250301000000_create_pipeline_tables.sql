-- Create pipeline tables for CRM funil de vendas
create table public.pipeline (
  id uuid primary key default gen_random_uuid(),
  company_id bigint not null references public.company(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamp with time zone not null default timezone('utc', now()),
  updated_at timestamp with time zone not null default timezone('utc', now())
);

create index pipeline_company_idx on public.pipeline (company_id);

create table public.stage (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references public.pipeline(id) on delete cascade,
  company_id bigint not null references public.company(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamp with time zone not null default timezone('utc', now()),
  updated_at timestamp with time zone not null default timezone('utc', now())
);

create index stage_pipeline_idx on public.stage (pipeline_id, position);
create index stage_company_idx on public.stage (company_id);

create table public.card (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.stage(id) on delete cascade,
  company_id bigint not null references public.company(id) on delete cascade,
  title text not null,
  company_name text,
  owner text,
  plan text,
  status text default 'Ativo',
  estimated_value numeric(14, 2),
  messages_count integer not null default 0,
  last_interaction_at timestamp with time zone,
  next_action_at timestamp with time zone,
  note text,
  position integer not null default 0,
  created_at timestamp with time zone not null default timezone('utc', now()),
  updated_at timestamp with time zone not null default timezone('utc', now())
);

create index card_stage_idx on public.card (stage_id, position);
create index card_company_idx on public.card (company_id);

alter table public.pipeline enable row level security;
alter table public.stage enable row level security;
alter table public.card enable row level security;

create policy pipeline_manage_own on public.pipeline
  using (company_id in (
    select id from public.company where company.id = pipeline.company_id and company.user_id = auth.uid()
  ))
  with check (company_id in (
    select id from public.company where company.id = pipeline.company_id and company.user_id = auth.uid()
  ));

create policy stage_manage_own on public.stage
  using (company_id in (
    select id from public.company where company.id = stage.company_id and company.user_id = auth.uid()
  ))
  with check (company_id in (
    select id from public.company where company.id = stage.company_id and company.user_id = auth.uid()
  ));

create policy card_manage_own on public.card
  using (company_id in (
    select id from public.company where company.id = card.company_id and company.user_id = auth.uid()
  ))
  with check (company_id in (
    select id from public.company where company.id = card.company_id and company.user_id = auth.uid()
  ));
