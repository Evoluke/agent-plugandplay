-- Evolution WhatsApp messaging schema

create type public.whatsapp_message_direction as enum ('inbound', 'outbound');
create type public.whatsapp_message_status as enum (
  'pending',
  'sent',
  'delivered',
  'read',
  'received',
  'failed'
);
create type public.whatsapp_message_type as enum (
  'text',
  'image',
  'video',
  'audio',
  'document',
  'sticker',
  'location',
  'contact',
  'unknown',
  'reaction'
);
create type public.whatsapp_conversation_status as enum (
  'open',
  'pending',
  'closed',
  'archived'
);

create table public.whatsapp_contacts (
  id uuid not null default gen_random_uuid(),
  company_id bigint not null references public.company(id) on delete cascade,
  whatsapp_id text not null,
  phone_number text not null,
  display_name text null,
  profile_name text null,
  is_business boolean not null default false,
  extras jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint whatsapp_contacts_pkey primary key (id),
  constraint whatsapp_contacts_company_whatsapp_id_key unique (company_id, whatsapp_id)
);

create index whatsapp_contacts_company_idx on public.whatsapp_contacts (company_id);
create index whatsapp_contacts_phone_idx on public.whatsapp_contacts (phone_number);

create table public.whatsapp_conversations (
  id uuid not null default gen_random_uuid(),
  company_id bigint not null references public.company(id) on delete cascade,
  contact_id uuid not null references public.whatsapp_contacts(id) on delete cascade,
  remote_jid text not null,
  instance_id text null,
  status public.whatsapp_conversation_status not null default 'open',
  last_message_at timestamp with time zone null,
  unread_count integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint whatsapp_conversations_pkey primary key (id),
  constraint whatsapp_conversations_company_contact_key unique (company_id, contact_id)
);

create index whatsapp_conversations_company_idx on public.whatsapp_conversations (company_id);
create index whatsapp_conversations_contact_idx on public.whatsapp_conversations (contact_id);

create table public.whatsapp_messages (
  id uuid not null default gen_random_uuid(),
  company_id bigint not null references public.company(id) on delete cascade,
  conversation_id uuid not null references public.whatsapp_conversations(id) on delete cascade,
  contact_id uuid null references public.whatsapp_contacts(id) on delete set null,
  evolution_message_id text not null,
  direction public.whatsapp_message_direction not null,
  message_type public.whatsapp_message_type not null,
  status public.whatsapp_message_status not null default 'received',
  body text null,
  caption text null,
  remote_jid text null,
  instance_id text null,
  occurred_at timestamp with time zone not null default now(),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint whatsapp_messages_pkey primary key (id),
  constraint whatsapp_messages_evolution_message_id_key unique (evolution_message_id)
);

create index whatsapp_messages_company_idx on public.whatsapp_messages (company_id);
create index whatsapp_messages_conversation_idx on public.whatsapp_messages (conversation_id);
create index whatsapp_messages_occurred_at_idx on public.whatsapp_messages (occurred_at);

create table public.whatsapp_message_media (
  id uuid not null default gen_random_uuid(),
  message_id uuid not null references public.whatsapp_messages(id) on delete cascade,
  company_id bigint not null references public.company(id) on delete cascade,
  media_type public.whatsapp_message_type not null default 'unknown',
  provider_media_id text null,
  mime_type text null,
  file_name text null,
  file_size_bytes integer null,
  url text null,
  sha256 text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint whatsapp_message_media_pkey primary key (id),
  constraint whatsapp_message_media_message_id_provider_media_id_key unique (message_id, provider_media_id)
);

create index whatsapp_message_media_message_idx on public.whatsapp_message_media (message_id);
create index whatsapp_message_media_company_idx on public.whatsapp_message_media (company_id);

alter table public.whatsapp_contacts enable row level security;
alter table public.whatsapp_conversations enable row level security;
alter table public.whatsapp_messages enable row level security;
alter table public.whatsapp_message_media enable row level security;

create policy whatsapp_contacts_select_own on public.whatsapp_contacts
  for select using (
    exists (
      select 1 from public.company
      where company.id = whatsapp_contacts.company_id
        and company.user_id = auth.uid()
    )
  );

create policy whatsapp_contacts_manage_own on public.whatsapp_contacts
  for all using (
    exists (
      select 1 from public.company
      where company.id = whatsapp_contacts.company_id
        and company.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.company
      where company.id = whatsapp_contacts.company_id
        and company.user_id = auth.uid()
    )
  );

create policy whatsapp_conversations_select_own on public.whatsapp_conversations
  for select using (
    exists (
      select 1 from public.company
      where company.id = whatsapp_conversations.company_id
        and company.user_id = auth.uid()
    )
  );

create policy whatsapp_conversations_manage_own on public.whatsapp_conversations
  for all using (
    exists (
      select 1 from public.company
      where company.id = whatsapp_conversations.company_id
        and company.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.company
      where company.id = whatsapp_conversations.company_id
        and company.user_id = auth.uid()
    )
  );

create policy whatsapp_messages_select_own on public.whatsapp_messages
  for select using (
    exists (
      select 1 from public.company
      where company.id = whatsapp_messages.company_id
        and company.user_id = auth.uid()
    )
  );

create policy whatsapp_messages_manage_own on public.whatsapp_messages
  for all using (
    exists (
      select 1 from public.company
      where company.id = whatsapp_messages.company_id
        and company.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.company
      where company.id = whatsapp_messages.company_id
        and company.user_id = auth.uid()
    )
  );

create policy whatsapp_message_media_select_own on public.whatsapp_message_media
  for select using (
    exists (
      select 1 from public.company
      where company.id = whatsapp_message_media.company_id
        and company.user_id = auth.uid()
    )
  );

create policy whatsapp_message_media_manage_own on public.whatsapp_message_media
  for all using (
    exists (
      select 1 from public.company
      where company.id = whatsapp_message_media.company_id
        and company.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.company
      where company.id = whatsapp_message_media.company_id
        and company.user_id = auth.uid()
    )
  );
