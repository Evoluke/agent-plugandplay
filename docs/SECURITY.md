# Segurança e RLS

## Uso do Service Role
As rotas que utilizam `supabaseadmin` executam operações privilegiadas. Antes de cada acesso é necessário validar explicitamente o usuário autenticado e a empresa associada. Avaliar a migração para chamadas com privilégios mínimos, utilizando RPCs ou o cliente autenticado com RLS sempre que possível, reduzindo a necessidade do Service Role.

Rotas atuais que dependem do `supabaseadmin`:

- `/api/profile/complete`
- `/api/auth/signup`
  - Após chamar o Supabase, verifica se `identities` veio vazio para sinalizar e bloquear emails já cadastrados.
- `/api/support/new`
- `/api/notifications`
- `/api/payments/pay`
- `/api/payments/client`

## Filas e cache

- O cliente Redis (`src/lib/redis.ts`) exige `REDIS_URL` ou `REDIS_HOST/PORT`. Garanta que o endpoint esteja protegido por ACLs ou redes privadas, especialmente em ambientes compartilhados.
- Ao introduzir filas (por exemplo, `support:tickets`), restrinja o acesso ao Redis para escrituras originadas apenas do backend e considere autenticação mútua (TLS + senha).
- As notificações continuam sendo servidas diretamente do Supabase; garanta que as políticas de RLS cubram leitura, criação e atualização para evitar vazamento entre empresas.

## Tabelas críticas e políticas de RLS
As seguintes tabelas requerem políticas de Row Level Security para garantir o isolamento por empresa/usuário:

| Tabela | Política de acesso sugerida |
| --- | --- |
| `company` | Usuário só acessa a linha onde `user_id = auth.uid()` |
| `agents` | Acesso apenas para agentes cuja `company_id` pertence ao usuário |
| `agent_personality`, `agent_behavior`, `agent_onboarding`, `agent_specific_instructions`, `agent_knowledge_files` | Acesso restrito via relação com `agents.company_id` do usuário |
| `payments` | Acesso apenas para registros com `company_id` pertencente ao usuário |
| `tickets` | Acesso apenas para registros com `company_id` pertencente ao usuário |

Certifique-se de que o RLS esteja habilitado e que as políticas correspondentes estejam configuradas no Supabase para cada tabela acima.
