alter table public.company
  add column if not exists subscription_expires_at timestamp with time zone;

update public.company as c
set subscription_expires_at = sub.expires_at
from (
  select company_id, max(expiration_date) as expires_at
  from public.agents
  where expiration_date is not null
  group by company_id
) as sub
where c.id = sub.company_id
  and (
    c.subscription_expires_at is null
    or sub.expires_at > c.subscription_expires_at
  );

alter table public.agents
  drop column if exists expiration_date;
