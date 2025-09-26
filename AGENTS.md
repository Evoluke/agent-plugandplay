# Instruções para agentes

## Escopo
Estas orientações se aplicam a todo o repositório `agent-plugandplay`.

## Convenções de código
- Quando alterar arquivos TypeScript ou JavaScript em `src/` ou `components/`, execute `npm run lint` e relate o resultado na resposta final.
- Prefira componentes funcionais e hooks do React ao adicionar novas funcionalidades na aplicação Next.js.
- Não adicione blocos `try/catch` ao redor de instruções `import`.

## Documentação
- Atualize documentação relevante (por exemplo, arquivos em `docs/` ou `README.md`) sempre que fizer mudanças que afetem o comportamento observado pelo usuário.
- Ao modificar arquivos Markdown, utilize títulos em português e mantenha uma estrutura coerente com o restante do projeto.

## CRM
- As novas rotas do funil de vendas dependem das tabelas `pipeline`, `stage` e `card`. Sempre sincronize alterações no frontend com as APIs e migrations correspondentes.
- Lembre-se de validar arrastos e operações de drag and drop com mensagens de erro claras para o usuário final.

## Mensagens de PR
- Estruture a mensagem de PR com um resumo em tópicos e uma seção de testes, mencionando cada comando executado.
