# CRM e Funil de vendas

## Visão geral
A página **Funil de vendas** centraliza os funis comerciais da empresa logada. O layout apresenta colunas em estilo kanban, com arrastar e soltar entre estágios utilizando `@hello-pangea/dnd` — biblioteca escolhida para garantir um comportamento estável de ponteiro após fechar modais. Cada card exibe informações resumidas sobre a oportunidade (status, MRR, responsável, interações e próximas ações).

## Funcionalidades
- Seleção de funil a partir da lista vinculada à empresa autenticada.
- Criação, edição e exclusão de funis com descrição opcional.
- Gestão de estágios diretamente no modal de criação/edição do funil, com campos para adicionar, renomear e remover etapas antes de salvar.
- Transferência de oportunidades entre estágios pelo modal de edição, escolhendo o destino no seletor dedicado, inclusive para colunas vazias.
- Cadastro e atualização de cards com campos de contato, tag, status, responsável, métricas de mensagens e datas importantes.
- Reordenação de cards por _drag and drop_ com `@hello-pangea/dnd`, garantindo atualização imediata da coluna/posição no Supabase e evitando o bloqueio de cliques observado com a implementação anterior.
- Área de drop dedicada nas colunas vazias, permitindo transferir cards por arraste mesmo quando o estágio não possui oportunidades.

## Estrutura de dados
As tabelas criadas para suportar o módulo ficam no schema público do Supabase:

| Tabela | Campos principais | Observações |
| --- | --- | --- |
| `pipeline` | `id`, `company_id`, `name`, `description`, `created_at` | Relacionada a `company`. Remove estágios/cards associados em cascata. |
| `stage` | `id`, `pipeline_id`, `name`, `position`, `created_at` | Ordenação baseada em `position`, com exclusão em cascata dos cards. |
| `card` | `id`, `pipeline_id`, `stage_id`, `title`, `company_name`, `owner`, `tag`, `status`, `mrr`, `messages_count`, `last_message_at`, `next_action_at`, `position` | Salva métricas exibidas nos cards e mantém posição por estágio. |

## Considerações de UX
- Quando não há funis cadastrados, o usuário vê um _empty state_ orientado à criação do primeiro funil.
- As ações de funil (novo, editar e excluir) ficam agrupadas no menu de três pontinhos no cabeçalho da página.
- Estágios são manipulados dentro do modal principal, evitando diálogos adicionais; a confirmação de exclusão permanece apenas para funis e cards.
- A contagem de oportunidades por estágio é recalculada automaticamente após cada operação.
- O botão **Cancelar** fecha o modal sem persistir mudanças e libera imediatamente a interação com o restante da interface.
- O quadro prioriza a visualização das colunas do funil, sem exibir filtros rápidos que desviem a atenção das oportunidades.
- Os cabeçalhos das colunas exibem o total de oportunidades e o valor agregado de MRR em _chips_ compactos, mantendo a métrica principal sempre visível durante a navegação pelo funil.
- Cada coluna apresenta uma descrição contextual curta orientando o arraste de cards, e o _dropzone_ destaca-se com fundo sutilmente colorido e borda ativa sempre que um card é movimentado, comunicando claramente o estado de soltura.
- Campos de estágios e cards preservam o foco durante a digitação e, ao fechar os modais por **Cancelar** ou **Salvar**, o board volta a aceitar interações imediatamente; o front-end utiliza o componente `Modal` dedicado para desmontar completamente cada diálogo assim que ele é fechado, reiniciar o formulário, restaurar o `overflow` do documento e remover a camada escura na mesma renderização. A substituição do mecanismo de _drag and drop_ por `@hello-pangea/dnd` elimina os bloqueios residuais que ocorriam após cancelar ou salvar um funil.
- A implementação foi modularizada em componentes (`StageColumn`, `PipelineDialog`, `CardDialog` e `Modal`), reduzindo duplicação de lógica e garantindo que estados e sobreposições sejam resetados em cada ciclo de abertura.
