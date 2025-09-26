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

4. Sincronize o banco de dados do Supabase com as migrações do projeto:

   ```bash
   supabase migration up
   ```

   A migração `20250222000000_create_sales_pipeline_tables.sql` recria as políticas de RLS dos funis com comandos compatíveis com o PostgreSQL 15, garantindo que o ambiente local fique alinhado ao painel do Supabase.

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

## 📈 Funil de vendas

A partir da barra lateral do dashboard é possível acessar a nova página **Funil de vendas** e organizar oportunidades em um quadro Kanban responsivo. Crie diferentes funis por empresa, personalize os estágios e mova cartões entre colunas com _drag and drop_. Cada cartão aceita dados como cliente, valor estimado e observações, mantendo o histórico sincronizado com o Supabase para toda a equipe.

