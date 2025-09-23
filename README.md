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
   - `EVOLUTION_WEBHOOK_SECRET`: segredo compartilhado utilizado para validar as notificações recebidas em `/api/evolution/webhook`. O header `x-evolution-signature` deve trazer exatamente este valor ou, alternativamente, o payload pode informar o campo `apikey` com o mesmo conteúdo para compatibilidade com os webhooks da Evolution.
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
- A rota `/api/evolution/webhook` normaliza os eventos da Evolution conforme a documentação oficial (estrutura `data.key`, `data.message` etc.), salva contatos, conversas, mensagens e anexos nas tabelas `whatsapp_contacts`, `whatsapp_conversations`, `whatsapp_messages` e `whatsapp_message_media` e, quando houver mídias com URL, publica as referências na fila Redis `evolution:media:download` para workers tratarem o download.
- Sempre informe o header `x-company-id` quando o payload não trouxer o identificador da empresa, pois ele será utilizado como fallback na persistência dos registros.

### Webhook Evolution – exemplo de payload

O exemplo abaixo ilustra um webhook de mensagem seguindo a especificação atual da Evolution API. Ajuste os valores de `companyId`, `remoteJid`, `instanceId` e dos campos de mídia/texto conforme o cenário que deseja validar.

```bash
curl -X POST "http://localhost:3000/api/evolution/webhook" \
  -H "Content-Type: application/json" \
  -H "x-company-id: 123" \
  -H "x-evolution-signature: ${EVOLUTION_WEBHOOK_SECRET}" \
  -d '{
    "event": "messages.upsert",
    "date_time": "2025-09-22T22:58:59.977Z",
    "server_url": "https://evolutionapiplatform.tracelead.com.br",
    "apikey": "SEU_SEGREDO_AQUI",
    "data": {
      "instanceId": "2b14c103-46f3-4325-9cb5-1a8db90eb180",
      "status": "DELIVERY_ACK",
      "pushName": "Eduardo Schulz",
      "messageTimestamp": 1758592739,
      "key": {
        "remoteJid": "554796191875@s.whatsapp.net",
        "fromMe": false,
        "id": "AC3218A63672D8F858AB9DCE24DBE2DD"
      },
      "messageType": "conversation",
      "message": {
        "conversation": "Testeee"
      }
    }
  }'
```

Quando o evento carregar mídias (`imageMessage`, `videoMessage`, `documentMessage`, `audioMessage`, `stickerMessage`, `locationMessage`, `contactMessage` ou variantes), a rota captura os metadados, normaliza o tipo (`NormalizedMedia`) e enfileira o download no Redis para evitar bloquear o processamento do webhook.

