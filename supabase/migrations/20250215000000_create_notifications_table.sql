-- Create notifications table
create table public.notifications (
  id uuid not null default gen_random_uuid(),
  company_id bigint not null,
  message text not null,
  type text not null,
  read_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  constraint notifications_pkey primary key (id),
  constraint notifications_company_id_fkey foreign key (company_id) references public.company (id) on delete cascade
);

create index notifications_company_id_idx on public.notifications(company_id);
create index notifications_read_at_idx on public.notifications(read_at);
