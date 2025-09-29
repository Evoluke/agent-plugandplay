create table if not exists public.tool_leads (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  tool_slug text not null,
  payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.tool_leads
  add constraint tool_leads_email_check
  check (char_length(email) > 3);

create index if not exists tool_leads_tool_slug_idx on public.tool_leads(tool_slug);
create index if not exists tool_leads_created_at_idx on public.tool_leads(created_at);
