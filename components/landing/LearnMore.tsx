"use client";

import Link from "next/link";
import { useState } from "react";

import { learnMoreHighlights, learnMoreSlides } from "./learn-more-content";

export default function LearnMore() {
  const [current, setCurrent] = useState(0);
  const next = () => setCurrent((prev) => (prev + 1) % learnMoreSlides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + learnMoreSlides.length) % learnMoreSlides.length);

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
            {learnMoreHighlights.map((item) => (
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
              {learnMoreSlides.map((_, i) => (
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
            <h2 className="mb-4 text-xl font-semibold">{learnMoreSlides[current].title}</h2>
            <div className="space-y-2 text-sm text-muted-foreground" aria-live="polite">
              {learnMoreSlides[current].content}
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
              {learnMoreSlides.map((_, i) => (
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
