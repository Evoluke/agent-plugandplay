create type public.qualification_transfer_rule as enum ('never', 'filled_collection_questions', 'personalized');
alter table public.agent_behavior
  add column qualification_transfer_rule public.qualification_transfer_rule not null default 'never'::qualification_transfer_rule;
alter table public.agent_behavior
  add column qualification_transfer_conditions text not null default '';
