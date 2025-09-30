import type { Metadata } from "next";
import Link from "next/link";

import {
  learnMoreHighlights,
  learnMoreSlides,
} from "@/components/landing/learn-more-content";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://evoluke.com.br";
const title = "Recursos completos para agentes de IA";
const description =
  "Conheça em profundidade como os agentes de IA Evoluke operam com CRM próprio, governança e integração oficial com WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/landing/recursos",
  },
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${baseUrl}/landing/recursos`,
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

export default function RecursosCompletosPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <section className="relative isolate overflow-hidden px-6 pb-20 pt-24 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="rounded-full border border-emerald-500/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-200">
            Recursos completos
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Tudo o que acompanha o seu agente de IA Evoluke
          </h1>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            Explore o passo a passo de implantação, governança e integrações que garantem atendimento escalável via WhatsApp e CRM próprio desde o primeiro dia da avaliação gratuita de 7 dias.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="w-full rounded-lg bg-emerald-500 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 sm:w-auto"
            >
              Iniciar avaliação gratuita
            </Link>
            <Link
              href="https://wa.me/554788533553"
              target="_blank"
              rel="noreferrer"
              className="w-full rounded-lg border border-emerald-500/40 px-5 py-3 text-center text-sm font-semibold text-emerald-200 transition hover:border-emerald-400 hover:text-white sm:w-auto"
            >
              Falar com especialistas
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 -top-36 -z-10 transform-gpu blur-3xl">
          <div className="mx-auto h-96 w-[36rem] bg-gradient-to-tr from-emerald-500/30 via-sky-500/20 to-slate-900 opacity-60" />
        </div>
      </section>

      <section className="border-y border-slate-900 bg-slate-900/60 px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-semibold sm:text-4xl">Base sólida desde o onboarding</h2>
          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            A jornada começa com um onboarding guiado e evolui continuamente com treinamento, governança e segurança integrados no CRM.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {learnMoreHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-left"
              >
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl space-y-10">
          {learnMoreSlides.map((slide) => (
            <article
              key={slide.title}
              className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 shadow-xl sm:p-10"
            >
              <h3 className="text-2xl font-semibold text-white sm:text-3xl">{slide.title}</h3>
              <div className="prose prose-invert mt-4 max-w-none text-sm sm:text-base">
                {slide.content}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-950 to-slate-950 p-8 text-center sm:p-12">
          <h2 className="text-3xl font-bold sm:text-4xl">Pronto para testar na prática?</h2>
          <p className="mt-4 text-sm text-slate-300 sm:text-base">
            Ative a avaliação gratuita de 7 dias para operar seu agente de IA no WhatsApp integrado ao CRM Evoluke, acompanhar métricas em tempo real e contar com suporte especializado.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="w-full rounded-lg bg-emerald-500 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 sm:w-auto"
            >
              Criar conta gratuita
            </Link>
            <Link
              href="https://wa.me/554788533553"
              target="_blank"
              rel="noreferrer"
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
