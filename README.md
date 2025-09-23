# Agent Plug and Play

Este repositório contém uma aplicação [Next.js](https://nextjs.org/) preparada para integrar serviços como **N8N**, **Dify** e **Chatwoot**, oferecendo uma base para construir experiências de agentes prontos para uso.

## 🚀 Setup

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie o arquivo `.env.example` para `.env` e preencha as variáveis de ambiente necessárias:

   ```bash
   cp .env.example .env
   ```

   - `REDIS_URL` (ou `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`, `REDIS_DB`): configura o cache e as filas.
   Principais variáveis relacionadas às integrações externas:
   - `EVOLUTION_API_BASE_URL`: URL base da API Evolution responsável por orquestrar os agentes. Utilize o endpoint informado na sua conta Evolution ou no ambiente configurado pela equipe de infraestrutura.
   - `EVOLUTION_API_TOKEN`: token de acesso gerado no painel da Evolution (ou fornecido pelo time responsável) que autoriza as requisições autenticadas.
  - `REDIS_URL`: string de conexão completa para o Redis usado pelos serviços de fila/cache. Inclua nela usuário e senha quando o serviço exigir autenticação (por exemplo, `redis://default:<senha>@<host>:14216`, utilizando a porta 14216 do cluster padrão). Pode ser obtida no provedor de hospedagem (como Upstash, Redis Cloud) ou montada a partir do host, porta e credenciais do servidor interno.
  - `REDIS_USERNAME` e `REDIS_PASSWORD`: caso opte por configurar as credenciais separadamente, informe o usuário e a senha fornecidos pelo provedor (ou definidos na instância autogerenciada) para permitir que os clientes Redis executem a autenticação.

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse [http://localhost:3000](http://localhost:3000) para ver o resultado.

## 📦 Deploy

1. Gere o build de produção:

   ```bash
   npm run build
   ```

2. Faça o deploy na [Vercel](https://vercel.com/) (via CLI ou integração com Git). O processo padrão consiste em:
   - Configurar as variáveis de ambiente no painel da Vercel (incluindo `N8N_WEBHOOK_URL` e `N8N_WEBHOOK_TOKEN`, usadas pelo endpoint interno `/api/knowledge-base/upload`).
   - Realizar o push para o branch principal para disparar o deploy automático **ou** utilizar o comando `vercel --prod`.

> O fluxo do N8N deve validar o token enviado no header `Authorization` antes de aceitar o upload.

## 🔗 Links Úteis

- [Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [N8N](https://n8n.io/)
- [Dify](https://dify.ai/)
- [Chatwoot](https://www.chatwoot.com/)
- [Vercel](https://vercel.com/)

## 🧰 Utilitários de infraestrutura

- `src/lib/evolution.ts` expõe a factory `createEvolutionClient`, que instancia um wrapper autenticado para a API da Evolution e gera erros explícitos quando as variáveis `EVOLUTION_API_BASE_URL` ou `EVOLUTION_API_TOKEN` estão ausentes.
- `src/lib/redis.ts` concentra o cliente Redis com cache em memória única (singleton) e oferece helpers para enfileirar tarefas (`enqueue`, `dequeue`, `peekQueue`) e manipular chaves de cache (`setCache`, `getCache`, `deleteCache`).
- Utilize o helper de Redis para implementar filas e caches conforme necessário; por padrão, a rota `/api/support/new` continua persistindo os tickets apenas no Supabase.
- A rota `/api/notifications` continua consultando o Supabase diretamente para listar, criar e marcar notificações como lidas, sem camada de cache.
- `src/app/api/evolution/webhook/route.ts` recebe os eventos da Evolution API, valida a instância cadastrada, persiste conversas/mensagens no Supabase e atualiza fila e caches no Redis.

## 📥 Webhook da Evolution API

### Cadastro de instâncias

- Cadastre cada conexão da Evolution na tabela `evolution_instances`. O campo `external_id` deve receber o `instanceId` informado nos payloads do webhook e é único por instância.
- Armazene o segredo enviado pela Evolution em formato **hash SHA-256** no campo `api_key_hash`. É possível gerar o hash localmente executando `echo -n "SEU_API_KEY" | sha256sum` e copiando apenas a sequência hexadecimal gerada.
- Associe a instância a uma empresa (`company_id`) sempre que possível para que as políticas de RLS protejam o histórico de conversas. Os campos `webhook_url` e `server_url` são atualizados automaticamente a cada evento recebido, mas podem ser preenchidos manualmente durante a configuração inicial.

### Estrutura de dados

- `evolution_conversations` mantém um registro consolidado por `remote_jid` e instância, armazenando identificadores do Chatwoot, pré-visualização da última mensagem e o contexto criptográfico enviado pela Evolution.
- `evolution_messages` guarda cada evento recebido (texto, ack, mídias e outros tipos). O payload completo é preservado em `raw_payload` para auditoria e o campo `message_payload` concentra apenas o trecho de mensagem normalizado.
- Os campos `message_timestamp` e `event_datetime` são normalizados para `timestamptz`, aceitando valores em epoch (`messageTimestamp`) ou ISO string (`date_time`).

### Filas e cache

- Toda mensagem persistida é enfileirada em `evolution:incoming-messages` (Redis) com o objetivo de permitir processamento assíncrono por workers dedicados.
- As mensagens mais recentes ficam disponíveis no cache via chaves `evolution:message:<uuid>` e `evolution:message:<message_id>` por 1 hora. Conversas são cacheadas em `evolution:conversation:<conversation_uuid>` e `evolution:conversation:<instance_id>:<remote_jid>` por 2 horas.
- Em ambientes sem Redis configurado, as operações de fila/cache são ignoradas (o erro é logado), mas o webhook continua retornando `200` após salvar os dados no Supabase.

