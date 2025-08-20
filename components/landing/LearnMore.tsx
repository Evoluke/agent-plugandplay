"use client";

import { useState } from "react";

const slides = [
  {
    title: "O que fazemos",
    content: (
      <>
        <p>
          Ajudamos sua empresa a atender e converter automaticamente em canais como
          WhatsApp, Site e Instagram, integrando tudo ao seu CRM. O agente responde
          dúvidas, coleta dados, agenda, qualifica leads e transfere para humano
          quando necessário.
        </p>
        <h3 className="mt-4 font-semibold">Benefícios em poucas linhas</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>Respostas rápidas 24/7 e redução de fila.</li>
          <li>Mais leads qualificados no CRM, com histórico organizado.</li>
          <li>Padronização de atendimento e ganhos de produtividade.</li>
          <li>Implantação rápida, sem complexidade técnica para o cliente.</li>
        </ul>
        <h3 className="mt-4 font-semibold">Como funciona (visão em 60 segundos)</h3>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Você cria o agente e escolhe sua função.</li>
          <li>Personaliza mensagens, objetivos e conteúdo de apoio.</li>
          <li>Finaliza o pagamento e libera a ativação.</li>
          <li>Conecta ao CRM e publica nos canais.</li>
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
            <li>Escolhe a função do agente (ex.: Agendamento, SDR/Vendas, Suporte).</li>
            <li>Define o nome, idioma e tom (formal, direto, acolhedor, etc.).</li>
            <li>(Opcional) Seleciona o canal principal onde ele atuará primeiro.</li>
          </ul>
          <p className="mt-2">
            Resultado: agente criado em rascunho (inativo) no painel.
          </p>
        </li>
        <li>
          <h4 className="font-semibold">Passo 2 — Personalização</h4>
          <p className="mt-2 font-medium">O que você define no painel</p>
          <ul className="list-disc pl-5">
            <li>Mensagens-chave: saudação, indisponibilidade, encerramento.</li>
            <li>Objetivos e limites: o que o agente pode e não pode fazer/dizer.</li>
            <li>Base de conhecimento: carregue documentos e links (FAQ, políticas, produtos).</li>
            <li>Regras de transferência: quando passar para um atendente humano.</li>
            <li>Horários de atendimento e fila de espera.</li>
            <li>Privacidade: comunicação clara sobre uso de dados e consentimento.</li>
            <li>Teste rápido: use o modo de simulação no painel para revisar respostas.</li>
          </ul>
          <p className="mt-2">Resultado: agente pronto para revisão e ativação.</p>
        </li>
        <li>
          <h4 className="font-semibold">Passo 3 — Pagamento</h4>
          <p className="mt-2 font-medium">Como é</p>
          <ul className="list-disc pl-5">
            <li>Escolha o plano que se encaixa no seu volume de uso.</li>
            <li>Pague via cartão, PIX ou boleto (conforme planos disponíveis).</li>
            <li>Faturamento/NF: disponível no painel.</li>
            <li>Cancelamento/upgrade: simples e direto no painel.</li>
          </ul>
          <p className="mt-2">
            Resultado: assinatura ativa libera a ativação do agente.
          </p>
        </li>
        <li>
          <h4 className="font-semibold">Passo 4 — Ativação</h4>
          <p className="mt-2 font-medium">Checklist de qualidade</p>
          <ul className="list-disc pl-5">
            <li>Linguagem alinhada à marca.</li>
            <li>Respostas corretas nos principais cenários.</li>
            <li>Regras de transferência para humano testadas.</li>
          </ul>
          <p className="mt-2">Ação: ative o agente no painel (toggle ON).</p>
          <p>Resultado: agente em produção e visível para seus clientes no canal selecionado.</p>
        </li>
        <li>
          <h4 className="font-semibold">Passo 5 — Integração com CRM</h4>
          <p className="mt-2 font-medium">O que você faz</p>
          <ul className="list-disc pl-5">
            <li>Seleciona seu CRM no painel (ex.: HubSpot, Pipedrive, RD, etc.).</li>
            <li>Conecta a conta de forma guiada.</li>
            <li>Mapeia campos essenciais: nome, e-mail, telefone, origem, estágio, responsável.</li>
            <li>Define regras: quando criar lead/contato, atualizar dados, abrir ticket.</li>
            <li>Teste: gere um lead de teste pelo agente e verifique no CRM.</li>
          </ul>
          <p className="mt-2">
            Resultado: dados fluem automaticamente entre agente e CRM.
          </p>
        </li>
        <li>
          <h4 className="font-semibold">Passo 6 — Ativação do Agente de IA nos Canais</h4>
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
    title: "Operação contínua e melhorias",
    content: (
      <>
        <h4 className="font-semibold">Métricas no painel</h4>
        <ul className="list-disc pl-5">
          <li>Taxa de resolução automática e transferências para humano.</li>
          <li>Leads/contatos gerados e qualidade dos dados no CRM.</li>
          <li>Tempo médio de resposta e satisfação (quando aplicável).</li>
        </ul>
        <h4 className="mt-4 font-semibold">Ciclo de melhoria</h4>
        <ul className="list-disc pl-5">
          <li>Revise semanalmente perguntas frequentes surgidas.</li>
          <li>Atualize a base de conhecimento e mensagens-chave.</li>
          <li>Promova pequenos ajustes nas regras de transferência.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Boas práticas (recomendado)",
    content: (
      <ul className="list-disc pl-5">
        <li>
          Seja claro: escreva respostas simples, curtas e no estilo da sua marca.
        </li>
        <li>Base enxuta: mantenha documentos curtos e atualizados.</li>
        <li>
          Escalonamento humano: defina limites e caminhos claros para atendimento
          humano.
        </li>
        <li>
          Governança: aprove mensagens-padrão com equipe jurídica/comercial quando
          necessário.
        </li>
      </ul>
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
          agentes diferentes para funções e canais distintos.
        </li>
        <li>
          <span className="font-medium">O que acontece se o pagamento falhar?</span> O
          painel avisa; regularize o método de pagamento para evitar interrupção.
        </li>
        <li>
          <span className="font-medium">Como pedir suporte?</span> Abra um ticket pelo
          painel ou use os canais de atendimento informados.
        </li>
        <li>
          <span className="font-medium">Como fica a privacidade dos dados?</span> Você
          define as mensagens de consentimento e políticas. Os dados são usados apenas
          para operação do agente e melhorias do seu atendimento.
        </li>
        <li>
          <span className="font-medium">Posso integrar com mais de um CRM?</span> Sim,
          desde que estejam disponíveis no painel. Consulte a lista atualizada.
        </li>
      </ul>
    ),
  },
  {
    title: "Suporte e contato",
    content: (
      <ul className="list-disc pl-5">
        <li>Central de ajuda e tickets: disponível no painel.</li>
        <li>Atendimento comercial: em horário comercial (BRT).</li>
        <li>Treinamentos e materiais: guias rápidos e vídeos curtos no painel.</li>
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

