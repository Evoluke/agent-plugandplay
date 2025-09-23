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

## 🧠 Chat Omnichannel/CRM

O módulo de CRM omnichannel opera sobre uma arquitetura dedicada que combina Next.js com serviços gerenciados para entregar atendimento em múltiplos canais. Os principais componentes são:

- **Frontend e BFF**: implementados em Next.js (App Router), reutilizando rotas `/api` tanto para webhooks quanto para endpoints internos que atendem o painel administrativo.
- **Banco de dados principal**: Supabase (Postgres) com autenticação, RLS, Storage e Realtime habilitados para armazenar conversas, mensagens e anexos de forma segura.
- **Tempo real**: Supabase Realtime via WebSocket, assinando as tabelas `messages_chat` e `conversations` para atualizar o painel instantaneamente.
- **Fila e processamento assíncrono**: Redis + BullMQ, orquestrando workers independentes responsáveis por sincronizar mensagens, enviar notificações e lidar com tarefas demoradas.
- **Integração externa**: Evolution API como provedor oficial de WhatsApp, responsável por entrega e recebimento de mensagens desse canal.

### Componentes e responsabilidades

- **Next.js (Web/App)**: renderiza a UI do painel (lista de conversas, mensagens), publica webhooks rápidos em `/api/webhook` e encaminha chamadas internas para `/api/messages`.
- **Supabase**: centraliza contatos, conversas, mensagens, anexos, histórico de status e eventos de webhook no Postgres, garantindo isolamento por tenant com RLS e suporte a Storage/Realtime. As mensagens são persistidas na tabela `public.messages_chat`, enquanto a tabela agregada legada `public.messages` continua abastecendo relatórios diários.
- **Redis + BullMQ**: mantém as filas `incoming_message` (processamento de webhooks) e `send_message` (envio para Evolution), controlando _retries_, _backoff_, DLQ e concorrência.
- **Workers Node.js**: executam fora do Next.js, tratam normalização e idempotência, fazem _upsert_ no Supabase e gerenciam _download_ de mídia quando necessário.

Consulte a [documentação completa do CRM](docs/crm.md) para detalhes de fluxo, requisitos de segurança e integrações planejadas.

## 🔗 Links Úteis

- [Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [N8N](https://n8n.io/)
- [Dify](https://dify.ai/)
- [Chatwoot](https://www.chatwoot.com/)
- [Vercel](https://vercel.com/)

