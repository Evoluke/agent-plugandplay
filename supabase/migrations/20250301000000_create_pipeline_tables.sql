-- Create sales pipeline tables and enforce RLS policies

CREATE TABLE IF NOT EXISTS public.pipeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id bigint NOT NULL REFERENCES public.company (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL REFERENCES public.pipeline (id) ON DELETE CASCADE,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.card (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL REFERENCES public.pipeline (id) ON DELETE CASCADE,
  stage_id uuid NOT NULL REFERENCES public.stage (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NULL,
  value numeric(12, 2) NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card ENABLE ROW LEVEL SECURITY;

-- Pipeline policies
DROP POLICY IF EXISTS pipeline_select_own ON public.pipeline;
CREATE POLICY pipeline_select_own ON public.pipeline
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = pipeline.company_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS pipeline_insert_own ON public.pipeline;
CREATE POLICY pipeline_insert_own ON public.pipeline
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = pipeline.company_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS pipeline_update_own ON public.pipeline;
CREATE POLICY pipeline_update_own ON public.pipeline
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = pipeline.company_id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = pipeline.company_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS pipeline_delete_own ON public.pipeline;
CREATE POLICY pipeline_delete_own ON public.pipeline
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.company
      WHERE company.id = pipeline.company_id
        AND company.user_id = auth.uid()
    )
  );

-- Stage policies
DROP POLICY IF EXISTS stage_select_own ON public.stage;
CREATE POLICY stage_select_own ON public.stage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.pipeline
      JOIN public.company ON company.id = pipeline.company_id
      WHERE pipeline.id = stage.pipeline_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS stage_insert_own ON public.stage;
CREATE POLICY stage_insert_own ON public.stage
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.pipeline
      JOIN public.company ON company.id = pipeline.company_id
      WHERE pipeline.id = stage.pipeline_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS stage_update_own ON public.stage;
CREATE POLICY stage_update_own ON public.stage
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.pipeline
      JOIN public.company ON company.id = pipeline.company_id
      WHERE pipeline.id = stage.pipeline_id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.pipeline
      JOIN public.company ON company.id = pipeline.company_id
      WHERE pipeline.id = stage.pipeline_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS stage_delete_own ON public.stage;
CREATE POLICY stage_delete_own ON public.stage
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.pipeline
      JOIN public.company ON company.id = pipeline.company_id
      WHERE pipeline.id = stage.pipeline_id
        AND company.user_id = auth.uid()
    )
  );

-- Card policies
DROP POLICY IF EXISTS card_select_own ON public.card;
CREATE POLICY card_select_own ON public.card
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.stage
      JOIN public.pipeline ON pipeline.id = stage.pipeline_id
      JOIN public.company ON company.id = pipeline.company_id
      WHERE stage.id = card.stage_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS card_insert_own ON public.card;
CREATE POLICY card_insert_own ON public.card
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.stage
      JOIN public.pipeline ON pipeline.id = stage.pipeline_id
      JOIN public.company ON company.id = pipeline.company_id
      WHERE stage.id = card.stage_id
        AND pipeline.id = card.pipeline_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS card_update_own ON public.card;
CREATE POLICY card_update_own ON public.card
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.stage
      JOIN public.pipeline ON pipeline.id = stage.pipeline_id
      JOIN public.company ON company.id = pipeline.company_id
      WHERE stage.id = card.stage_id
        AND pipeline.id = card.pipeline_id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.stage
      JOIN public.pipeline ON pipeline.id = stage.pipeline_id
      JOIN public.company ON company.id = pipeline.company_id
      WHERE stage.id = card.stage_id
        AND pipeline.id = card.pipeline_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS card_delete_own ON public.card;
CREATE POLICY card_delete_own ON public.card
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.stage
      JOIN public.pipeline ON pipeline.id = stage.pipeline_id
      JOIN public.company ON company.id = pipeline.company_id
      WHERE stage.id = card.stage_id
        AND company.user_id = auth.uid()
    )
  );
