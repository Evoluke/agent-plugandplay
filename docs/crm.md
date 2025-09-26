# CRM e Funil de Vendas

Este documento descreve como funciona o módulo de funil de vendas disponibilizado no painel interno.

## Visão geral
- A página **Funil de vendas** pode ser acessada a partir da barra lateral do dashboard.
- O funil é exibido em formato de quadro kanban, permitindo arrastar e soltar cards entre estágios.
- Cada empresa pode criar múltiplos funis para organizar processos comerciais distintos.

## Estrutura de dados
- **pipeline**: representa um funil de vendas e pertence a uma empresa (`company`).
- **stage**: cada coluna do kanban, vinculada a um pipeline e ordenada pelo campo `position`.
- **card**: oportunidades dentro dos estágios. Possuem título, descrição opcional e valor numérico.

As relações possuem `ON DELETE CASCADE`, garantindo que estágios e cards sejam removidos ao excluir um funil ou estágio.

## Funcionalidades da interface
- Criar, renomear e excluir funis.
- Adicionar, editar e remover estágios.
- Criar, atualizar, mover e remover cards entre estágios utilizando arrastar e soltar.
- Confirmações para exclusões a fim de evitar remoções acidentais.

## Boas práticas de uso
- Utilize nomes claros para estágios, seguindo o processo comercial da equipe.
- Informe o valor estimado de cada oportunidade para facilitar previsões de receita.
- Revise periodicamente o funil e remova funis obsoletos para manter a base organizada.
