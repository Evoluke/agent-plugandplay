-- Enable and define RLS policies for pipeline, stage, and card tables

-- Pipeline policies
ALTER TABLE public.pipeline ENABLE ROW LEVEL SECURITY;

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
ALTER TABLE public.stage ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS stage_write_own ON public.stage;
CREATE POLICY stage_write_own ON public.stage
  FOR ALL
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

-- Card policies
ALTER TABLE public.card ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS card_select_own ON public.card;
CREATE POLICY card_select_own ON public.card
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.pipeline
      JOIN public.company ON company.id = pipeline.company_id
      WHERE pipeline.id = card.pipeline_id
        AND company.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS card_write_own ON public.card;
CREATE POLICY card_write_own ON public.card
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.pipeline
      JOIN public.company ON company.id = pipeline.company_id
      WHERE pipeline.id = card.pipeline_id
        AND company.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.pipeline
      JOIN public.company ON company.id = pipeline.company_id
      WHERE pipeline.id = card.pipeline_id
        AND company.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.stage
      JOIN public.pipeline p ON p.id = stage.pipeline_id
      JOIN public.company ON company.id = p.company_id
      WHERE stage.id = card.stage_id
        AND stage.pipeline_id = card.pipeline_id
        AND company.user_id = auth.uid()
    )
  );
