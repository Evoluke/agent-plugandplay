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

## Tom de voz do agente
- Os agentes podem assumir tons **Formal**, **Casual**, **Informal** ou **Neutro**. Escolha o estilo alinhado à identidade verbal da marca antes de complementar as instruções.
- Prefira o modo **Neutro** para mensagens objetivas com vocabulário equilibrado e use o modo **Informal** em conversas que comportem linguagem mais leve, mantendo o cuidado com gírias regionais.
- Sempre que o tom precisar variar por canal, registre orientações específicas nas instruções complementares, reforçando a consistência do atendimento.

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
- Na edição dos estágios, mantenha o seletor de cor e o botão de remover alinhados ao campo de nome para reforçar a sensação de lista contínua e evitar ruído visual com códigos hexadecimais.
- Ações de gerenciamento do funil ficam agrupadas no menu de três pontinhos do cabeçalho; os estágios exibem apenas título e contagem para manter o foco nas oportunidades.
- Formulários modais devem preservar o foco dos campos durante a digitação e, ao cancelar ou salvar, desmontar o diálogo, limpar os campos e remover a sobreposição esmaecida com leve _blur_. Os componentes (`PipelineDialog`, `CardDialog` e `Modal`) agora só ficam montados enquanto estiverem visíveis, aplicando o portal personalizado para bloquear o _scroll_ temporariamente e restabelecer o `body` ao fechar; isso reforça a percepção de fluidez e evita o bloqueio residual observado anteriormente. Mantenha a identidade visual alinhada entre eles ao aplicar ajustes.
- O movimento dos cards usa `@hello-pangea/dnd`, que mantém a experiência de arrastar consistente após fechar qualquer modal. Garanta que estados visuais (sombra, destaque e placeholders) acompanhem essa fluidez sem introduzir artefatos que sugiram travamento da interface.
- Colunas vazias devem exibir uma área pontilhada com texto em caixa alta convidando o usuário a arrastar oportunidades, reforçando que o drop é permitido mesmo sem cards existentes.

## Status corporativo dos agentes
- O menu lateral do agente não exibe mais um card dedicado à assinatura corporativa; mantenha a hierarquia visual focada no status individual e no tipo do agente.
- Mensagens sobre pagamento corporativo devem aparecer apenas em fluxos como ativação ou alertas globais, preservando a distinção entre branding individual e informações financeiras compartilhadas.
- Qualquer tela que comunique a assinatura deve continuar considerando somente o vencimento consolidado em `company.subscription_expires_at`, ignorando cobranças futuras pendentes para evitar alarmes incorretos e destacando que a etiqueta de vigência só muda para expirada a partir de 00h00 do dia seguinte ao vencimento exibido; esse campo agora é alimentado exclusivamente pelas automações externas (ex.: N8N), portanto a interface precisa tratar estados vazios como padrão.
- Avisos relacionados a automações externas não devem sugerir dependência do N8N durante a criação de agentes, já que o provisionamento agora ocorre internamente; mantenha o tom institucional destacando a autonomia da plataforma.

