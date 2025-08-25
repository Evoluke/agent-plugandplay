create type public.qualification_transfer_rule as enum ('never', 'user_request', 'lead_interested');
alter table public.agent_behavior
  add column qualification_transfer_rule public.qualification_transfer_rule not null default 'never'::qualification_transfer_rule;
