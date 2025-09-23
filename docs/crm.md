# CRM e Fluxos Operacionais

## Provisionamento
- A rota `/api/crm/create` continua responsável por acionar o webhook do N8N.
- Garanta que `N8N_CRM_WEBHOOK_URL` e `N8N_WEBHOOK_TOKEN` estejam configurados antes de testar o fluxo.

## Mensageria Evolution
- Utilize `createEvolutionClient` (`src/lib/evolution.ts`) para interagir com a API da Evolution ao sincronizar contatos ou conversas.
- O helper valida as variáveis `EVOLUTION_API_BASE_URL` e `EVOLUTION_API_TOKEN`, emitindo erro explícito quando estiverem ausentes.

## Filas de atendimento
- O utilitário Redis (`src/lib/redis.ts`) expõe operações de fila (`enqueue`, `dequeue`, `peekQueue`) para orquestrar atendimentos assíncronos quando necessário.
- Atualmente, os tickets criados em `/api/support/new` são persistidos diretamente no Supabase; ao ativar filas, registre o fluxo e garanta consumidores autenticados.
