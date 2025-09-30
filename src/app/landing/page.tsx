import type { Metadata } from "next";
import Link from "next/link";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://evoluke.com.br";
const title = "Landing para agentes de IA";
const description =
  "Converta visitantes em clientes com agentes de IA treinados para responder em minutos e liberar uma avaliação gratuita de 7 dias.";

const highlights = [
  {
    title: "Atendimento que escala",
    description:
      "Configure um agente inteligente em minutos, com roteiros prontos para capturar, qualificar e encaminhar leads automaticamente.",
    icon: "🤖",
  },
  {
    title: "CRM próprio integrado",
    description:
      "Centralize conversas, leads e histórico de oportunidades no nosso CRM nativo, pronto para a equipe comercial agir sem integrações extras.",
    icon: "🗂️",
  },
  {
    title: "Integração oficial com WhatsApp",
    description:
      "Conecte sua conta WhatsApp Business API e responda em escala mantendo toda a jornada registrada automaticamente no CRM.",
    icon: "💬",
  },
];

const steps = [
  {
    title: "Crie seu agente",
    description:
      "Selecione o tom de voz, conecte bases de conhecimento e inicie a avaliação gratuita de 7 dias sem cartão de crédito.",
  },
  {
    title: "Personalize jornadas",
    description:
      "Automatize perguntas frequentes, agendamento de reuniões e follow-ups com fluxos baseados em IA.",
  },
  {
    title: "Converta mais",
    description:
      "Monitore as conversas em tempo real, assuma quando necessário e transforme interações em vendas recorrentes.",
  },
];

const integrations = [{ name: "WhatsApp Business API", icon: "💬" }];

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/landing",
  },
  title,
  description,
  keywords: [
    "landing chatbot",
    "agente de ia",
    "avaliação gratuita",
    "automação de atendimento",
    "chatbot para vendas",
  ],
  openGraph: {
    title,
    description,
    url: `${baseUrl}/landing`,
    siteName: "Evoluke",
    images: [
      {
        url: `${baseUrl}/logo.png`,
        alt: "Logotipo da Evoluke",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${baseUrl}/logo.png`],
  },
};

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <section className="relative isolate overflow-hidden px-6 pb-20 pt-24 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-300">
            Agentes de IA para conversões
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Atendimento inteligente com avaliação gratuita de 7 dias
          </h1>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            Combine IA generativa com roteiros orientados a vendas para acelerar qualificações e fechar mais negócios. Comece hoje mesmo sem custos.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="w-full rounded-lg bg-emerald-500 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 sm:w-auto"
            >
              Iniciar avaliação gratuita
            </Link>
            <Link
              href="/saiba-mais"
              className="w-full rounded-lg border border-slate-700 px-5 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white sm:w-auto"
            >
              Ver recursos completos
            </Link>
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-500">
            Sem cartão de crédito • Cancelamento a qualquer momento
          </p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 -top-36 -z-10 transform-gpu blur-3xl">
          <div className="mx-auto h-96 w-[36rem] bg-gradient-to-tr from-emerald-500/30 via-sky-500/20 to-slate-900 opacity-60" />
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-12 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-emerald-500/30 via-cyan-400/20 to-transparent blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
              <p className="text-xs uppercase tracking-widest text-emerald-300">Painel em tempo real</p>
              <h2 className="mt-3 text-2xl font-semibold">Enxergue cada conversa em um só lugar</h2>
              <p className="mt-3 text-sm text-slate-300">
                O dashboard do agente mostra oportunidades em andamento, mensagens prioritárias e o impacto direto das automações em suas metas comerciais.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 text-left text-xs text-slate-200 sm:text-sm">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-slate-400">Tempo médio de resposta</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-400">1m 42s</p>
                  <p className="mt-1 text-[11px] text-emerald-300">-63% vs. atendimento humano</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-slate-400">Leads qualificados</p>
                  <p className="mt-2 text-2xl font-bold text-sky-400">+38%</p>
                  <p className="mt-1 text-[11px] text-slate-400">Últimos 30 dias</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-slate-400">Integração ativa</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    {integrations.map((integration) => (
                      <span
                        key={integration.name}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                      >
                        <span aria-hidden>{integration.icon}</span>
                        {integration.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">
              Por que evoluke
            </p>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              Capture, qualifique e converta com um agente que nunca dorme
            </h2>
            <p className="text-base text-slate-300">
              Automatize a primeira resposta, envie propostas personalizadas e encaminhe leads aquecidos para o time comercial. A IA aprende com o seu conteúdo e registra cada interação no nosso CRM, mantendo o tom da sua marca em todas as conversas no WhatsApp.
            </p>
            <ul className="space-y-5">
              {highlights.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="mt-1 text-2xl" aria-hidden>
                    {item.icon}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-300">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-900 bg-slate-900/60 px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">
              Jornada em três passos
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Comece hoje mesmo</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
              Uma avaliação gratuita de 7 dias para liberar fluxos automáticos, monitoramento em tempo real e a integração oficial com WhatsApp que alimenta nosso CRM próprio.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-left"
              >
                <span className="h-10 w-10 rounded-full bg-emerald-500/10 text-center text-sm font-semibold leading-10 text-emerald-300">
                  0{index + 1}
                </span>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-950 to-slate-950 p-8 text-center sm:p-12">
          <h2 className="text-3xl font-bold sm:text-4xl">Pronto para multiplicar suas conversões?</h2>
          <p className="mt-4 text-sm text-slate-300 sm:text-base">
            Garanta 7 dias de acesso gratuito para treinar seu agente de IA, acompanhar métricas e operar o WhatsApp integrado ao nosso CRM, sem limites de conversas.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="w-full rounded-lg bg-emerald-500 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 sm:w-auto"
            >
              Criar conta gratuita
            </Link>
            <Link
              href="/contact"
              className="w-full rounded-lg border border-emerald-500/40 px-5 py-3 text-center text-sm font-semibold text-emerald-200 transition hover:border-emerald-400 hover:text-white sm:w-auto"
            >
              Falar com especialistas
            </Link>
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-emerald-300">
            Suporte humano disponível todos os dias
          </p>
        </div>
      </section>
    </main>
  );
}
