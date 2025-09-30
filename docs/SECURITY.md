# Segurança e RLS

## Uso do Service Role
As rotas que utilizam `supabaseadmin` executam operações privilegiadas. Antes de cada acesso é necessário validar explicitamente o usuário autenticado e a empresa associada. Avaliar a migração para chamadas com privilégios mínimos, utilizando RPCs ou o cliente autenticado com RLS sempre que possível, reduzindo a necessidade do Service Role.

Ao integrar com fluxos externos como o N8N, mantenha `N8N_WEBHOOK_URL`, `N8N_CRM_WEBHOOK_URL` e `N8N_WEBHOOK_TOKEN` configurados e valide o token enviado no header `Authorization`. Os webhooks continuam responsáveis pelos uploads da base de conhecimento e pelo provisionamento inicial do CRM, enquanto a criação de agentes ocorre integralmente na API interna sem repassar dados sensíveis ao N8N.

Rotas atuais que dependem do `supabaseadmin`:

- `/api/profile/complete`
- `/api/auth/signup`
  - Após chamar o Supabase, verifica se `identities` veio vazio para sinalizar e bloquear emails já cadastrados.
- `/api/support/new`
- `/api/payments/pay`
- `/api/payments/client`

Integrações externas, como os fluxos do N8N, seguem responsáveis por atualizar `company.subscription_expires_at` após a fase de teste. O backend agora cria a empresa já com 7 dias de acesso gratuito registrados nesse campo. Garanta que políticas de RLS impeçam que outras empresas consultem ou modifiquem esse dado compartilhado, pois ele representa a vigência da assinatura corporativa. O menu do agente deixou de consultar diretamente a tabela de pagamentos, reduzindo a exposição desse histórico no front-end.

## Tabelas críticas e políticas de RLS
As seguintes tabelas requerem políticas de Row Level Security para garantir o isolamento por empresa/usuário:

| Tabela | Política de acesso sugerida |
| --- | --- |
| `company` | Usuário só acessa a linha onde `user_id = auth.uid()`; o campo `subscription_expires_at` concentra o vencimento corporativo e deve permanecer restrito à empresa certa |
| `agents` | Acesso apenas para agentes cuja `company_id` pertence ao usuário; não há mais coluna de expiração individual |
| `agent_personality`, `agent_behavior`, `agent_onboarding`, `agent_specific_instructions`, `agent_knowledge_files` | Acesso restrito via relação com `agents.company_id` do usuário |
| `payments` | Acesso apenas para registros com `company_id` pertencente ao usuário; o front-end consulta a última cobrança corporativa paga com vencimento vigente para liberar a ativação dos agentes e nenhum `agent_id` é armazenado nessa tabela, portanto garanta que filtros por empresa estejam sempre ativos |
| `tickets` | Acesso apenas para registros com `company_id` pertencente ao usuário |
| `pipeline` | Leitura e escrita somente para linhas onde `company_id` referencia a empresa do usuário |
| `stage` | Filtrar por `pipeline.company_id` garantindo vínculo com a empresa autenticada e restringir atualizações do campo `color` a valores hexadecimais válidos enviados pelo próprio funil |
| `card` | Restrição por `pipeline.company_id`, incluindo validação extra ao mover cards entre estágios |

Certifique-se de que o RLS esteja habilitado e que as políticas correspondentes estejam configuradas no Supabase para cada tabela acima. Já existem políticas aplicadas diretamente no banco para `pipeline`, `stage` e `card`, garantindo que cada operação verifique o vínculo da empresa antes de inserir, atualizar, reordenar ou remover registros e assegurando que `stage_id` e `pipeline_id` permaneçam sincronizados durante movimentações.

Como a gestão de estágios agora acontece no mesmo modal de criação/edição do funil, o cliente web executa uma sequência de inserções, atualizações e remoções na tabela `stage` ao confirmar o formulário. Garanta que as políticas verifiquem tanto o `pipeline_id` informado quanto o vínculo com `company_id`, evitando que IDs arbitrários sejam enviados durante essas operações encadeadas, e considere validar o formato hex de `color` caso seja manipulado via RPC — o seletor nativo envia valores como `#E0F2FE`, `#FCE7F3` e `#FEF3C7`, utilizados automaticamente no funil padrão. O front-end desmonta os diálogos por completo assim que são fechados através do componente `Modal`, redefinindo formulários, restaurando o `overflow` do documento, limpando estados auxiliares e removendo a sobreposição na mesma renderização; aliado à migração do _drag and drop_ para `@hello-pangea/dnd`, isso eliminou o bloqueio de cliques observado anteriormente. Ainda assim, as políticas devem continuar validando cada transição. A componentização recém-adicionada assegura que cada diálogo seja carregado com estados limpos, porém não substitui as validações de RLS: valide `pipeline_id`, `stage_id` e a empresa em todas as requisições disparadas pelos componentes `PipelineDialog`, `CardDialog` e `Modal` — inclusive durante os reordenamentos enviados pela nova biblioteca de drag and drop e os movimentos para estágios que antes estavam vazios.
