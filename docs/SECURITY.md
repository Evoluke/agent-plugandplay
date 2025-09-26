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
| `pipeline` | Leitura e escrita somente para linhas onde `company_id` referencia a empresa do usuário |
| `stage` | Filtrar por `pipeline.company_id` garantindo vínculo com a empresa autenticada |
| `card` | Restrição por `pipeline.company_id`, incluindo validação extra ao mover cards entre estágios |

Certifique-se de que o RLS esteja habilitado e que as políticas correspondentes estejam configuradas no Supabase para cada tabela acima.

Como a gestão de estágios agora acontece no mesmo modal de criação/edição do funil, o cliente web executa uma sequência de inserções, atualizações e remoções na tabela `stage` ao confirmar o formulário. Garanta que as políticas verifiquem tanto o `pipeline_id` informado quanto o vínculo com `company_id`, evitando que IDs arbitrários sejam enviados durante essas operações encadeadas. Ao fechar o modal de oportunidades o front-end limpa o formulário e redefine o `stage_id` ativo, mitigando o reaproveitamento indevido de dados, mas as políticas devem continuar validando cada transição.
