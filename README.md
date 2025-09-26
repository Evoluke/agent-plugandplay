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
   - Configurar as variáveis de ambiente no painel da Vercel (incluindo `N8N_WEBHOOK_URL`, `N8N_AGENT_WEBHOOK_URL` e `N8N_WEBHOOK_TOKEN`, usadas pelos endpoints internos `/api/knowledge-base/upload` e `/api/agents/create`).
   - Realizar o push para o branch principal para disparar o deploy automático **ou** utilizar o comando `vercel --prod`.

> O fluxo do N8N deve validar o token enviado no header `Authorization` antes de aceitar o upload.

## 🧭 Funil de vendas

O painel do CRM agora conta com a página **Funil de vendas**, acessível pela sidebar do dashboard. Nela é possível:

- Trabalhar sempre com o funil padrão **"Funil da do Agente"** (identificador `agent_default_pipeline`), criado automaticamente para cada empresa com os estágios fixos **Entrada**, **Atendimento Humano** e **Qualificado**; ele permanece disponível como referência e não pode ser editado ou excluído.
- Criar, editar e excluir funis para diferentes jornadas comerciais (menu de três pontinhos no topo da página).
- Cada empresa pode manter até cinco funis ativos simultaneamente; cada funil aceita no máximo dez estágios.
- Organizar etapas personalizadas para cada funil, definindo todos os estágios diretamente no modal de criação/edição e reordenando oportunidades por _drag and drop_ com `@hello-pangea/dnd`.
- Os campos de funis, estágios e cards contam com limites de caracteres para evitar nomes excessivamente longos e manter a consistência visual do board.
- Visualizar o quadro do funil sem faixas de filtros rápidos, mantendo o foco na movimentação das oportunidades.
- Arrastar cards para estágios vazios utilizando a área destacada de destino, mantendo o comportamento consistente entre drag and drop e o seletor do modal.
- Registrar informações relevantes em cards (MRR, responsável, status, última interação e próximas ações).
- Digitar continuamente nos campos dos estágios e dos cards sem perda de foco, com os modais liberando o board assim que são fechados.
- Fechar o modal com **Cancelar** ou **Salvar** para descartar ou confirmar alterações com segurança; os diálogos utilizam um componente `Modal` próprio que aplica o _portal_ manualmente, desmonta o conteúdo assim que deixa de estar visível, restaura o `overflow` do `body` e remove a sobreposição na mesma renderização. Em conjunto com o mecanismo de drag and drop `@hello-pangea/dnd`, o board permanece interativo após qualquer salvamento ou cancelamento, sem travamentos residuais.
- A página é segmentada em componentes reutilizáveis (`StageColumn`, `PipelineDialog`, `CardDialog` e `Modal`), o que mantém o código enxuto e garante que cada modal seja desmontado rapidamente após salvar ou cancelar.
- Em dispositivos móveis, o board kanban utiliza rolagem horizontal com alinhamento por estágio para manter a leitura confortável sem perder a estrutura original.
- Um botão de atualização ao lado das opções do funil recarrega as colunas sob demanda, fica indisponível por 10 segundos após cada clique, tem o cooldown reiniciado quando o usuário troca de funil e conta com uma rotina automática que força a atualização do board a cada 5 minutos.

Os dados são salvos em tabelas dedicadas (`pipeline`, `stage` e `card`) e vinculados à empresa autenticada via Supabase.

## 🧱 Navegação do dashboard

- O menu lateral reúne as ações de **Configuração**, **Suporte** e **Logout** em um submenu acessível pelo ícone de três pontos horizontais posicionado no rodapé da sidebar.
- O submenu mantém o foco na navegação principal, exibindo apenas os atalhos operacionais quando solicitado.
- O primeiro atalho da barra lateral preserva o ícone de casa para destacar o retorno rápido ao dashboard principal.
- A ordem dos atalhos prioriza o **Funil de vendas** antes de **Pagamentos**, mantendo o fluxo comercial em evidência.

## 🔗 Links Úteis

- [Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [N8N](https://n8n.io/)
- [Dify](https://dify.ai/)
- [Chatwoot](https://www.chatwoot.com/)
- [Vercel](https://vercel.com/)

