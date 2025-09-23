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

## Ícones e badges
- Alertas exibidos pelo módulo de notificações devem utilizar o tom `#F59E0B` para o estado _warning_ e `#10B981` para _success_, respeitando contraste AA.
- Quando houver necessidade de indicar processamento assíncrono (por exemplo, itens enfileirados via Redis), utilize badges com bordas arredondadas (raio mínimo de 12 px) e texto em Geist Sans semibold 12 px.
- Mensagens aguardando processamento na fila `evolution:incoming-messages` devem usar badge lilás (`#6366F1`) com ícone de relâmpago estilizado, destacando que o conteúdo ainda está em fase de sincronização.

