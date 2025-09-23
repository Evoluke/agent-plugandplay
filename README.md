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

   As integrações recém-adicionadas utilizam variáveis específicas:

   - `EVOLUTION_API_BASE_URL` e `EVOLUTION_API_TOKEN`: endpoints e credenciais do provedor Evolution.
   - `REDIS_URL` (ou `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`, `REDIS_DB`): configura o cache e as filas.

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

