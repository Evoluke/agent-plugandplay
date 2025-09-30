"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-[#FAFAFA] py-8 md:py-12 lg:py-16">
      <div className="mx-auto grid max-w-[1140px] items-center gap-6 md:gap-8 lg:gap-6 px-3 md:px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-12">
        <div className="space-y-6 text-center md:text-left lg:col-span-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-sm font-medium text-primary">
            <span>7 dias de avaliação gratuita</span>
            <span className="hidden md:inline text-xs text-primary/70">Sem cartão de crédito</span>
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            Empresas inteligentes já usam IA no atendimento
          </h1>
          <p className="text-lg text-muted-foreground">
            A Evoluke integra IA a um CRM para personalizar atendimentos e automatizar processos, com suporte dedicado para implementar sua estratégia.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/signup?trial=7-dias" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Iniciar avaliação gratuita
              </Button>
            </Link>
            <Link href="/contato" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Falar com especialista
              </Button>
            </Link>
          </div>
          <div className="rounded-xl border border-muted bg-white/60 p-5 text-left shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Aproveite a avaliação para:</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-primary" />
                <span>Treinar um agente completo com roteiros e base de conhecimento ilimitada.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-primary" />
                <span>Automatizar atendimentos em múltiplos canais com fluxos prontos.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-primary" />
                <span>Receber onboarding guiado pela nossa equipe para acelerar a implementação.</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Após os 7 dias, escolha o plano ideal ou cancele sem compromisso.
            </p>
          </div>
        </div>
        <div className="relative flex items-center justify-center lg:col-span-3">
          <Image
            src="/mascot.png"
            alt="Mascote representando o agente de IA da Evoluke"
            width={600}
            height={600}
            priority
            fetchPriority="high"
            loading="eager"
            sizes="(min-width: 1024px) 600px, (min-width: 768px) 400px, 168px"
            className="mx-auto h-auto w-full max-w-[168px] md:max-w-[400px] lg:max-w-[600px] rounded-md"
          />
        </div>
      </div>
    </section>
  );
}

