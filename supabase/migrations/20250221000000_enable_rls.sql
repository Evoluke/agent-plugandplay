-- Enable RLS and define policies for customer-facing tables

-- Company table policies
ALTER TABLE public.company ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS company_select_own ON public.company;
CREATE POLICY company_select_own ON public.company
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS company_insert_own ON public.company;
CREATE POLICY company_insert_own ON public.company
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS company_update_own ON public.company;
CREATE POLICY company_update_own ON public.company
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS company_delete_own ON public.company;
CREATE POLICY company_delete_own ON public.company
  FOR DELETE
  USING (user_id = auth.uid());

-- Company profile policies
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS company_profile_select_own ON public.company_profile;
CREATE POLICY company_profile_select_own ON public.company_profile
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.company_profile_id = company_profile.id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS company_profile_update_own ON public.company_profile;
CREATE POLICY company_profile_update_own ON public.company_profile
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.company_profile_id = company_profile.id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.company_profile_id = company_profile.id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS company_profile_delete_own ON public.company_profile;
CREATE POLICY company_profile_delete_own ON public.company_profile
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.company_profile_id = company_profile.id
        AND company.user_id = auth.uid()
    )
  );

-- Agents table policies
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agents_select_own ON public.agents;
CREATE POLICY agents_select_own ON public.agents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = agents.company_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS agents_insert_own ON public.agents;
CREATE POLICY agents_insert_own ON public.agents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = agents.company_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS agents_update_own ON public.agents;
CREATE POLICY agents_update_own ON public.agents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = agents.company_id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = agents.company_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS agents_delete_own ON public.agents;
CREATE POLICY agents_delete_own ON public.agents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = agents.company_id
        AND company.user_id = auth.uid()
    )
  );

-- Child tables of agents
ALTER TABLE public.agent_personality ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_personality_select_own ON public.agent_personality;
CREATE POLICY agent_personality_select_own ON public.agent_personality
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.agents
      JOIN public.company ON company.id = agents.company_id
      WHERE agents.id = agent_personality.agent_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS agent_personality_write_own ON public.agent_personality;
CREATE POLICY agent_personality_write_own ON public.agent_personality
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.agents
      JOIN public.company ON company.id = agents.company_id
      WHERE agents.id = agent_personality.agent_id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.agents
      JOIN public.company ON company.id = agents.company_id
      WHERE agents.id = agent_personality.agent_id
        AND company.user_id = auth.uid()
    )
  );

ALTER TABLE public.agent_behavior ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_behavior_select_own ON public.agent_behavior;
CREATE POLICY agent_behavior_select_own ON public.agent_behavior
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.agents
      JOIN public.company ON company.id = agents.company_id
      WHERE agents.id = agent_behavior.agent_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS agent_behavior_write_own ON public.agent_behavior;
CREATE POLICY agent_behavior_write_own ON public.agent_behavior
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.agents
      JOIN public.company ON company.id = agents.company_id
      WHERE agents.id = agent_behavior.agent_id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.agents
      JOIN public.company ON company.id = agents.company_id
      WHERE agents.id = agent_behavior.agent_id
        AND company.user_id = auth.uid()
    )
  );

ALTER TABLE public.agent_onboarding ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_onboarding_select_own ON public.agent_onboarding;
CREATE POLICY agent_onboarding_select_own ON public.agent_onboarding
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.agents
      JOIN public.company ON company.id = agents.company_id
      WHERE agents.id = agent_onboarding.agent_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS agent_onboarding_write_own ON public.agent_onboarding;
CREATE POLICY agent_onboarding_write_own ON public.agent_onboarding
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.agents
      JOIN public.company ON company.id = agents.company_id
      WHERE agents.id = agent_onboarding.agent_id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.agents
      JOIN public.company ON company.id = agents.company_id
      WHERE agents.id = agent_onboarding.agent_id
        AND company.user_id = auth.uid()
    )
  );

ALTER TABLE public.agent_specific_instructions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_specific_instructions_select_own ON public.agent_specific_instructions;
CREATE POLICY agent_specific_instructions_select_own ON public.agent_specific_instructions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.agents
      JOIN public.company ON company.id = agents.company_id
      WHERE agents.id = agent_specific_instructions.agent_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS agent_specific_instructions_write_own ON public.agent_specific_instructions;
CREATE POLICY agent_specific_instructions_write_own ON public.agent_specific_instructions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.agents
      JOIN public.company ON company.id = agents.company_id
      WHERE agents.id = agent_specific_instructions.agent_id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.agents
      JOIN public.company ON company.id = agents.company_id
      WHERE agents.id = agent_specific_instructions.agent_id
        AND company.user_id = auth.uid()
    )
  );

ALTER TABLE public.agent_google_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_google_tokens_select_own ON public.agent_google_tokens;
CREATE POLICY agent_google_tokens_select_own ON public.agent_google_tokens
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.agents
      JOIN public.company ON company.id = agents.company_id
      WHERE agents.id = agent_google_tokens.agent_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS agent_google_tokens_write_own ON public.agent_google_tokens;
CREATE POLICY agent_google_tokens_write_own ON public.agent_google_tokens
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.agents
      JOIN public.company ON company.id = agents.company_id
      WHERE agents.id = agent_google_tokens.agent_id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.agents
      JOIN public.company ON company.id = agents.company_id
      WHERE agents.id = agent_google_tokens.agent_id
        AND company.user_id = auth.uid()
    )
  );

-- Tables linked by company_id
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS messages_select_own ON public.messages;
CREATE POLICY messages_select_own ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = messages.company_id
        AND company.user_id = auth.uid()
    )
  );

ALTER TABLE public.agent_knowledge_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_knowledge_files_select_own ON public.agent_knowledge_files;
CREATE POLICY agent_knowledge_files_select_own ON public.agent_knowledge_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = agent_knowledge_files.company_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS agent_knowledge_files_write_own ON public.agent_knowledge_files;
CREATE POLICY agent_knowledge_files_write_own ON public.agent_knowledge_files
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = agent_knowledge_files.company_id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = agent_knowledge_files.company_id
        AND company.user_id = auth.uid()
    )
  );

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notifications_select_own ON public.notifications;
CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = notifications.company_id
        AND company.user_id = auth.uid()
    )
  );

-- Dashboard alerts visible to all authenticated users
ALTER TABLE public.dashboard_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dashboard_alerts_authenticated_select ON public.dashboard_alerts;
CREATE POLICY dashboard_alerts_authenticated_select ON public.dashboard_alerts
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Documents policies for knowledge base cleanup
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS documents_delete_own ON public.documents;
CREATE POLICY documents_delete_own ON public.documents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.agents
      JOIN public.company ON company.id = agents.company_id
      WHERE agents.id::text = documents.metadata ->> 'agent_id'
        AND company.user_id = auth.uid()
        AND company.id::text = documents.metadata ->> 'company_id'
    )
    AND EXISTS (
      SELECT 1
      FROM public.agent_knowledge_files
      WHERE agent_knowledge_files.id::text = documents.metadata ->> 'path_id'
        AND agent_knowledge_files.agent_id::text = documents.metadata ->> 'agent_id'
        AND agent_knowledge_files.company_id::text = documents.metadata ->> 'company_id'
    )
  );
