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

## Boas práticas de UI
- Evite adicionar cabeçalhos ou descrições extras no módulo para preservar a experiência imersiva.
- Caso seja necessário exibir avisos, utilize os componentes de alerta globais do dashboard, evitando sobrepor elementos dentro do iframe.
