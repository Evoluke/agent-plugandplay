import type { Metadata } from "next";
import Link from "next/link";

const pageTitle = "Chatbot com IA para Dentistas | Evoluke";
const pageDescription =
  "Transforme o relacionamento com pacientes com um agente de IA preparado para clínicas odontológicas.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/landing/dentista",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: "website",
    url: "/landing/dentista",
  },
};

const benefits = [
  {
    title: "Pré-triagem inteligente",
    description:
      "Colete sintomas, indique especialidades e organize a agenda da equipe com antecedência, sem esforço manual.",
  },
  {
    title: "Retenção automática",
    description:
      "Reative pacientes com lembretes personalizados de retorno e campanhas de manutenção preventiva em poucos cliques.",
  },
  {
    title: "Assistente 24/7",
    description:
      "Responda dúvidas comuns sobre tratamentos, convênios e valores mesmo fora do horário comercial.",
  },
];

const features = [
  {
    title: "Fluxos sob medida",
    description:
      "Monte jornadas específicas para implante, ortodontia ou estética, garantindo abordagens alinhadas ao protocolo clínico.",
  },
  {
    title: "Integração com agenda",
    description:
      "Sincronize o chatbot com seu sistema de marcações e deixe o paciente escolher o melhor horário em segundos.",
  },
  {
    title: "Respostas humanizadas",
    description:
      "Treine o agente com tom acolhedor, orientações pré e pós-consulta e instruções de cuidado contínuo.",
  },
];

const testimonials = [
  {
    quote:
      "Em menos de 30 dias reduzimos faltas em 27% e liberamos a recepção para focar na experiência do paciente.",
    author: "Dra. Marina Ribeiro",
    role: "Clínica OdontoSorriso",
  },
  {
    quote:
      "O assistente entende os tratamentos e encaminha leads prontos para nossos especialistas, ganhamos tempo e confiança.",
    author: "Dr. Felipe Moraes",
    role: "Rede Sorrir Bem",
  },
];

export default function DentistLandingPage() {
  return (
    <div className="bg-white text-slate-900">
      <header className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white">
        <div className="absolute inset-x-0 -top-32 flex justify-center opacity-60">
          <div className="h-64 w-[32rem] rounded-full bg-sky-200 blur-3xl" aria-hidden="true" />
        </div>
        <div className="relative mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-20 pt-16 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:pb-24 lg:pt-24">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center justify-center rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700">
              Chatbot odontológico com IA
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              Encante pacientes com um agente virtual que fala a língua da sua clínica
            </h1>
            <p className="text-base text-slate-600 sm:text-lg">
              Automatize atendimento, pré-triagem e confirmações de consulta com um chatbot treinado para clínicas
              odontológicas. Conversas naturais, dados centralizados e equipe focada no cuidado presencial.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Começar avaliação gratuita
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-sky-200 px-6 py-3 text-sm font-semibold text-sky-700 transition hover:border-sky-300 hover:text-sky-800"
              >
                Falar com especialista
              </Link>
            </div>
            <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <span className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                Implementação guiada em 7 dias
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" aria-hidden="true" />
              <span>Treinamento incluso para a recepção</span>
            </div>
          </div>
          <div className="flex flex-1 justify-center lg:justify-end">
            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-sky-100">
              <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
                <span>Fluxo de captação</span>
                <span>IA Odonto</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-2xl bg-sky-50 p-4">
                  <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-sky-200/70" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Paciente</p>
                    <p className="text-sm text-slate-600">
                      Olá! Gostaria de saber sobre clareamento dental e valores.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4">
                  <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-sky-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Agente Evoluke</p>
                    <p className="text-sm text-slate-600">
                      Oi, tudo bem? Para clareamento oferecemos técnica a laser e caseira. Qual prefere para te explicar os
                      cuidados e valores?
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4">
                  <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Agenda</p>
                    <p className="text-sm text-slate-600">
                      Tenho horários disponíveis amanhã às 10h ou quinta às 18h. Quer reservar algum desses?
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-medium text-white">
                Conversões aumentaram 38% com confirmações automáticas
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-16 sm:px-6 lg:py-24">
        <section className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Conversão mobile-first pensada para clínicas em crescimento
            </h2>
            <p className="text-base text-slate-600">
              Cada mensagem do chatbot é otimizada para leitura rápida no celular e combina automações com toque humano. A
              Evoluke integra WhatsApp, Instagram e site para oferecer respostas contextuais e capturar dados essenciais sem
              atrito.
            </p>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                  ✓
                </span>
                Scripts personalizáveis por especialidade e estágio do tratamento.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                  ✓
                </span>
                Captação de leads integrada ao CRM com distribuição automática.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                  ✓
                </span>
                Dashboard mobile com métricas de conversão e engajamento.
              </li>
            </ul>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-xs overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-sky-100">
              <div className="space-y-4 text-sm text-slate-600">
                <div>
                  <p className="font-semibold text-slate-900">Lead gerado no Instagram</p>
                  <p>&ldquo;Vi o vídeo de lentes de contato dental, vocês atendem convênio OdontoCare?&rdquo;</p>
                </div>
                <div className="rounded-2xl bg-sky-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Playbook móvel</p>
                  <p>
                    Responda em até 3 minutos e ofereça avaliação estética gratuita. Ative a sequência automática de follow-up
                    em 2 dias.
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Próximas ações</p>
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between">
                      <span>Enviar orçamento</span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                        80% feito
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Agendar retorno</span>
                      <span className="text-xs text-slate-400">Aguardando paciente</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Tudo que sua clínica precisa em um só lugar</h2>
            <p className="mx-auto max-w-2xl text-base text-slate-600">
              Combine automações, atendimento humanizado e inteligência artificial em uma plataforma única para acelerar a
              tomada de decisão, aumentar conversões e manter pacientes informados.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                  <span className="text-base font-semibold">IA</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Resultados visíveis desde o primeiro mês</h2>
            <p className="text-base text-slate-600">
              Automatize confirmações, receba feedback e entregue orientações personalizadas enquanto sua equipe foca no
              atendimento clínico. O agente aprende com cada interação e sugere melhorias contínuas para o funil.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-3xl font-semibold text-slate-900">38%</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">Mais consultas confirmadas</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-3xl font-semibold text-slate-900">21h</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">Equipe liberada por semana</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-3xl font-semibold text-slate-900">+52%</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">Engajamento em campanhas</p>
              </div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{benefit.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-center text-2xl font-semibold text-slate-900 sm:text-3xl">Dentistas que confiam na Evoluke</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.author} className="flex h-full flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <blockquote className="text-sm text-slate-600">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-4 text-sm font-medium text-slate-900">
                  {testimonial.author}
                  <span className="block text-xs font-normal text-slate-500">{testimonial.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 py-16 text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 text-center sm:px-6">
          <h2 className="text-2xl font-semibold sm:text-3xl">Pronto para transformar a experiência no consultório?</h2>
          <p className="text-sm text-slate-300">
            Ative seu agente de IA odontológico, automatize confirmações de consulta e mantenha pacientes informados em todas as
            etapas do tratamento.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Iniciar teste gratuito
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
            >
              Agendar demonstração
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
