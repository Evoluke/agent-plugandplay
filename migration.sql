-- Crie a tabela de pagamentos no Supabase
create table payments (
  id          uuid        primary key default gen_random_uuid(),
  referencia  text        not null,
  due_date    date        not null,
  amount      numeric(10,2) not null,
  usage       numeric(10,2) not null,
  status      text        not null default 'pendente' check (status in ('pendente','quitado')),
  inserted_at timestamp    default now(),
  updated_at  timestamp    default now()
);