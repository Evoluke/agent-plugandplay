# Currículo IA Pro

Aplicação **Next.js (App Router)** com **TypeScript**, **Supabase**, **OpenAI**, **Asaas** e **Google AdSense** para gerar currículos profissionais com inteligência artificial. O fluxo contempla versão freemium e premium, editor com blocos reordenáveis, exportação em PDF/DOCX e blog otimizado para SEO.

## ✨ Principais recursos

- Assistente multi-etapas coleta dados pessoais, experiências, formações, skills, certificações e idiomas com salvamento automático no Supabase.
- API `/api/resume/generate` integra com OpenAI (GPT-4o mini para free, GPT-4.1 para premium) gerando resumo, bullets com resultados, otimização ATS, versão em inglês e carta de apresentação.
- Editor modular com drag-and-drop, reescrita de bullets, tradução e carta de apresentação para assinantes premium.
- Exportação segura em PDF e DOCX (premium remove marca d’água e libera múltiplos layouts).
- Monetização híbrida com Google AdSense e cobrança recorrente via Asaas.
- Páginas estáticas e blog com Schema.org para fortalecer SEO orgânico.

## 🚀 Como rodar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo `.env.local` com as variáveis mínimas:

   ```bash
   cp .env.example .env.local
   ```

   Complete os valores:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE`
   - `OPENAI_API_KEY`
   - `ASAAS_API_KEY`
   - `NEXT_PUBLIC_ADSENSE_ID` (formato `ca-pub-XXXXXXXX`)

3. Execute as migrações do Supabase para criar as tabelas de currículo:

   ```bash
   npx supabase db push
   ```

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse [http://localhost:3000](http://localhost:3000).

## 🧠 Fluxo da IA

- O assistente envia os dados do formulário para `/api/resume/generate`.
- O endpoint identifica o plano do usuário (`billing_subscriptions`) e aplica limite de 3 chamadas/hora para perfis gratuitos (controle por IP/usuário).
- O prompt base (`resumePromptTemplate`) gera JSON com resumo, bullets, palavras-chave ATS, versão em inglês e carta de apresentação opcional.
- Resultados são higienizados com `sanitize-html` e persistidos na tabela `resumes`.
- Ações premium (`rewrite-bullet`, `optimize-job`, `translate`, `cover-letter`) usam o mesmo endpoint com payload específico.

## 🛡️ Segurança

- Tabelas `resumes`, `resume_exports` e `billing_subscriptions` possuem Row Level Security com políticas que restringem acesso ao usuário autenticado.
- Exportações são registradas em `resume_exports` via service role e aplicam marca d’água para contas gratuitas.
- HTML da carta de apresentação é sanitizado antes de salvar ou exibir no editor.
- Nenhuma chave sensível é exposta no cliente; as integrações OpenAI e Asaas rodam em rotas server-side.
- Google AdSense é carregado somente quando `NEXT_PUBLIC_ADSENSE_ID` está definido.

## 💳 Assinaturas com Asaas

- Rota `/api/payments/asaas/checkout` cria cliente, assinatura mensal e retorna URL de checkout.
- Após confirmação, o fluxo externo deve atualizar `billing_subscriptions.status` para liberar os recursos premium (GPT-4.1, exportação DOCX, templates extra, carta e tradução).

## 📄 Exportação

- `GET /api/resume/export?resumeId=<id>&format=pdf|docx` gera arquivos on-the-fly.
- PDFs usam `pdf-lib` e adicionam rodapé “Gerado com Currículo IA Pro” para contas free.
- DOCX é disponibilizado somente para premium via biblioteca `docx`.

## 📚 Conteúdo SEO

- Páginas dedicadas: `/modelos-de-curriculo`, `/curriculo-primeiro-emprego`, `/como-fazer-curriculo-por-area`, `/curriculo/[profissao]`.
- Blog com artigos estruturados e Schema.org `Article`.
- Landing page inclui JSON-LD `SoftwareApplication` e slots de AdSense.

## 📦 Deploy

1. Gere o build:

   ```bash
   npm run build
   ```

2. Faça deploy (ex.: Vercel) configurando variáveis de ambiente acima e adicionando o domínio autorizado no painel do Google AdSense.

3. Garanta que os webhooks/batch jobs atualizem `billing_subscriptions` após confirmação de pagamento no Asaas.

## 🔗 Links úteis

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase](https://supabase.com/docs)
- [OpenAI Responses API](https://platform.openai.com/docs/guides/responses)
- [Asaas API](https://asaasv3.docs.apiary.io/)
- [Google AdSense](https://www.google.com/adsense/start/)
