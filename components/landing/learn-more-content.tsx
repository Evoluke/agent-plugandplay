import type { ReactNode } from "react";

export type LearnMoreHighlight = {
  title: string;
  description: string;
};

export type LearnMoreSlide = {
  title: string;
  content: ReactNode;
};

export const learnMoreHighlights: LearnMoreHighlight[] = [
  {
    title: "Onboarding guiado",
    description:
      "Configure o agente Evoluke com checklists passo a passo, vídeos curtos e boas práticas diretamente no painel, ficando pronto para testes em menos de uma hora.",
  },
  {
    title: "Treinamento contínuo",
    description:
      "Atualize a base de conhecimento com PDFs, links, respostas do time humano e integrações de CRM sempre que desejar, sem depender de equipe técnica.",
  },
  {
    title: "CRM conectado",
    description:
      "Cada conversa gera leads e tarefas automaticamente, com histórico centralizado, templates de playbooks e acompanhamento em tempo real das oportunidades.",
  },
  {
    title: "Governança e segurança",
    description:
      "Defina regras de aprovação, níveis de permissão e políticas de privacidade alinhadas à LGPD para garantir operação segura e transparente.",
  },
];

export const learnMoreSlides: LearnMoreSlide[] = [
  {
    title: "O que fazemos",
    content: (
      <>
        <p>
          Permitimos que sua empresa crie e personalize um agente virtual com inteligência artificial de forma simples e rápida. Integrado ao nosso CRM, ele responde dúvidas, coleta informações, qualifica leads e transfere para um atendente humano sempre que necessário — garantindo agilidade, eficiência e uma experiência impecável para seus clientes.
        </p>
        <p className="mt-4">
          Nosso agente aprende com os materiais que você disponibiliza, mantém o tom de voz da marca e evolui continuamente a cada interação, reduzindo filas e aumentando o volume de oportunidades qualificadas.
        </p>
        <h3 className="mt-6 font-semibold">Benefícios em poucas linhas</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>Respostas rápidas 24/7, com redução imediata de filas e SLA mais curto.</li>
          <li>Mais leads qualificados no CRM, com histórico completo para o time comercial.</li>
          <li>Padronização de atendimento, compliance garantido e ganhos de produtividade.</li>
          <li>Implantação rápida, com templates pré-configurados e sem complexidade técnica.</li>
        </ul>
        <h3 className="mt-6 font-semibold">Como funciona (explicação rápida)</h3>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Você cria o agente, escolhe um modelo sugerido.</li>
          <li>Personaliza personalidade, objetivos e conecta a base de conhecimento.</li>
          <li>Finaliza o pagamento para liberar o ambiente de produção e os canais desejados.</li>
          <li>Integra o agente ao CRM Evoluke e ao canal de WhatsApp</li>
          <li>Acompanha resultados, recebe sugestões de melhoria e faz ajustes pelo painel.</li>
        </ol>
      </>
    ),
  },
  {
    title: "Passo a passo de implantação",
    content: (
      <ol className="list-decimal space-y-6 pl-5">
        <li>
          <h4 className="font-semibold">Passo 1 — Criação do Agente</h4>
          <p className="mt-2 font-medium">O que você faz</p>
          <ul className="list-disc pl-5">
            <li>Escolhe o modelo do agente.</li>
            <li>Define o nome interno.</li>
          </ul>
          <p className="mt-2">Resultado: agente criado em rascunho (inativo) no painel.</p>
        </li>
        <li>
          <h4 className="font-semibold">Passo 2 — Personalização</h4>
          <p className="mt-2 font-medium">O que você define no painel</p>
          <ul className="list-disc pl-5">
            <li>Personalidade: tom de voz, objetivos, limites e protocolos de atendimento.</li>
            <li>Comportamento: quando deve escalar para atendimento humano e quais informações solicitar.</li>
            <li>Onboarding: quais dados o agente precisa coletar para qualificar o lead.</li>
            <li>Base de conhecimento: carregue documentos, links e respostas frequentes.</li>
            <li>Instruções: detalhe orientações, scripts e casos especiais.</li>
          </ul>
          <p className="mt-2">Resultado: agente pronto para pagamento.</p>
        </li>
        <li>
          <h4 className="font-semibold">Passo 3 — Pagamento</h4>
          <p className="mt-2 font-medium">Como é</p>
          <ul className="list-disc pl-5">
            <li>Após atualizar o agente de IA, a cobrança estará disponível no painel.</li>
            <li>Meios de pagamento: cartão de crédito ou débito, PIX e boleto.</li>
            <li>O pagamento é processado via Asaas e você recebe a confirmação por e-mail.</li>
            <li>Mensalmente é gerada uma nova cobrança para manter o agente ativo.</li>
          </ul>
          <p className="mt-2">Resultado: assinatura ativa e liberada a ativação do agente.</p>
        </li>
        <li>
          <h4 className="font-semibold">Passo 4 — Acesso ao CRM Evoluke</h4>
          <p className="mt-2 font-medium">O que você faz</p>
          <ul className="list-disc pl-5">
            <li>O link no menu lateral para acesso ao CRM é liberado automaticamente.</li>
            <li>Configura funis, etapas e ownership para distribuir leads ao time certo.</li>
            <li>Sincroniza contatos, conversas e anexos capturados pelo agente de IA.</li>
            <li>Ativa notificações e tarefas para acompanhar cada oportunidade.</li>
            <li>Visualiza dashboards de performance para medir impacto imediato.</li>
          </ul>
          <p className="mt-2">Resultado: acesso ao CRM finalizado e operação unificada.</p>
        </li>
        <li>
          <h4 className="font-semibold">Passo 5 — Ativação do Agente de IA</h4>
          <p className="mt-2 font-medium">Canais suportados</p>
          <p>WhatsApp, site (widget de chat), Instagram, e-mail, Facebook e integrações via API.</p>
          <p className="mt-2 font-medium">Publicação</p>
          <p>Selecione o canal no painel e siga o passo a passo guiado.</p>
          <p>Oriente seu time (marketing/TI) quando for necessária alguma ação no site ou número de WhatsApp.</p>
          <p className="mt-2 font-medium">Pós-ativação (primeiros dias)</p>
          <p>Acompanhe o painel por 48–72h, respondendo alertas de melhoria sugeridos.</p>
          <p>Ajuste mensagens, rotas de transferência e base de conhecimento conforme dúvidas reais dos clientes.</p>
          <p className="mt-2">Resultado: agente publicamente disponível e operando.</p>
        </li>
      </ol>
    ),
  },
  {
    title: "Perguntas frequentes (FAQ)",
    content: (
      <ul className="list-disc space-y-3 pl-5">
        <li>
          <span className="font-medium">Posso pausar o agente?</span> Sim, você pode desativar ou pausar pelo painel a qualquer momento sem perder as configurações.
        </li>
        <li>
          <span className="font-medium">Posso ter múltiplos agentes?</span> Sim. Crie agentes diferentes para funções, marcas ou números distintos com gestão centralizada.
        </li>
        <li>
          <span className="font-medium">Como pedir suporte?</span> Abra um ticket pelo painel, fale com nosso time via chat ou agende sessões de acompanhamento quinzenais.
        </li>
        <li>
          <span className="font-medium">Como fica a privacidade dos dados?</span> Você define mensagens de consentimento e políticas. Os dados são armazenados de forma segura e utilizados apenas para operação do agente e melhorias autorizadas.
        </li>
        <li>
          <span className="font-medium">Consigo integrar com outras ferramentas?</span> Sim, via APIs, webhooks e conectores nativos com CRM, BI e ferramentas de marketing.
        </li>
      </ul>
    ),
  },
  {
    title: "Resultados e métricas de sucesso",
    content: (
      <>
        <p>
          Mensuramos o desempenho do agente em tempo real para que você acompanhe indicadores de eficiência, satisfação e impacto nas vendas.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Painéis com taxa de resolução automática, tempo médio de atendimento e satisfação do cliente.</li>
          <li>Distribuição de leads por canal, etapa do funil e responsável, conectando o agente ao resultado comercial.</li>
          <li>Insights gerados pela IA com sugestões de novos conteúdos e respostas prioritárias.</li>
          <li>Alertas quando a taxa de transferência para humanos ou o volume de contatos sai do esperado.</li>
        </ul>
        <p className="mt-4">Combine os dados do agente com relatórios do CRM para visualizar o impacto direto em conversões e receita.</p>
      </>
    ),
  },
  {
    title: "Integrações e suporte contínuo",
    content: (
      <>
        <p>
          A Evoluke acompanha sua operação antes, durante e depois da ativação do agente para garantir que os resultados continuem crescendo.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Equipe de especialistas disponível para apoiar campanhas, roteiros e ajustes avançados.</li>
          <li>Central de ajuda com artigos, templates prontos e vídeos de melhores práticas.</li>
          <li>Monitoramento proativo e notificações automáticas quando algo precisa da sua atenção.</li>
          <li>Comunidade de clientes para compartilhar aprendizados e cases de sucesso.</li>
        </ul>
        <p className="mt-4">Assim, seu time mantém o foco em estratégia enquanto o agente cuida do atendimento e coleta insights relevantes.</p>
      </>
    ),
  },
];
