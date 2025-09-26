-- Remove o vínculo de pagamentos com agentes individuais
alter table public.payments
  drop constraint if exists payments_agent_id_fkey;

alter table public.payments
  drop column if exists agent_id;
