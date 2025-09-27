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
- Ao ajustar o funil de vendas, mantenha alinhadas as descrições sobre áreas de drop vazias para garantir consistência entre código e documentação visual.
- Sempre que atualizar o fluxo de assinatura corporativa, destaque na documentação que a interface considera apenas faturas pagas com vencimento vigente e ignora cobranças futuras pendentes ao liberar ativações, mantendo o menu do agente focado em atributos individuais.

## Mensagens de PR
- Estruture a mensagem de PR com um resumo em tópicos e uma seção de testes, mencionando cada comando executado.
