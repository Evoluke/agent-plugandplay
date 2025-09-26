# Guia do CRM

## Funil de vendas
- A página **Funil de vendas** está disponível no dashboard e apresenta um quadro Kanban responsivo para organizar oportunidades.
- Pipelines, estágios e cartões são filtrados automaticamente por empresa através das políticas de RLS descritas na migração `20250222000000_create_sales_pipeline_tables.sql`.
- As operações de arrastar e soltar atualizam a ordenação (`position`) e sincronizam o Supabase usando mutações otimizadas.

## Boas práticas de manutenção
- Sempre que ajustar as políticas de segurança, utilize o padrão `drop policy if exists` seguido de `create policy` para manter a compatibilidade com o PostgreSQL 15.
- Revise periodicamente os webhooks e automações conectados aos eventos do funil para garantir que respeitam o isolamento por `company_id`.
- Ao introduzir novos campos nos cartões, considere o impacto nas integrações externas e comunique a alteração na documentação pública.
