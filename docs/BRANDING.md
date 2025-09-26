# Guia de Branding

Este documento descreve os princípios básicos de identidade visual do projeto.

## Paleta de cores
Utilizamos variáveis CSS para garantir consistência. Valores atuais:

| Variável | Valor | Uso sugerido |
|---------|-------|--------------|
| `--background` | `#FAFAFA` | Fundo padrão em temas claros |
| `--foreground` | `oklch(0.145 0 0)` | Cor de texto principal |
| `--primary` | `#2F6F68` | Ações primárias e elementos de destaque |
| `--primary-hover` | `#255852` | Estado _hover_ de ações primárias |
| `--secondary` | `#97B7B4` | Elementos neutros e secundários |
| `--accent` | `#97B7B4` | Chamadas de atenção específicas |

## Tipografia
A família tipográfica oficial é **Geist**, nas variantes Sans e Mono. Utilize Geist Sans para textos e Geist Mono para trechos de código ou números alinhados.

## Espaçamentos
A unidade base de espaçamento segue o padrão do Tailwind CSS (4 px). Organize margens e paddings em múltiplos desta unidade: 4, 8, 12, 16, 24 px etc.

## Uso de logotipos
- O logotipo principal está disponível em `public/logo.png`.
- Mantenha uma margem de segurança ao redor do logotipo equivalente a 1× a altura do símbolo.
- Utilize a versão em `#2F6F68` sobre fundos claros e a versão branca sobre fundos escuros.
- Não distorça, rotacione ou altere as cores oficiais.

## Diretrizes para o funil de vendas
- Os cards do funil utilizam cantos arredondados de 16 px, sombra suave e espaçamento interno de 16 px.
- Indicadores de status (status textual, risco e métricas) devem seguir a paleta principal com variações em azul, roxo e verde claro.
- O cabeçalho do card prioriza título e empresa, agora com truncamento de linhas para preservar a leitura sem exibir a antiga tag.
- O cabeçalho de cada estágio apresenta contagem de oportunidades em tipografia pequena e discreta.
- As colunas herdam o fundo configurado no banco via `stage.color`; mantenha tonalidades claras (ex.: `#E0F2FE`, `#FCE7F3`, `#FEF3C7`) para preservar o contraste dos textos cinza-escuros e alinhar com a paleta aplicada automaticamente ao funil padrão.
- Ações de gerenciamento do funil ficam agrupadas no menu de três pontinhos do cabeçalho; os estágios exibem apenas título e contagem para manter o foco nas oportunidades.
- Formulários modais devem preservar o foco dos campos durante a digitação e, ao cancelar ou salvar, desmontar o diálogo, limpar os campos e remover a sobreposição esmaecida com leve _blur_. Os componentes (`PipelineDialog`, `CardDialog` e `Modal`) agora só ficam montados enquanto estiverem visíveis, aplicando o portal personalizado para bloquear o _scroll_ temporariamente e restabelecer o `body` ao fechar; isso reforça a percepção de fluidez e evita o bloqueio residual observado anteriormente. Mantenha a identidade visual alinhada entre eles ao aplicar ajustes.
- O movimento dos cards usa `@hello-pangea/dnd`, que mantém a experiência de arrastar consistente após fechar qualquer modal. Garanta que estados visuais (sombra, destaque e placeholders) acompanhem essa fluidez sem introduzir artefatos que sugiram travamento da interface.
- Colunas vazias devem exibir uma área pontilhada com texto em caixa alta convidando o usuário a arrastar oportunidades, reforçando que o drop é permitido mesmo sem cards existentes.

## Status corporativo dos agentes
- O card lateral de "Assinatura corporativa" deve deixar claro que o vencimento exibido é compartilhado entre todos os agentes da empresa.
- Utilize o mesmo tom tipográfico do estado "Ativo"/"Pendente" já existente e destaque a data formatada com `pt-BR`, proveniente de `company.subscription_expires_at`.
- Em caso de erro na leitura da assinatura corporativa, apresente a mensagem padrão "Não encontrada" para reforçar que o problema é da conta da empresa, não de um agente específico.

