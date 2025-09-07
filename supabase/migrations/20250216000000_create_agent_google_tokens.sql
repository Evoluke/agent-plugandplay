create table if not exists agent_google_tokens (
  agent_id uuid primary key references agents(id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  expiry_date timestamptz not null,
  created_at timestamptz not null default now()
);
