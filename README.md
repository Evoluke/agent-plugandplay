# Agent Plug and Play

Este repositório contém uma aplicação [Next.js](https://nextjs.org/) preparada para integrar serviços como **N8N**, **Dify** e **Chatwoot**, oferecendo uma base para construir experiências de agentes prontos para uso. A criação de agentes agora ocorre totalmente dentro da plataforma, sem acionar fluxos externos no N8N.

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
   - Configurar as variáveis de ambiente no painel da Vercel (incluindo `N8N_WEBHOOK_URL`, `N8N_CRM_WEBHOOK_URL` e `N8N_WEBHOOK_TOKEN`, usadas pelos endpoints internos `/api/knowledge-base/upload` e `/api/crm/create`).
   - Revisar os fluxos do N8N responsáveis por receber uploads de base de conhecimento e provisionamento do CRM para que validem o token enviado no header `Authorization`.
   - Realizar o push para o branch principal para disparar o deploy automático **ou** utilizar o comando `vercel --prod`.

> A criação de agentes não envia mais webhooks ao N8N; qualquer automação adicional deve ser disparada a partir de outros fluxos específicos.

## 🧭 Funil de vendas

O painel do CRM agora conta com a página **Funil de vendas**, acessível pela sidebar do dashboard. Nela é possível:

- Trabalhar sempre com o funil padrão **"Funil da do Agente"** (identificador `agent_default_pipeline`), criado automaticamente para cada empresa com os estágios fixos **Entrada**, **Atendimento Humano** e **Qualificado**; ele permanece disponível como referência, não pode ser editado ou excluído e já chega com a paleta **#E0F2FE**, **#FCE7F3** e **#FEF3C7** aplicada a cada coluna.
- Criar, editar e excluir funis para diferentes jornadas comerciais (menu de três pontinhos no topo da página).
- Cada empresa pode manter até cinco funis ativos simultaneamente; cada funil aceita no máximo dez estágios.
- Organizar etapas personalizadas para cada funil, definindo todos os estágios diretamente no modal de criação/edição e reordenando oportunidades por _drag and drop_ com `@hello-pangea/dnd`.
- Definir a cor de fundo de cada estágio diretamente no modal de criação/edição, armazenada no campo `stage.color`, para destacar visualmente as colunas do board.
- Os campos de funis, estágios e cards contam com limites de caracteres para evitar nomes excessivamente longos e manter a consistência visual do board.
- Visualizar o quadro do funil sem faixas de filtros rápidos, mantendo o foco na movimentação das oportunidades.
- Arrastar cards para estágios vazios utilizando a área destacada de destino, mantendo o comportamento consistente entre drag and drop e o seletor do modal.
- Registrar informações relevantes em cards (MRR, responsável, status, última interação e próximas ações).
- Digitar continuamente nos campos dos estágios e dos cards sem perda de foco, com os modais liberando o board assim que são fechados.
- Fechar o modal com **Cancelar** ou **Salvar** para descartar ou confirmar alterações com segurança; os diálogos utilizam um componente `Modal` próprio que aplica o _portal_ manualmente, desmonta o conteúdo assim que deixa de estar visível, restaura o `overflow` do `body` e remove a sobreposição na mesma renderização. Em conjunto com o mecanismo de drag and drop `@hello-pangea/dnd`, o board permanece interativo após qualquer salvamento ou cancelamento, sem travamentos residuais.
- A página é segmentada em componentes reutilizáveis (`StageColumn`, `PipelineDialog`, `CardDialog` e `Modal`), o que mantém o código enxuto e garante que cada modal seja desmontado rapidamente após salvar ou cancelar.
- Em dispositivos móveis, o board kanban utiliza rolagem horizontal com alinhamento por estágio para manter a leitura confortável sem perder a estrutura original.
- Um botão de atualização ao lado das opções do funil recarrega as colunas sob demanda, fica indisponível por 10 segundos após cada clique, tem o cooldown reiniciado quando o usuário troca de funil e conta com uma rotina automática que força a atualização do board a cada 5 minutos.

Os dados são salvos em tabelas dedicadas (`pipeline`, `stage` — agora com a coluna `color` — e `card`) e vinculados à empresa autenticada via Supabase.

## 🧱 Navegação do dashboard

- O menu lateral reúne as ações de **Configuração**, **Suporte** e **Logout** em um submenu acessível pelo ícone de três pontos horizontais posicionado no rodapé da sidebar.
- O submenu mantém o foco na navegação principal, exibindo apenas os atalhos operacionais quando solicitado.
- O primeiro atalho da barra lateral preserva o ícone de casa para destacar o retorno rápido ao dashboard principal.
- A ordem dos atalhos prioriza o **Funil de vendas** antes de **Pagamentos**, mantendo o fluxo comercial em evidência.
- Ao lado do sino de notificações, um indicador em formato de robô sinaliza se existe um agente de IA ativo na empresa, exibindo um rosto feliz quando a ativação está liberada e um rosto triste caso contrário.

## 💳 Pagamentos

- Cada empresa possui um histórico único de cobranças: o primeiro pagamento é criado automaticamente quando o usuário provisiona o primeiro agente de IA e não existe nenhum registro prévio para a empresa na tabela `payments`.
- O campo `reference` do primeiro pagamento segue o formato `Mensalidade (dd/MM/aaaa)` e utiliza a data corrente da criação para facilitar a identificação da fatura.
- A página apresenta um card dedicado à assinatura corporativa, exibindo a data de expiração consolidada em `company.subscription_expires_at`, respeitando uma carência de 1 dia antes de considerar a vigência expirada (o status só muda para "Expirada" a partir de 00h00 do dia seguinte ao vencimento) e mantendo a etiqueta "Ativa" durante esse período de tolerância calculado por dia, não por horas corridas.
- Novos agentes reutilizam o mesmo cadastro de pagamento da empresa, evitando a geração de cobranças duplicadas ao longo da expansão do time de IA.
- Os registros de cobrança ficam associados apenas ao `company_id`; nenhum `agent_id` é armazenado na tabela `payments`, reforçando que a assinatura é sempre corporativa.
- A ativação dos agentes só ocorre quando a assinatura corporativa está paga e dentro da validade; o painel ignora cobranças futuras pendentes e utiliza a última fatura paga com vencimento vigente para liberar o botão de ativar.
- Apenas um agente de IA pode permanecer ativo por empresa; ao ativar um novo agente, o sistema desativa automaticamente os demais agentes corporativos para evitar conflitos na operação.
- O menu do agente concentra-se apenas nos atributos individuais (status e tipo), deixando a conferência da assinatura corporativa centralizada no fluxo de ativação.
- O vencimento consolidado fica armazenado em `company.subscription_expires_at`, permitindo que toda a aplicação valide a expiração corporativa sem depender de campos na tabela `agents`.
- Falhas ao buscar o histórico de cobranças exibem uma notificação de erro, evitando que a página fique silenciosamente desatualizada quando o Supabase estiver indisponível.

## 📅 Integração com Google Calendar

- A checagem que libera a ativação de agentes SDR considera apenas a existência de um registro em `agent_google_tokens` vinculado pelo campo `agent_id`, garantindo compatibilidade com o modelo sem coluna `id`.

## 🔗 Links Úteis

- [Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [N8N](https://n8n.io/)
- [Dify](https://dify.ai/)
- [Chatwoot](https://www.chatwoot.com/)
- [Vercel](https://vercel.com/)

