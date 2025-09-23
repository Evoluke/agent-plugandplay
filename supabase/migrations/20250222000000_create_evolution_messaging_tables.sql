-- Estruturas para integração de mensagens via Evolution API

create table public.evolution_instances (
  id uuid not null default gen_random_uuid(),
  company_id bigint not null,
  instance_id text null,
  instance_name text not null,
  webhook_token text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint evolution_instances_pkey primary key (id),
  constraint evolution_instances_company_id_fkey foreign key (company_id) references public.company (id) on delete cascade
);

create unique index evolution_instances_instance_name_key on public.evolution_instances (instance_name);
create unique index evolution_instances_instance_id_key on public.evolution_instances (instance_id) where instance_id is not null;

create table public.whatsapp_conversations (
  id uuid not null default gen_random_uuid(),
  company_id bigint not null,
  instance_id text null,
  instance_name text not null,
  chat_id text not null,
  contact_wa_id text null,
  contact_number text null,
  contact_name text null,
  is_group boolean not null default false,
  last_message_id text null,
  last_message_preview text null,
  last_message_direction text null,
  last_message_at timestamp with time zone null,
  unread_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint whatsapp_conversations_pkey primary key (id),
  constraint whatsapp_conversations_company_id_fkey foreign key (company_id) references public.company (id) on delete cascade
);

create unique index whatsapp_conversations_company_chat_key on public.whatsapp_conversations (company_id, chat_id);
create index whatsapp_conversations_instance_idx on public.whatsapp_conversations (instance_name);
create index whatsapp_conversations_last_message_idx on public.whatsapp_conversations (company_id, last_message_at desc);

create table public.whatsapp_messages (
  id uuid not null default gen_random_uuid(),
  company_id bigint not null,
  conversation_id uuid not null,
  instance_name text not null,
  message_id text not null,
  chat_id text not null,
  direction text not null,
  from_me boolean not null default false,
  sender text null,
  sender_name text null,
  type text not null,
  status text null,
  body text null,
  raw_payload jsonb not null default '{}'::jsonb,
  sent_at timestamp with time zone not null,
  received_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint whatsapp_messages_pkey primary key (id),
  constraint whatsapp_messages_company_id_fkey foreign key (company_id) references public.company (id) on delete cascade,
  constraint whatsapp_messages_conversation_id_fkey foreign key (conversation_id) references public.whatsapp_conversations (id) on delete cascade,
  constraint whatsapp_messages_direction_check check (direction in ('inbound', 'outbound'))
);

create unique index whatsapp_messages_company_message_key on public.whatsapp_messages (company_id, message_id);
create index whatsapp_messages_conversation_idx on public.whatsapp_messages (conversation_id, sent_at desc);
create index whatsapp_messages_sent_at_idx on public.whatsapp_messages (company_id, sent_at desc);

alter table public.evolution_instances enable row level security;
create policy evolution_instances_select_own on public.evolution_instances
  for select
  using (
    exists (
      select 1
      from public.company
      where company.id = evolution_instances.company_id
        and company.user_id = auth.uid()
    )
  );

create policy evolution_instances_write_own on public.evolution_instances
  for all
  using (
    exists (
      select 1
      from public.company
      where company.id = evolution_instances.company_id
        and company.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.company
      where company.id = evolution_instances.company_id
        and company.user_id = auth.uid()
    )
  );

alter table public.whatsapp_conversations enable row level security;
create policy whatsapp_conversations_select_own on public.whatsapp_conversations
  for select
  using (
    exists (
      select 1
      from public.company
      where company.id = whatsapp_conversations.company_id
        and company.user_id = auth.uid()
    )
  );

create policy whatsapp_conversations_write_own on public.whatsapp_conversations
  for all
  using (
    exists (
      select 1
      from public.company
      where company.id = whatsapp_conversations.company_id
        and company.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.company
      where company.id = whatsapp_conversations.company_id
        and company.user_id = auth.uid()
    )
  );

alter table public.whatsapp_messages enable row level security;
create policy whatsapp_messages_select_own on public.whatsapp_messages
  for select
  using (
    exists (
      select 1
      from public.whatsapp_conversations
      join public.company on company.id = whatsapp_conversations.company_id
      where whatsapp_conversations.id = whatsapp_messages.conversation_id
        and company.user_id = auth.uid()
    )
  );

create policy whatsapp_messages_write_own on public.whatsapp_messages
  for all
  using (
    exists (
      select 1
      from public.whatsapp_conversations
      join public.company on company.id = whatsapp_conversations.company_id
      where whatsapp_conversations.id = whatsapp_messages.conversation_id
        and company.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.whatsapp_conversations
      join public.company on company.id = whatsapp_conversations.company_id
      where whatsapp_conversations.id = whatsapp_messages.conversation_id
        and company.user_id = auth.uid()
    )
  );
