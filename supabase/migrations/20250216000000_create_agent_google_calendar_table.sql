-- Create agent_google_calendar table for storing Google Calendar credentials
create table public.agent_google_calendar (
  agent_id uuid not null,
  api_key text not null,
  calendar_id text not null,
  is_valid boolean not null default false,
  updated_at timestamp with time zone not null default now(),
  constraint agent_google_calendar_pkey primary key (agent_id),
  constraint agent_google_calendar_agent_id_fkey foreign key (agent_id) references public.agents(id) on delete cascade
);

create index agent_google_calendar_agent_id_idx on public.agent_google_calendar(agent_id);
