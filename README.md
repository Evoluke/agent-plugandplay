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

## 🔗 Links Úteis

- [Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [N8N](https://n8n.io/)
- [Dify](https://dify.ai/)
- [Chatwoot](https://www.chatwoot.com/)
- [Vercel](https://vercel.com/)

## 📊 Funil de vendas

A área **Funil de vendas** no dashboard permite organizar oportunidades em um board Kanban inspirado na interface do CRM. Para habilitar o recurso:

- Acesse *Dashboard → Funil de vendas* na barra lateral.
- Crie diferentes funis e gerencie etapas com cores e probabilidade de conversão.
- Cadastre oportunidades com valores, responsáveis e notas, arrastando cards entre colunas usando @hello-pangea/dnd.
- Utilize os filtros por responsável, status ou busca para focar no que importa; a reorganização por arrastar fica disponível quando não há filtros ativos.
- Execute as migrações do Supabase para criar as tabelas `pipeline`, `stage` e `card`, responsáveis por armazenar funis, etapas e cards do quadro.

As operações de criação, edição, exclusão e movimentação respeitam as políticas de segurança por empresa definidas nas novas migrações SQL.
