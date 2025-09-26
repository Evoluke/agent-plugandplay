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
- Indicadores de status (tags, risco, responsável) devem seguir a paleta principal com variações em azul, roxo e verde claro.
- O cabeçalho de cada estágio apresenta contagem de oportunidades em tipografia pequena e discreta.
- Ações de gerenciamento do funil ficam agrupadas no menu de três pontinhos do cabeçalho; os estágios exibem apenas título e contagem para manter o foco nas oportunidades.
- Formulários modais devem preservar o foco dos campos durante a digitação e remover sobreposições rapidamente ao cancelar ou salvar, reforçando a percepção de fluidez mesmo após múltiplas edições consecutivas.

