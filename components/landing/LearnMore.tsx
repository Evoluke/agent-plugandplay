"use client";

import Link from "next/link";
import { useState } from "react";

const highlights = [
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

const deepDiveSections = [
  {
    title: "Integrações e automações prontas",
    description:
      "Conecte a Evoluke aos canais que já fazem parte do seu atendimento e mantenha o fluxo de informações sempre atualizado.",
    items: [
      "Integração oficial com WhatsApp Business Platform e Meta, incluindo templates aprovados.",
      "Widget de chat personalizável para inserir no site em minutos, sem necessidade de desenvolvedores.",
      "Conectores com Instagram, e-mail e APIs abertas para expandir a presença do agente.",
      "Disparo automático de tarefas e webhooks para atualizar sistemas internos e ERPs.",
    ],
  },
  {
    title: "Suporte e governança contínuos",
    description:
      "Mantenha o agente alinhado à estratégia da sua marca sem abrir mão de controle ou qualidade.",
    items: [
      "Fluxos de aprovação para novas respostas e ajustes na base de conhecimento.",
      "Histórico completo de conversas, revisões e iterações realizado no painel.",
      "Perfis de acesso dedicados para marketing, vendas, suporte e parceiros.",
      "Materiais de capacitação e sessões de acompanhamento com especialistas Evoluke.",
    ],
  },
  {
    title: "Análises e evolução baseada em dados",
    description:
      "Transforme interações em insights acionáveis para os times comerciais e de atendimento.",
    items: [
      "Dashboards com taxa de resolução, satisfação e volume de contatos em tempo real.",
      "Alertas automáticos quando indicadores fogem do esperado ou precisam de atenção humana.",
      "Exportação de relatórios e integração com ferramentas de BI via CSV ou API.",
      "Sugestões de melhoria geradas pela IA com base nas principais dúvidas e objeções dos clientes.",
    ],
  },
];

const slides = [
  {
    title: "O que fazemos",
    content: (
      <>
        <p>
          Permitimos que sua empresa crie e personalize um agente virtual com inteligência artificial de forma simples e rápida.
          Integrado ao nosso CRM, ele responde dúvidas, coleta informações, qualifica leads e transfere para um atendente humano
          sempre que necessário — garantindo agilidade, eficiência e uma experiência impecável para seus clientes.
        </p>
        <p className="mt-4">
          Nosso agente aprende com os materiais que você disponibiliza, mantém o tom de voz da marca e evolui continuamente a cada
          interação, reduzindo filas e aumentando o volume de oportunidades qualificadas.
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
          <p>
            Oriente seu time (marketing/TI) quando for necessária alguma ação no site ou número de WhatsApp.
          </p>
          <p className="mt-2 font-medium">Pós-ativação (primeiros dias)</p>
          <p>Acompanhe o painel por 48–72h, respondendo alertas de melhoria sugeridos.</p>
          <p>
            Ajuste mensagens, rotas de transferência e base de conhecimento conforme dúvidas reais dos clientes.
          </p>
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
          <span className="font-medium">Posso pausar o agente?</span> Sim, você pode desativar ou pausar pelo painel a qualquer momento
          sem perder as configurações.
        </li>
        <li>
          <span className="font-medium">Posso ter múltiplos agentes?</span> Sim. Crie agentes diferentes para funções, marcas ou números distintos
          com gestão centralizada.
        </li>
        <li>
          <span className="font-medium">Como pedir suporte?</span> Abra um ticket pelo painel, fale com nosso time via chat ou agende sessões de
          acompanhamento quinzenais.
        </li>
        <li>
          <span className="font-medium">Como fica a privacidade dos dados?</span> Você define mensagens de consentimento e políticas. Os dados são
          armazenados de forma segura e utilizados apenas para operação do agente e melhorias autorizadas.
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
        <p className="mt-4">
          Combine os dados do agente com relatórios do CRM para visualizar o impacto direto em conversões e receita.
        </p>
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
        <p className="mt-4">
          Assim, seu time mantém o foco em estratégia enquanto o agente cuida do atendimento e coleta insights relevantes.
        </p>
      </>
    ),
  },
];

export default function LearnMore() {
  const [current, setCurrent] = useState(0);
  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <>
      <section className="border-b bg-muted/40 py-10 md:py-16">
        <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Saiba mais sobre a Evoluke</span>
          <h1 className="mt-4 text-3xl font-bold md:text-4xl">
            Tudo o que você precisa para lançar um agente de IA confiável e orientado a resultados
          </h1>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
            A Evoluke combina IA generativa, CRM integrado e suporte especializado para que empresas transformem seus canais de
            atendimento em uma máquina de relacionamento e vendas, sem perder o toque humano.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => (
              <div key={item.title} className="flex flex-col gap-2 rounded-xl border bg-background p-5 shadow-sm">
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 lg:py-16">
        <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              className="rounded border px-3 py-1 text-sm transition-colors hover:bg-gray-200 hover:text-black"
              onClick={prev}
              aria-label="Anterior"
            >
              Anterior
            </button>
            <div className="flex items-center justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Ir para seção ${i + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    i === current ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <button
              className="rounded border px-3 py-1 text-sm transition-colors hover:bg-gray-200 hover:text-black"
              onClick={next}
              aria-label="Próximo"
            >
              Próximo
            </button>
          </div>
          <div className="mb-6 rounded-xl border bg-background p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-semibold">{slides[current].title}</h2>
            <div className="space-y-2 text-sm text-muted-foreground" aria-live="polite">
              {slides[current].content}
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              className="rounded border px-3 py-1 text-sm transition-colors hover:bg-gray-200 hover:text-black"
              onClick={prev}
              aria-label="Anterior"
            >
              Anterior
            </button>
            <div className="flex items-center justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Ir para seção ${i + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    i === current ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <button
              className="rounded border px-3 py-1 text-sm transition-colors hover:bg-gray-200 hover:text-black"
              onClick={next}
              aria-label="Próximo"
            >
              Próximo
            </button>
          </div>
        </div>
      </section>    

      <section className="border-t bg-muted/30 py-12 md:py-16">
        <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6">
          <div className="flex flex-col items-center gap-6 text-center md:gap-8">
            <h3 className="text-2xl font-semibold md:text-3xl">Pronto para ver um agente em ação?</h3>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
              Agende uma demonstração personalizada ou confira nossos planos para entender como a Evoluke pode acelerar a
              experiência de atendimento e vendas da sua empresa.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
              >
                Falar com um especialista
              </Link>
              <Link
                href="/pricing"
                className="inline-flex w-full items-center justify-center rounded-md border border-input px-6 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:w-auto"
              >
                Ver planos e preços
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

