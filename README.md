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
   - `EVOLUTION_WEBHOOK_TOKEN`: segredo validado pela rota `/api/webhooks/evolution`, enviado pelos servidores da Evolution no header `x-evolution-token` (ou `x-webhook-token`).
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

## 📬 Webhook da Evolution API

- O endpoint `POST /api/webhooks/evolution` (e suas variações por evento, como `/api/webhooks/evolution/messages-upsert`) recebe notificações da Evolution API.
- A requisição deve enviar o header `x-evolution-token` (ou `x-webhook-token`) com o mesmo valor armazenado na tabela `evolution_instances.webhook_token` ou na variável `EVOLUTION_WEBHOOK_TOKEN`.
- Cada payload de mensagem gera registros nas tabelas `whatsapp_conversations` e `whatsapp_messages`, permitindo rastrear histórico por empresa/instância.
- O processamento publica eventos Redis nas filas `evolution:messages:incoming` e `evolution:messages:status`, enquanto os caches `evolution:conversation:last:<conversationId>` e `evolution:message:<messageId>` armazenam o último estado consultado por 5 minutos.
- Para habilitar o webhook, crie previamente uma linha em `evolution_instances` associada à empresa e ao identificador da instância configurada na Evolution.

