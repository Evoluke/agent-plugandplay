# CRM e Funil de vendas

## Visão geral
A página **Funil de vendas** reúne o funil comercial da empresa autenticada. A interface é baseada em um board Kanban com suporte a drag and drop entre colunas.

## Funcionalidades
- **Funis**: criação, edição e exclusão de funis através da rota `/api/pipelines`.
- **Estágios**: adição, edição, ordenação e remoção de estágios por funil utilizando `/api/pipelines/:pipelineId/stages`.
- **Oportunidades**: cartões arrastáveis, com edição inline e remoção pela rota `/api/pipelines/:pipelineId/cards`.

## Estrutura de dados
Os dados são armazenados nas tabelas Supabase listadas abaixo:

| Tabela | Finalidade |
| --- | --- |
| `pipeline` | Identifica funis por empresa (`company_id`). |
| `stage` | Estágios ordenados (`position`) pertencentes a um funil. |
| `card` | Oportunidades vinculadas a um estágio, com campos de valor estimado, status e notas. |

Todas as tabelas possuem RLS baseado em `company_id` e são manipuladas via `supabaseadmin` nos endpoints internos.

## Experiência do usuário
- Metas e indicadores no topo do board exibem volume total, receita estimada e ticket médio do funil selecionado.
- Botões fantasma com ícones pequenos sinalizam ações rápidas (editar/remover) mantendo foco no conteúdo dos cartões.
- Estados de carregamento utilizam `Loader2` e feedbacks são exibidos com `toast` do pacote **sonner**.
