# Instruções para agentes

## Escopo
Estas orientações se aplicam a todo o repositório `agent-plugandplay`.

## Convenções de código
- Quando alterar arquivos TypeScript ou JavaScript em `src/` ou `components/`, execute `npm run lint` e relate o resultado na resposta final.
- Prefira componentes funcionais e hooks do React ao adicionar novas funcionalidades na aplicação Next.js.
- Não adicione blocos `try/catch` ao redor de instruções `import`.
- Para integrações com Evolution ou Redis, reutilize `@/lib/evolution` e `@/lib/redis`; centralize variáveis de ambiente nesses helpers.

## Documentação
- Atualize documentação relevante (por exemplo, arquivos em `docs/` ou `README.md`) sempre que fizer mudanças que afetem o comportamento observado pelo usuário.
- Ao modificar arquivos Markdown, utilize títulos em português e mantenha uma estrutura coerente com o restante do projeto.
- Registre novas filas ou caches baseados em Redis na documentação apropriada para facilitar auditoria operacional.
- Sempre revise `README.md`, `docs/crm.md`, `docs/SECURITY.md` e `docs/BRANDING.md` ao alterar integrações para garantir que descrevem o comportamento vigente.

## Mensagens de PR
- Estruture a mensagem de PR com um resumo em tópicos e uma seção de testes, mencionando cada comando executado.
