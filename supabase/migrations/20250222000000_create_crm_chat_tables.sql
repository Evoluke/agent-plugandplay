-- Create chat CRM tables integrated with Evolution API

-- Atualiza artefatos legados e cria o armazenamento omnichannel do chat
DROP VIEW IF EXISTS public.crm_message_daily_metrics;

-- Preserve legacy aggregated messages table used by existing dashboards
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id bigint NOT NULL REFERENCES public.company (id),
  message_date date NOT NULL,
  message_count integer NOT NULL
);

-- Enumerations to support omnichannel conversations
DO $$
BEGIN
  CREATE TYPE public.chat_channel AS ENUM (
    'whatsapp',
    'instagram',
    'facebook_messenger',
    'telegram',
    'email',
    'webchat'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE public.conversation_status AS ENUM (
    'open',
    'pending',
    'closed',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE public.message_direction AS ENUM ('inbound', 'outbound');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE public.message_sender_type AS ENUM (
    'contact',
    'agent',
    'automation',
    'system'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE public.message_content_type AS ENUM (
    'text',
    'image',
    'audio',
    'video',
    'document',
    'sticker',
    'location',
    'template',
    'unknown'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE public.message_delivery_status AS ENUM (
    'pending',
    'sent',
    'delivered',
    'read',
    'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- Integration instances that connect companies to Evolution API tenants
CREATE TABLE IF NOT EXISTS public.instance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  company_id bigint NOT NULL REFERENCES public.company (id) ON DELETE CASCADE,
  name text NOT NULL,
  provider text NOT NULL DEFAULT 'evolution',
  external_id text,
  webhook_url text,
  webhook_secret text,
  is_active boolean NOT NULL DEFAULT true,
  last_sync_at timestamptz,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (company_id, external_id)
);

-- Contacts synchronized from Evolution API or created manually by operators
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  company_id bigint NOT NULL REFERENCES public.company (id) ON DELETE CASCADE,
  instance_id uuid REFERENCES public.instance (id) ON DELETE SET NULL,
  external_id text,
  full_name text,
  first_name text,
  last_name text,
  display_name text,
  phone text,
  email text,
  profile_image_url text,
  language text,
  timezone text,
  last_seen_at timestamptz,
  is_blocked boolean NOT NULL DEFAULT false,
  is_favorite boolean NOT NULL DEFAULT false,
  tags text[] DEFAULT '{}'::text[],
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (company_id, external_id)
);

-- Conversations aggregate interactions per contact and channel
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  company_id bigint NOT NULL REFERENCES public.company (id) ON DELETE CASCADE,
  instance_id uuid REFERENCES public.instance (id) ON DELETE SET NULL,
  contact_id uuid NOT NULL REFERENCES public.contacts (id) ON DELETE CASCADE,
  external_id text,
  channel public.chat_channel NOT NULL,
  subject text,
  status public.conversation_status NOT NULL DEFAULT 'open',
  priority text,
  assigned_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  assigned_agent_id uuid REFERENCES public.agents (id) ON DELETE SET NULL,
  opened_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  closed_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  first_response_at timestamptz,
  last_message_at timestamptz,
  closed_at timestamptz,
  sla_due_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (company_id, external_id)
);

-- Messages exchanged inside each conversation (mantém tabela agregada "public.messages")
CREATE TABLE IF NOT EXISTS public.messages_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz NOT NULL DEFAULT now(),
  company_id bigint NOT NULL REFERENCES public.company (id) ON DELETE CASCADE,
  instance_id uuid REFERENCES public.instance (id) ON DELETE SET NULL,
  conversation_id uuid NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts (id) ON DELETE SET NULL,
  author_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  agent_id uuid REFERENCES public.agents (id) ON DELETE SET NULL,
  direction public.message_direction NOT NULL,
  sender_type public.message_sender_type NOT NULL,
  status public.message_delivery_status NOT NULL DEFAULT 'pending',
  content_type public.message_content_type NOT NULL DEFAULT 'text',
  text text,
  media_url text,
  media_caption text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  reply_to_message_id uuid REFERENCES public.messages_chat (id) ON DELETE SET NULL,
  external_id text,
  external_status text,
  error_reason text,
  delivered_at timestamptz,
  read_at timestamptz,
  UNIQUE (company_id, external_id)
);

-- Indexes to optimize frequent queries
CREATE INDEX IF NOT EXISTS instance_company_id_idx ON public.instance (company_id);
CREATE INDEX IF NOT EXISTS contacts_company_id_idx ON public.contacts (company_id);
CREATE INDEX IF NOT EXISTS contacts_instance_id_idx ON public.contacts (instance_id);
CREATE INDEX IF NOT EXISTS conversations_company_id_idx ON public.conversations (company_id);
CREATE INDEX IF NOT EXISTS conversations_contact_id_idx ON public.conversations (contact_id);
CREATE INDEX IF NOT EXISTS conversations_status_idx ON public.conversations (status);
CREATE INDEX IF NOT EXISTS conversations_instance_id_idx ON public.conversations (instance_id);
CREATE INDEX IF NOT EXISTS messages_chat_company_id_idx ON public.messages_chat (company_id);
CREATE INDEX IF NOT EXISTS messages_chat_conversation_id_idx ON public.messages_chat (conversation_id);
CREATE INDEX IF NOT EXISTS messages_chat_instance_id_idx ON public.messages_chat (instance_id);
CREATE INDEX IF NOT EXISTS messages_chat_sent_at_idx ON public.messages_chat (sent_at DESC);

-- Function and triggers to maintain updated_at fields
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_updated_at ON public.instance;
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.instance
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.contacts;
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.conversations;
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.messages_chat;
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.messages_chat
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Daily aggregation view for dashboard charts (replaces legacy table)
CREATE OR REPLACE VIEW public.crm_message_daily_metrics AS
SELECT
  company_id,
  (date_trunc('day', sent_at))::date AS message_date,
  COUNT(*)::bigint AS message_count
FROM public.messages_chat
GROUP BY company_id, (date_trunc('day', sent_at))::date;

-- Enable Row Level Security for omnichannel tables
ALTER TABLE public.instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_chat ENABLE ROW LEVEL SECURITY;

-- Instance policies scoped by company ownership
DROP POLICY IF EXISTS instance_select_own ON public.instance;
CREATE POLICY instance_select_own ON public.instance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = instance.company_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS instance_write_own ON public.instance;
CREATE POLICY instance_write_own ON public.instance
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = instance.company_id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = instance.company_id
        AND company.user_id = auth.uid()
    )
  );

-- Contacts policies
DROP POLICY IF EXISTS contacts_select_own ON public.contacts;
CREATE POLICY contacts_select_own ON public.contacts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = contacts.company_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS contacts_write_own ON public.contacts;
CREATE POLICY contacts_write_own ON public.contacts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = contacts.company_id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = contacts.company_id
        AND company.user_id = auth.uid()
    )
  );

-- Conversations policies
DROP POLICY IF EXISTS conversations_select_own ON public.conversations;
CREATE POLICY conversations_select_own ON public.conversations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = conversations.company_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS conversations_write_own ON public.conversations;
CREATE POLICY conversations_write_own ON public.conversations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = conversations.company_id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = conversations.company_id
        AND company.user_id = auth.uid()
    )
  );

-- Messages policies
DROP POLICY IF EXISTS messages_chat_select_own ON public.messages_chat;
CREATE POLICY messages_chat_select_own ON public.messages_chat
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = messages_chat.company_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS messages_chat_write_own ON public.messages_chat;
CREATE POLICY messages_chat_write_own ON public.messages_chat
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = messages_chat.company_id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = messages_chat.company_id
        AND company.user_id = auth.uid()
    )
  );
