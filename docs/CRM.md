# Guia do CRM

Este guia documenta o fluxo do Funil de vendas disponível na área autenticada do dashboard.

## Acesso rápido

- **Menu lateral:** item "Funil de vendas" dentro do dashboard.
- **URL direta:** `/dashboard/funil-de-vendas`.

## Funcionalidades principais

1. **Gestão de funis**
   - Criar novos funis vinculados à empresa autenticada.
   - Renomear funis existentes.
   - Remover funis e respectivos estágios/cartões.
2. **Gestão de estágios**
   - Adicionar novas colunas (estágios) ao funil selecionado.
   - Editar o nome de estágios já cadastrados.
   - Excluir estágios e atualizar automaticamente a ordenação restante.
3. **Quadro Kanban**
   - Criar cartões com título, descrição e valor estimado.
   - Editar ou remover cartões existentes.
   - Arrastar e soltar cartões entre estágios para refletir o avanço dos leads.

## Tabelas no banco de dados

As tabelas abaixo fazem parte do módulo de funil de vendas. Todas estão protegidas por políticas de RLS vinculadas à tabela `company`.

| Tabela | Finalidade | Colunas de destaque |
| ------ | ---------- | ------------------- |
| `pipeline` | Armazena os funis criados por cada empresa. | `id`, `company_id`, `name`, `created_at` |
| `stage` | Representa os estágios/colunas de um funil. | `id`, `pipeline_id`, `title`, `position`, `created_at` |
| `card` | Cartões individuais dentro de um estágio. | `id`, `stage_id`, `title`, `description`, `value`, `position`, `created_at` |

## Boas práticas de uso

- Mantenha os nomes dos estágios curtos e objetivos para facilitar a leitura no quadro Kanban.
- Utilize o campo de valor para registrar montantes estimados e acompanhar previsões de receita.
- Arraste os cartões apenas após as alterações serem salvas para evitar conflitos de sincronização.
