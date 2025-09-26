-- Add background color to pipeline stages
alter table public.stage
  add column if not exists color text not null default '#F8FAFC';

comment on column public.stage.color is 'Hexadecimal color applied as background to the pipeline stage column.';
