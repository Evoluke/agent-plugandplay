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

Certifique-se de que o RLS esteja habilitado e que as políticas correspondentes estejam configuradas no Supabase para cada tabela acima.

## Considerações para o Chat Omnichannel/CRM

- **Tabelas do CRM**: garanta políticas de RLS para `public.instance`, `public.contacts`, `public.conversations` e `public.messages_chat`, além de quaisquer tabelas de anexos. Todas devem referenciar `company_id` para restringir acesso aos operadores da empresa. A _view_ `public.crm_message_daily_metrics` herda as políticas de `public.messages_chat` e pode ser exposta com segurança para relatórios. A tabela agregada legada `public.messages` permanece disponível para métricas históricas e deve seguir o mesmo padrão de isolamento se for atualizada.
- **Webhooks externos**: valide a assinatura ou token enviado pela Evolution API antes de aceitar o evento. Rejeite chamadas sem autenticação ou provenientes de IPs desconhecidos.
- **Supabase Realtime**: limite os canais de Realtime às empresas autorizadas, evitando que assinantes recebam eventos de outras contas.
- **Workers BullMQ**: armazene credenciais de provedores externos em variáveis de ambiente seguras e carregue-as apenas quando necessário. Registre falhas de entrega de mensagens com contexto suficiente para auditoria.
- **Armazenamento de mídia**: configure buckets do Supabase Storage com políticas restritivas, garantindo que downloads ocorram apenas com sessão válida e pertencente à empresa do arquivo.
