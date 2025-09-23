-- Estruturas para receber e armazenar eventos da Evolution API
create table public.evolution_instances (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  company_id bigint null references public.company (id) on delete set null,
  external_id text not null,
  display_name text null,
  server_url text null,
  webhook_url text null,
  api_key_hash text not null,
  last_event_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  constraint evolution_instances_pkey primary key (id),
  constraint evolution_instances_external_id_key unique (external_id)
);

create index evolution_instances_company_idx on public.evolution_instances(company_id);
create index evolution_instances_last_event_idx on public.evolution_instances(last_event_at);

create table public.evolution_conversations (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  instance_id uuid not null references public.evolution_instances (id) on delete cascade,
  company_id bigint null references public.company (id) on delete set null,
  remote_jid text not null,
  sender_lid text null,
  push_name text null,
  sender text null,
  last_message_id text null,
  last_message_type text null,
  last_message_status text null,
  last_message_preview text null,
  last_message_timestamp timestamptz null,
  chatwoot_conversation_id bigint null,
  chatwoot_inbox_id bigint null,
  metadata jsonb not null default '{}'::jsonb,
  constraint evolution_conversations_pkey primary key (id),
  constraint evolution_conversations_instance_remote_key unique (instance_id, remote_jid)
);

create index evolution_conversations_instance_idx on public.evolution_conversations(instance_id);
create index evolution_conversations_company_idx on public.evolution_conversations(company_id);
create index evolution_conversations_remote_jid_idx on public.evolution_conversations(remote_jid);

create table public.evolution_messages (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  instance_id uuid not null references public.evolution_instances (id) on delete cascade,
  conversation_id uuid not null references public.evolution_conversations (id) on delete cascade,
  company_id bigint null references public.company (id) on delete set null,
  message_id text not null,
  remote_jid text not null,
  sender_lid text null,
  from_me boolean not null default false,
  push_name text null,
  sender text null,
  status text null,
  message_type text null,
  message_timestamp timestamptz null,
  message_text text null,
  message_payload jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  source text null,
  destination text null,
  webhook_url text null,
  server_url text null,
  chatwoot_message_id bigint null,
  chatwoot_conversation_id bigint null,
  chatwoot_inbox_id bigint null,
  event_datetime timestamptz null,
  execution_mode text null,
  constraint evolution_messages_pkey primary key (id),
  constraint evolution_messages_instance_message_key unique (instance_id, message_id)
);

create index evolution_messages_conversation_idx on public.evolution_messages(conversation_id);
create index evolution_messages_remote_jid_idx on public.evolution_messages(remote_jid);
create index evolution_messages_timestamp_idx on public.evolution_messages(message_timestamp);
create index evolution_messages_status_idx on public.evolution_messages(status);
create index evolution_messages_message_id_idx on public.evolution_messages(message_id);

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger evolution_instances_touch_updated_at
before update on public.evolution_instances
for each row execute function public.touch_updated_at();

create trigger evolution_conversations_touch_updated_at
before update on public.evolution_conversations
for each row execute function public.touch_updated_at();
