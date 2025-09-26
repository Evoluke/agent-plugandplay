# CRM e Funil de vendas

## Visão geral
A página **Funil de vendas** centraliza os funis comerciais da empresa logada. O layout apresenta colunas em estilo kanban, com arrastar e soltar entre estágios utilizando `@dnd-kit`. Cada card exibe informações resumidas sobre a oportunidade (status, MRR, responsável, interações e próximas ações).

## Funcionalidades
- Seleção de funil a partir da lista vinculada à empresa autenticada.
- Criação, edição e exclusão de funis com descrição opcional.
- Gestão de estágios diretamente no modal de criação/edição do funil, com campos para adicionar, renomear e remover etapas antes de salvar.
- Cadastro e atualização de cards com campos de contato, tag, status, responsável, métricas de mensagens e datas importantes.
- Reordenação de cards por _drag and drop_, com atualização imediata da coluna e posição no Supabase.

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
