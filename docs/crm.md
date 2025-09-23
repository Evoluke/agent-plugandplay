# Visão Geral do Chat Omnichannel/CRM

## Objetivo
Estabelecer uma base única para atendimento omnichannel que consolide contatos, conversas e automações de CRM na plataforma. O módulo deve permitir operação multicanal com governança, segurança e escalabilidade desde o primeiro release.

## Arquitetura Principal

### Componentes e Responsabilidades
- **Next.js (Web/App)**: renderiza o painel (lista de conversas, mensagens) e expõe rotas `/api/messages` para envio. Endpoints de webhook, como `/api/webhook`, respondem rapidamente ao Evolution e publicam eventos nas filas.
- **Supabase**: concentra contatos, conversas, mensagens, anexos, histórico de status e eventos de webhook; aplica RLS por tenant/usuário, fornece Storage opcional para mídia e Realtime para _push_ de mudanças.
- **Redis + BullMQ**: opera filas `incoming_message` (processamento de webhooks recebidos) e `send_message` (entregas para Evolution), controlando _retries_, _backoff_, DLQ e concorrência — incluindo a opção de _keyed concurrency_.
- **Workers (Node)**: rodam isolados do Next.js, cuidam de normalização, idempotência, _upsert_ no Supabase, _download_ de mídia e integração com provedores externos.

### Frontend e BFF
- Aplicação Next.js utilizando App Router, garantindo UI reativa e server components quando necessário.
- Rotas em `/api` usadas como camada BFF para o painel do CRM, webhooks de entrada (com resposta imediata e enfileiramento) e integrações internas.
- Gestão de sessões pelo Supabase Auth, propagada para o BFF via middleware.

### Banco de Dados
- Supabase (Postgres) como fonte de dados primária, com RLS habilitado para isolar empresas e operadores.
- Uso de Storage para anexos de mídia compartilhados nas conversas.
- Versionamento de esquemas realizado por migrações SQL armazenadas no repositório.

#### Esquema de Dados do CRM
- `public.instance`: representa as instâncias configuradas para cada empresa junto à Evolution API ou demais provedores. Armazena
  identificadores externos, segredos de webhook, status de sincronização e parâmetros específicos em `settings`.
- `public.contacts`: mantém contatos unificados por empresa, incluindo dados de perfil, idioma, _tags_, bloqueios e o relacionam
  ento opcional com a instância responsável por sincronizar o registro.
- `public.conversations`: agrega as interações por canal, vinculando contato, instância, responsáveis humanos (`assigned_user_id`)
  ou agentes virtuais (`assigned_agent_id`), além de metadados sobre SLA, prioridade e carimbos de data.
- `public.messages_chat`: guarda o histórico completo de mensagens com direção (`inbound`/`outbound`), tipo de conteúdo, status de entrega,
  _payload_ bruto e vínculos opcionais ao usuário/autômato que originou o evento.
- `public.messages`: tabela agregada legada com contagem diária por empresa, preservada para relatórios e integrações existentes.
- `public.crm_message_daily_metrics`: _view_ derivada para alimentar o dashboard, calculando volume diário de mensagens por empresa com base
  em `messages_chat.sent_at`.

Os campos `updated_at` são atualizados automaticamente via _trigger_. Todos os registros carregam `company_id`, permitindo aplic
ar políticas de RLS que restringem o acesso a operadores da empresa proprietária.

### Comunicação em Tempo Real
- Supabase Realtime com WebSockets assinando as tabelas `messages_chat` e `conversations`.
- Atualizações de status de atendimento e indicadores de digitação propagados instantaneamente para operadores conectados.
- Estratégia de reconexão automática no frontend para manter o canal ativo.

### Processamento Assíncrono
- Redis dedicado a filas BullMQ.
- Filas nomeadas `incoming_message` e `send_message`, configuradas com _retries_, _backoff_ exponencial, concorrência controlada e fila de _dead-letter_.
- Workers independentes responsáveis por sincronizar mensagens com provedores externos, disparar notificações e executar fluxos de pós-atendimento, incluindo cenários de _keyed concurrency_ quando necessário.

### Integração com Provedores
- Evolution API como provedor oficial de WhatsApp, responsável por envio e recebimento de mensagens nesse canal.
- Webhooks autenticados para receber eventos de mensagens, status de entrega e atualizações de contatos.
- Pipeline de normalização garantindo que payloads externos sejam convertidos para o modelo interno antes do armazenamento.

### Configuração de Variáveis de Ambiente
- `REDIS_USERNAME`, `REDIS_PASSWORD`, `REDIS_HOST` e `REDIS_PORT`: habilitam o acesso ao cluster Redis responsável pelas filas `incoming_message` e `send_message`.
- `EVOLUTION_API_URL` e `EVOLUTION_API_TOKEN`: identificam e autenticam o tenant na Evolution API para envio e recebimento de mensagens. A instância ativa é determinada pelos webhooks recebidos e registrada na tabela `instance` do Supabase.

## Fluxo Resumido de Mensagens
1. Evolution API envia webhook para `/api/webhook` (ou rota equivalente por canal) que responde rapidamente e confirma recebimento.
2. BFF valida o evento, persiste os dados no Supabase e publica tarefas BullMQ quando necessário, garantindo idempotência.
3. Workers processam tarefas e disparam eventos adicionais (ex.: atualizações de status, respostas automáticas ou notificações por email).
4. Operadores conectados via interface Next.js recebem atualizações em tempo real através do Supabase Realtime.

## Monitoramento e Observabilidade
- Logs centralizados para BFF e workers, preferencialmente com correlação via `conversation_id`.
- Métricas de fila (tempo médio de processamento, mensagens em espera, erros) exportadas para dashboard dedicado.
- Alertas para quedas de conexão com Evolution API, Redis ou Supabase.

## Próximos Passos
- Mapear entidades auxiliares (participantes adicionais, anexos e etiquetas avançadas) complementando o esquema principal.
- Documentar processos de suporte para reprocessar mensagens em _dead-letter queue_.
- Adicionar guias de onboarding para operadores e administradores do CRM.
