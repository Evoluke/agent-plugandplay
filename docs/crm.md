
# Guia do CRM Embutido

## Visão geral
O módulo de CRM agora carrega o Chatwoot diretamente dentro do dashboard em um iframe de tela cheia. Removemos o cabeçalho interno para que o atendimento ocupe toda a área disponível após os alertas da plataforma.

## Estados de carregamento
- **Carregando**: exibe um spinner centralizado com a mensagem "Conectando com o CRM..." enquanto buscamos a URL de SSO.
- **Erro**: caso a URL não seja retornada, mostramos a mensagem de erro e um botão para tentar novamente. O botão apenas força uma nova requisição à rota `/api/chatwoot/sso`.

## Requisitos para o SSO
1. Manter as variáveis de ambiente `CHATWOOT_BASE_URL` e `CHATWOOT_PLATFORM_TOKEN` configuradas.
2. Garantir que o campo `chatwoot_user_id` esteja preenchido na tabela `company` para o usuário autenticado.
3. Confirmar que a rota `/api/chatwoot/sso` responda com um objeto `{ url: string }`. Respostas inválidas exibem o estado de erro padrão.
4. Validar que o backend realiza a chamada `POST` para `${CHATWOOT_BASE_URL}/platform/api/v1/users/{chatwoot_user_id}/login`, mantendo o header `api_access_token` exigido pelo Chatwoot.
5. Investigar respostas sem `Content-Type: application/json`; o backend agora bloqueia URLs inválidas e registra uma prévia do corpo inesperado para acelerar o suporte.

## Boas práticas de UI
- Evite adicionar cabeçalhos ou descrições extras no módulo para preservar a experiência imersiva.
- Caso seja necessário exibir avisos, utilize os componentes de alerta globais do dashboard, evitando sobrepor elementos dentro do iframe.

# CRM e Funil de vendas

## Visão geral
A página **Funil de vendas** centraliza os funis comerciais da empresa logada. O layout apresenta colunas em estilo kanban, com arrastar e soltar entre estágios utilizando `@hello-pangea/dnd` — biblioteca escolhida para garantir um comportamento estável de ponteiro após fechar modais. Cada card exibe informações resumidas sobre a oportunidade (status, MRR, responsável, interações e próximas ações).

## Funcionalidades
- Seleção de funil a partir da lista vinculada à empresa autenticada.
- Criação, edição e exclusão de funis com descrição opcional.
- Limite de cinco funis por empresa e dez estágios por funil para manter o gerenciamento enxuto.
- Gestão de estágios diretamente no modal de criação/edição do funil, com campos para adicionar, renomear e remover etapas antes de salvar.
- Transferência de oportunidades entre estágios pelo modal de edição, escolhendo o destino no seletor dedicado, inclusive para colunas vazias.
- Cadastro e atualização de cards com campos de contato, status, responsável, métricas de mensagens e datas importantes. O campo de tag continua disponível no formulário apenas para fins internos e não é mais exibido no card.
- Campos de funil, estágios e cards com limites de caracteres para preservar a legibilidade das colunas.
- Títulos, empresas e responsáveis dos cards recebem truncamento automático para evitar estouro visual dentro das colunas.
- Reordenação de cards por _drag and drop_ com `@hello-pangea/dnd`, garantindo atualização imediata da coluna/posição no Supabase e evitando o bloqueio de cliques observado com a implementação anterior.
- Área de drop dedicada nas colunas vazias, permitindo transferir cards por arraste mesmo quando o estágio não possui oportunidades.
- Botão de atualização dedicado ao funil, com bloqueio de 10 segundos entre cliques, cooldown reiniciado automaticamente ao alternar de funil e rotina automática que força a recarga do board a cada 5 minutos.

## Estrutura de dados
As tabelas criadas para suportar o módulo ficam no schema público do Supabase:

| Tabela | Campos principais | Observações |
| --- | --- | --- |
| `pipeline` | `id`, `company_id`, `name`, `description`, `created_at` | Relacionada a `company`. Remove estágios/cards associados em cascata. |
| `stage` | `id`, `pipeline_id`, `name`, `position`, `created_at` | Ordenação baseada em `position`, com exclusão em cascata dos cards. |
| `card` | `id`, `pipeline_id`, `stage_id`, `title`, `company_name`, `owner`, `tag`, `status`, `mrr`, `messages_count`, `last_message_at`, `next_action_at`, `position` | Salva métricas exibidas nos cards e mantém posição por estágio. |

### Funil padrão por empresa

- Toda empresa recebe automaticamente o funil **"Funil da do Agente"**, identificado no banco de dados pelo campo `identifier = 'agent_default_pipeline'`.
- Os estágios deste funil são fixos e seguem a ordem: **Entrada**, **Atendimento Humano** e **Qualificado**.
- O front-end garante que o funil padrão exista antes de carregar o board, restaure os nomes/ordens configurados e o proteja contra exclusão ou edição.
- Como apenas um funil pode utilizar este identificador por empresa, criações manuais sempre resultam em novos funis personalizados, mantendo o padrão intacto.

## Considerações de UX
- Quando não há funis cadastrados, o usuário vê um _empty state_ orientado à criação do primeiro funil.
- As ações de funil (novo, editar e excluir) ficam agrupadas no menu de três pontinhos no cabeçalho da página.
- Estágios são manipulados dentro do modal principal, evitando diálogos adicionais; a confirmação de exclusão permanece apenas para funis e cards.
- A contagem de oportunidades por estágio é recalculada automaticamente após cada operação.
- O botão **Cancelar** fecha o modal sem persistir mudanças e libera imediatamente a interação com o restante da interface.
- O quadro prioriza a visualização das colunas do funil, sem exibir filtros rápidos que desviem a atenção das oportunidades.
- Cabeçalhos de estágio e estados vazios usam tons de cinza com contraste mínimo de 4,5:1, garantindo leitura confortável mesmo sobre fundos translúcidos.
- Campos de estágios e cards preservam o foco durante a digitação e, ao fechar os modais por **Cancelar** ou **Salvar**, o board volta a aceitar interações imediatamente; o front-end utiliza o componente `Modal` dedicado para desmontar completamente cada diálogo assim que ele é fechado, reiniciar o formulário, restaurar o `overflow` do documento e remover a camada escura na mesma renderização. A substituição do mecanismo de _drag and drop_ por `@hello-pangea/dnd` elimina os bloqueios residuais que ocorriam após cancelar ou salvar um funil.
- A implementação foi modularizada em componentes (`StageColumn`, `PipelineDialog`, `CardDialog` e `Modal`), reduzindo duplicação de lógica e garantindo que estados e sobreposições sejam resetados em cada ciclo de abertura.
- Em telas pequenas, o board kanban faz uso de rolagem horizontal com _snap_ por estágio, permitindo navegar pelas colunas sem quebrar o layout ou comprometer a leitura dos cards.

