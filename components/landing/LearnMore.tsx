"use client";

import { useState } from "react";

const slides = [
  {
    title: "O que fazemos",
    content: (
      <>
        <p>
          Permitimos que sua empresa crie e personalize um agente virtual com inteligência artificial de forma simples e rápida.
          Integrado ao nosso CRM, ele responde dúvidas, coleta informações,
          qualifica leads e transfere para um atendente humano sempre que necessário — garantindo agilidade,
          eficiência e uma experiência impecável para seus clientes.
        </p>
        <h3 className="mt-4 font-semibold">Benefícios em poucas linhas</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>Respostas rápidas 24/7 e redução de fila.</li>
          <li>Mais leads qualificados no CRM, com histórico organizado.</li>
          <li>Padronização de atendimento e ganhos de produtividade.</li>
          <li>Implantação rápida, sem complexidade técnica</li>
        </ul>
        <h3 className="mt-4 font-semibold">Como funciona (explicação rápida)</h3>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Você cria o agente e escolhe seu modelo.</li>
          <li>Personaliza personalidade, objetivos e conteúdo de apoio.</li>
          <li>Finaliza o pagamento e libera a ativação.</li>
          <li>Conecta ao CRM e integra ao whatsapp.</li>
          <li>Acompanha resultados e faz ajustes pelo painel.</li>
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
            <li>Escolhe o modelo do agente (ex.: SDR/Vendas, Suporte).</li>
            <li>Define o nome interno do agente.</li>
          </ul>
          <p className="mt-2">
            Resultado: agente criado em rascunho (inativo) no painel.
          </p>
        </li>
        <li>
          <h4 className="font-semibold">Passo 2 — Personalização</h4>
          <p className="mt-2 font-medium">O que você define no painel</p>
          <ul className="list-disc pl-5">
            <li>Personalidade: qual tom de voz, objetivo e limite do agente. </li>
            <li>Comportamento: quando deve escalar para atendimento humano, palavras proibidas.</li>
            <li>Onboarding: O que o agente precisa coletar de informações para qualificar o lead.</li>
            <li>Base de conhecimento: carregue documentos que servirão de referência para o agente.</li>
            <li>Instruções específicas: detalhe orientações e casos especiais.</li>
          </ul>
          <p className="mt-2">Resultado: agente pronto para pagamento.</p>
        </li>
        <li>
          <h4 className="font-semibold">Passo 3 — Pagamento</h4>
          <p className="mt-2 font-medium">Como é</p>
          <ul className="list-disc pl-5">
            <li>Após atualizar o agente de IA, a cobrança estará disponível</li>
            <li>Meios de pagamento disponíveis: cartão crédito e débito, PIX e boleto</li>
            <li>Será direcionado para nosso fornecedor Asaas, onde poderá efetuar o pagamento</li>
            <li>Mensalmente receberá uma nova cobrança para manter o agente ativo.</li>
          </ul>
          <p className="mt-2">
            Resultado: assinatura ativa e liberado a ativação do agente.
          </p>
        </li>
        <li>
          <h4 className="font-semibold">Passo 4 — Acesso ao com CRM</h4>
          <p className="mt-2 font-medium">O que você faz</p>
          <ul className="list-disc pl-5">
            <li>O link no menu lateral para acesso ao CRM será liberado.</li>
            <li>Conecta a conta de forma guiada.</li>
            <li>---</li>
            <li>---</li>
            <li>---</li>
          </ul>
          <p className="mt-2">
            Resultado: acesso ao CRM finalizado.
          </p>
        </li>
        <li>
          <h4 className="font-semibold">Passo 5 — Ativação do Agente de IA nos Canais</h4>
          <p className="mt-2 font-medium">Canais suportados</p>
          <p>WhatsApp, Site (widget de chat), Instagram, E-mail (entre outros).</p>
          <p className="mt-2 font-medium">Publicação</p>
          <p>Selecione o canal no painel e siga o passo a passo guiado.</p>
          <p>
            Oriente seu time (marketing/ti) quando for necessária alguma ação no site ou
            número de WhatsApp.
          </p>
          <p className="mt-2 font-medium">Pós-ativação (primeiros dias)</p>
          <p>Acompanhe o painel por 48–72h.</p>
          <p>
            Ajuste mensagens e base de conhecimento conforme dúvidas reais dos clientes.
          </p>
          <p className="mt-2">Resultado: agente publicamente disponível e operando.</p>
        </li>
      </ol>
    ),
  },
  {
    title: "Perguntas frequentes (FAQ)",
    content: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <span className="font-medium">Posso pausar o agente?</span> Sim, você pode
          desativar/pausar pelo painel a qualquer momento.
        </li>
        <li>
          <span className="font-medium">Posso ter múltiplos agentes?</span> Sim. Crie
          agentes diferentes para funções e números distintos.
        </li>
        <li>
          <span className="font-medium">Como pedir suporte?</span> Abra um ticket pelo
          painel.
        </li>
        <li>
          <span className="font-medium">Como fica a privacidade dos dados?</span> Você
          define as mensagens de consentimento e políticas. Os dados são usados apenas
          para operação do agente e melhorias do seu atendimento.
        </li>
      </ul>
    ),
  },
];

export default function LearnMore() {
  const [current, setCurrent] = useState(0);
  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="py-8 md:py-12 lg:py-16">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6">
        <div className="flex items-center justify-between mb-6">
          <button
            className="rounded border px-3 py-1 text-sm transition-colors hover:bg-gray-200 hover:text-black"
            onClick={prev}
            aria-label="Anterior"
          >
            Anterior
          </button>
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Ir para seção ${i + 1}`}
                className={`h-2 w-2 rounded-full ${i === current ? "bg-primary" : "bg-gray-300"
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
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">{slides[current].title}</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            {slides[current].content}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="rounded border px-3 py-1 text-sm transition-colors hover:bg-gray-200 hover:text-black"
            onClick={prev}
            aria-label="Anterior"
          >
            Anterior
          </button>
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Ir para seção ${i + 1}`}
                className={`h-2 w-2 rounded-full ${i === current ? "bg-primary" : "bg-gray-300"
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
  );
}

