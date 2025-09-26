create table public.stage_color (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  stage_id uuid not null,
  background_color text not null,
  constraint stage_color_pkey primary key (id),
  constraint stage_color_stage_id_key unique (stage_id),
  constraint stage_color_stage_id_fkey foreign key (stage_id) references public.stage (id) on delete cascade,
  constraint stage_color_background_color_check check (char_length(background_color) > 0)
);

comment on table public.stage_color is 'Vincula um estágio do funil à cor de fundo utilizada na interface.';
comment on column public.stage_color.background_color is 'Valor de cor (por exemplo, hexadecimal) aplicado como fundo da coluna do estágio.';
