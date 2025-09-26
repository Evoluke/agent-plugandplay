-- Create pipeline, stage, and card tables for sales funnel management

CREATE TABLE IF NOT EXISTS public.pipeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL REFERENCES public.pipeline(id) ON DELETE CASCADE,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#2F6F68',
  probability numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.card (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid NOT NULL REFERENCES public.stage(id) ON DELETE CASCADE,
  title text NOT NULL,
  company_name text,
  owner text,
  status text,
  priority text,
  amount numeric,
  mrr numeric,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stage_pipeline_idx ON public.stage(pipeline_id);
CREATE INDEX IF NOT EXISTS card_stage_idx ON public.card(stage_id);
CREATE INDEX IF NOT EXISTS card_sort_idx ON public.card(stage_id, sort_order);

-- Trigger to keep stage.updated_at in sync
CREATE OR REPLACE FUNCTION public.set_stage_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stage_set_updated_at ON public.stage;
CREATE TRIGGER stage_set_updated_at
BEFORE UPDATE ON public.stage
FOR EACH ROW
EXECUTE FUNCTION public.set_stage_updated_at();

-- Trigger to keep card.updated_at in sync
CREATE OR REPLACE FUNCTION public.set_card_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS card_set_updated_at ON public.card;
CREATE TRIGGER card_set_updated_at
BEFORE UPDATE ON public.card
FOR EACH ROW
EXECUTE FUNCTION public.set_card_updated_at();

-- Enable RLS and define policies scoped to the owning company
ALTER TABLE public.pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS stage_select_own ON public.stage;
CREATE POLICY stage_select_own ON public.stage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.pipeline
      JOIN public.company ON company.id = pipeline.company_id
      WHERE stage.pipeline_id = pipeline.id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS stage_write_own ON public.stage;
CREATE POLICY stage_write_own ON public.stage
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.pipeline
      JOIN public.company ON company.id = pipeline.company_id
      WHERE stage.pipeline_id = pipeline.id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.pipeline
      JOIN public.company ON company.id = pipeline.company_id
      WHERE stage.pipeline_id = pipeline.id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS card_select_own ON public.card;
CREATE POLICY card_select_own ON public.card
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.stage
      JOIN public.pipeline ON pipeline.id = stage.pipeline_id
      JOIN public.company ON company.id = pipeline.company_id
      WHERE card.stage_id = stage.id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS card_write_own ON public.card;
CREATE POLICY card_write_own ON public.card
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.stage
      JOIN public.pipeline ON pipeline.id = stage.pipeline_id
      JOIN public.company ON company.id = pipeline.company_id
      WHERE card.stage_id = stage.id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.stage
      JOIN public.pipeline ON pipeline.id = stage.pipeline_id
      JOIN public.company ON company.id = pipeline.company_id
      WHERE card.stage_id = stage.id
        AND company.user_id = auth.uid()
    )
  );

