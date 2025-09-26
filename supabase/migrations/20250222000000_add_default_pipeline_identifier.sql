alter table public.pipeline
  add column if not exists identifier text;

create unique index if not exists pipeline_company_identifier_key
  on public.pipeline (company_id, identifier)
  where identifier is not null;
