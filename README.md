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

