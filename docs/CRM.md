# Guia do CRM

Este documento apresenta os pilares funcionais e técnicos do CRM responsável por centralizar o atendimento via WhatsApp e o gerenciamento de contatos.

## Objetivos do produto
- Oferecer um painel único, construído em Next.js, para operadores e administradores acompanharem conversas e cadastros.
- Permitir o envio e recebimento de mensagens do WhatsApp através da Evolution API, mantendo histórico sincronizado.
- Facilitar o cadastro, a segmentação e o enriquecimento de contatos em uma base única hospedada no Supabase.
- Utilizar Redis como camada de fila e cache para garantir processamento assíncrono e respostas rápidas.

## Principais funcionalidades
### Hub de mensagens WhatsApp
- Conexão com a Evolution API para enviar e receber mensagens em tempo real.
- Webhooks dedicados no backend Next.js para receber eventos de mensagens, status de entrega e atualizações de sessão.
- Normalização do payload recebido antes de persistir no Supabase.
- Retentativa automática de envio utilizando filas Redis em caso de falhas temporárias.

### Gestão de contatos
- Cadastro manual e importação em massa (CSV ou integrações externas) com deduplicação por número de telefone.
- Enriquecimento de dados com campos personalizados (etiquetas, origem, estágio do funil).
- Histórico completo de interações vinculado a cada contato, sincronizado com as conversas recebidas da Evolution API.
- Ferramentas de busca, filtros e segmentação para campanhas direcionadas.

### Automação e tarefas assíncronas
- Filas Redis para orquestrar tarefas de alto volume, como disparos em massa, atualizações de status e sincronização de mídias.
- Cache Redis para armazenar sessões de conexão com a Evolution API, tokens temporários e dados de configuração frequentemente acessados.
- Supervisão de workers com métricas de throughput e mecanismos de retry exponencial.

### Painel operacional
- Interface responsiva desenvolvida em Next.js com componentes reutilizáveis.
- Visão unificada de conversas, contatos e tarefas pendentes.
- Controle de permissões integrado ao Supabase Auth, respeitando níveis de acesso (operador, supervisor, administrador).
- Relatórios básicos de atendimento (tempo médio de resposta, volume por agente, conversas finalizadas).

## Arquitetura técnica
| Camada | Responsabilidade | Tecnologia |
| --- | --- | --- |
| Interface web | SPA/SSR para operadores e administradores | Next.js |
| Backend de API | Rotas de mensagens, contatos e webhooks | Next.js (App Router) |
| Banco de dados | Persistência de contatos, conversas e configurações | Supabase (Postgres + Auth) |
| Integração WhatsApp | Envio/recebimento de mensagens e eventos | Evolution API |
| Processamento assíncrono | Filas de tarefas, cache de sessões e throttling | Redis |

### Helpers de integração
- `src/lib/evolution.ts`: fábrica que lê `EVOLUTION_API_BASE_URL` e `EVOLUTION_API_TOKEN`, expondo métodos autenticados (`request`, `post`, `json`) para conversar com a Evolution API.
- `src/lib/redis.ts`: inicializa um cliente singleton do Redis a partir de `REDIS_URL` ou `REDIS_HOST`, disponibilizando operações básicas (`enqueue`, `dequeue`, `cacheSetJson`, `cacheDelete`) usadas por notificações, filas e futuras rotinas de mensagens.

## Fluxos críticos
1. **Recebimento de mensagem**
   - Evolution API aciona webhook.
   - Backend valida assinatura, normaliza payload e envia tarefa à fila Redis.
   - Worker processa, atualiza o histórico no Supabase e emite notificação ao cliente Next.js via canal em tempo real.

2. **Envio de mensagem**
   - Operador envia mensagem pelo painel.
   - Backend registra a intenção no Supabase e delega o envio ao worker via Redis.
   - Worker chama a Evolution API, registra status (enviado, entregue, erro) e trata retentativas.

3. **Cadastro de contato**
   - Operador informa dados no painel ou faz upload CSV.
   - Backend valida campos, deduplica por telefone e salva no Supabase.
   - Trigger opcional para associar o contato a segmentos ou campanhas.

## Boas práticas e próximas etapas
- Definir políticas de RLS no Supabase para isolar dados por empresa/operador.
- Configurar monitoramento de filas Redis (latência, tamanho) e alertas para falhas de workers.
- Documentar webhooks esperados da Evolution API (endereços, payloads, autenticação) e rotinas de fallback.
- Planejar testes end-to-end simulando conversas completas para garantir consistência entre mensagens, contatos e histórico.

