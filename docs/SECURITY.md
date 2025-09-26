# Segurança e RLS

## Uso do Service Role
As rotas que utilizam `supabaseadmin` executam operações privilegiadas. Antes de cada acesso é necessário validar explicitamente o usuário autenticado e a empresa associada. Avaliar a migração para chamadas com privilégios mínimos, utilizando RPCs ou o cliente autenticado com RLS sempre que possível, reduzindo a necessidade do Service Role.

Rotas atuais que dependem do `supabaseadmin`:

- `/api/profile/complete`
- `/api/auth/signup`
  - Após chamar o Supabase, verifica se `identities` veio vazio para sinalizar e bloquear emails já cadastrados.
- `/api/support/new`
- `/api/payments/pay`
- `/api/payments/client`

## Tabelas críticas e políticas de RLS
As seguintes tabelas requerem políticas de Row Level Security para garantir o isolamento por empresa/usuário:

| Tabela | Política de acesso sugerida |
| --- | --- |
| `company` | Usuário só acessa a linha onde `user_id = auth.uid()` |
| `agents` | Acesso apenas para agentes cuja `company_id` pertence ao usuário |
| `agent_personality`, `agent_behavior`, `agent_onboarding`, `agent_specific_instructions`, `agent_knowledge_files` | Acesso restrito via relação com `agents.company_id` do usuário |
| `payments` | Acesso apenas para registros com `company_id` pertencente ao usuário |
| `tickets` | Acesso apenas para registros com `company_id` pertencente ao usuário |
| `pipeline`, `stage`, `card` | Assegurar que o usuário só visualize e manipule dados vinculados à sua empresa via `company_id` e `pipeline_id` |

Certifique-se de que o RLS esteja habilitado e que as políticas correspondentes estejam configuradas no Supabase para cada tabela acima.
