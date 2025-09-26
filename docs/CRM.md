# Guia do Funil de Vendas

Este documento descreve os principais elementos do funil de vendas implantado na aplicação.

## Estrutura de dados

O funil utiliza três tabelas no Supabase:

- **pipeline**: registra o funil vinculado à empresa (`company_id`).
- **stage**: armazena os estágios do funil e sua ordem (`position`).
- **card**: representa as oportunidades exibidas em cada estágio, com campos para empresa, valor, status e prioridade.

## Endpoints

Todas as rotas validam o usuário autenticado e garantem o vínculo com a empresa antes de interagir com o banco de dados.

- `GET /api/pipelines`: lista funis com estágios e cartões.
- `POST /api/pipelines`: cria um novo funil.
- `PATCH /api/pipelines/:id` e `DELETE /api/pipelines/:id`: atualizam ou removem um funil existente.
- `POST /api/pipelines/:pipelineId/stages`: adiciona um estágio ao funil.
- `PATCH /api/stages/:id` e `DELETE /api/stages/:id`: editam ou excluem um estágio.
- `POST /api/stages/:stageId/cards`: cria cartões em um estágio.
- `PATCH /api/cards/:id` e `DELETE /api/cards/:id`: atualizam ou removem cartões.
- `PATCH /api/cards/reorder`: persiste a nova ordem dos cartões após movimentação no Kanban.

## Comportamento da interface

- A página **Funil de vendas** está disponível na sidebar do dashboard.
- O quadro utiliza `@dnd-kit` para arrastar cartões entre estágios e salvar a nova ordem automaticamente.
- A interface permite criar e editar funis, estágios e cartões sem sair da página, utilizando formulários inline.
