# CRM e Funil de vendas

## Visão geral
A página **Funil de vendas** centraliza os funis comerciais da empresa logada. O layout apresenta colunas em estilo kanban, com arrastar e soltar entre estágios utilizando `@hello-pangea/dnd` — biblioteca escolhida para garantir um comportamento estável de ponteiro após fechar modais. Cada card exibe informações resumidas sobre a oportunidade (status, MRR, responsável, interações e próximas ações).

## Funcionalidades
- Seleção de funil a partir da lista vinculada à empresa autenticada.
- Criação, edição e exclusão de funis com descrição opcional.
- Limite de cinco funis por empresa e dez estágios por funil para manter o gerenciamento enxuto.
- Gestão de estágios diretamente no modal de criação/edição do funil, com campos para adicionar, renomear, escolher a cor com um seletor nativo e remover etapas antes de salvar.
- Agentes SDR só podem ser ativados após autenticar o Google Calendar vinculado, garantindo que apenas representantes com agenda conectada ofereçam horários disponíveis aos leads.
- Cada empresa mantém apenas um agente de IA ativo por vez; ativar um novo agente desativa automaticamente os demais associados à mesma companhia.
- Cada estágio recebe uma cor de fundo armazenada no campo `stage.color`, aplicada diretamente como plano de fundo da coluna no board.
- Transferência de oportunidades entre estágios pelo modal de edição, escolhendo o destino no seletor dedicado, inclusive para colunas vazias.
- Menu de contexto nos cards com ações de transferência direta para outros funis (sempre posicionando a oportunidade no primeiro estágio disponível) e remoção rápida.
- Mensagem destacada no modal de criação/edição de cards informando que novas ferramentas e campos estão em desenvolvimento.
- Cadastro e atualização de cards com um único campo de contato, simplificando o preenchimento enquanto novos recursos são desenvolvidos. O campo de tag continua disponível no formulário apenas para fins internos e não é mais exibido no card.
- Campos de funil, estágios e cards com limites de caracteres para preservar a legibilidade das colunas.
- Os contatos exibidos nos cards recebem truncamento automático para evitar estouro visual dentro das colunas.
- Reordenação de cards por _drag and drop_ com `@hello-pangea/dnd`, garantindo atualização imediata da coluna/posição no Supabase e evitando o bloqueio de cliques observado com a implementação anterior.
- Área de drop dedicada nas colunas vazias, permitindo transferir cards por arraste mesmo quando o estágio não possui oportunidades.
- Botão de atualização dedicado ao funil, com bloqueio de 10 segundos entre cliques, cooldown reiniciado automaticamente ao alternar de funil e rotina automática que força a recarga do board a cada 5 minutos.

## Estrutura de dados
As tabelas criadas para suportar o módulo ficam no schema público do Supabase:

| Tabela | Campos principais | Observações |
| --- | --- | --- |
| `pipeline` | `id`, `company_id`, `name`, `description`, `created_at` | Relacionada a `company`. Remove estágios/cards associados em cascata. |
| `stage` | `id`, `pipeline_id`, `name`, `position`, `color`, `created_at` | Ordenação baseada em `position`, cor em formato hexadecimal utilizada no fundo das colunas e exclusão em cascata dos cards. |
| `card` | `id`, `pipeline_id`, `stage_id`, `contact`, `position` | Armazena o contato associado à oportunidade e mantém a ordenação dentro do estágio. |

### Funil padrão por empresa

- Toda empresa recebe automaticamente o funil **"Funil da do Agente"**, identificado no banco de dados pelo campo `identifier = 'agent_default_pipeline'`.
- Os estágios deste funil são fixos e seguem a ordem: **Entrada**, **Atendimento Humano** e **Qualificado**, com as cores padrão **#E0F2FE**, **#FCE7F3** e **#FEF3C7** aplicadas respectivamente.
- O front-end garante que o funil padrão exista antes de carregar o board, restaure os nomes/ordens configurados e o proteja contra exclusão ou edição.
- Como apenas um funil pode utilizar este identificador por empresa, criações manuais sempre resultam em novos funis personalizados, mantendo o padrão intacto.

## Considerações de UX
- Quando não há funis cadastrados, o usuário vê um _empty state_ orientado à criação do primeiro funil.
- As ações de funil (novo, editar e excluir) ficam agrupadas no menu de três pontinhos no cabeçalho da página.
- Os cards usam um menu de três pontinhos dedicado para transferências entre funis e remoção, mantendo o botão principal reservado para abrir os detalhes.
- Estágios são manipulados dentro do modal principal, evitando diálogos adicionais; a confirmação de exclusão permanece apenas para funis e cards.
- A contagem de oportunidades por estágio é recalculada automaticamente após cada operação.
- O botão **Cancelar** fecha o modal sem persistir mudanças e libera imediatamente a interação com o restante da interface.
- O quadro prioriza a visualização das colunas do funil, sem exibir filtros rápidos que desviem a atenção das oportunidades.
- Cabeçalhos de estágio e estados vazios usam tons de cinza com contraste mínimo de 4,5:1, garantindo leitura confortável mesmo sobre fundos translúcidos.
- Campos de estágios e cards preservam o foco durante a digitação e, ao fechar os modais por **Cancelar** ou **Salvar**, o board volta a aceitar interações imediatamente; o front-end utiliza o componente `Modal` dedicado para desmontar completamente cada diálogo assim que ele é fechado, reiniciar o formulário, restaurar o `overflow` do documento e remover a camada escura na mesma renderização. A substituição do mecanismo de _drag and drop_ por `@hello-pangea/dnd` elimina os bloqueios residuais que ocorriam após cancelar ou salvar um funil.
- A implementação foi modularizada em componentes (`StageColumn`, `PipelineDialog`, `CardDialog` e `Modal`), reduzindo duplicação de lógica e garantindo que estados e sobreposições sejam resetados em cada ciclo de abertura.
- Em telas pequenas, o board kanban faz uso de rolagem horizontal com _snap_ por estágio, permitindo navegar pelas colunas sem quebrar o layout ou comprometer a leitura dos cards.
- Sempre que precisar comunicar bloqueios por assinatura no CRM, deixe explícito que a validação ocorre no nível da empresa, consome somente `company.subscription_expires_at` e ignora qualquer consulta direta a cobranças individuais; alinhe a mensagem ao fluxo de ativação, pois o menu do agente não exibe mais o status corporativo, e destaque que a vigência permanece ativa até 00h00 do dia seguinte ao vencimento informado.
- A criação de agentes passou a ocorrer inteiramente dentro da API sem acionar webhooks do N8N; mantenha a automação do CRM desacoplada desses eventos e utilize apenas o fluxo dedicado quando precisar provisionar integrações externas.
