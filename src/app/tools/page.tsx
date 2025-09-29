import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ferramentas Gratuitas para Precificação e IA | Evoluke",
  description:
    "Acesse calculadoras e recursos gratuitos de margem de lucro, conecte fluxos de WhatsApp com IA e leve os dados direto para o CRM Evoluke.",
  keywords: [
    "ferramentas empresariais",
    "calculadora de margem",
    "precificação inteligente",
    "gestão financeira",
    "recursos gratuitos Evoluke",
    "automação WhatsApp",
  ],
};

export default function ToolsPage() {
  return (
    <>
      <Header />
      <main className="bg-gradient-to-b from-slate-50 via-white to-white">
        <section className="mx-auto max-w-5xl px-4 py-16 text-center md:py-24">
          <span className="rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Ferramentas gratuitas Evoluke
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Otimize preços e margens com automações no WhatsApp
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base text-muted-foreground md:text-lg">
            Disponibilizamos utilitários criados para ajudar líderes de vendas e finanças a tomarem decisões rápidas. Use as
            calculadoras para entregar valor imediato, capture leads para fluxos automatizados de WhatsApp com IA e conecte os
            resultados diretamente ao CRM inteligente da Evoluke.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/tools/calculadora-margem">Calcular e ativar gatilho no WhatsApp</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">Conhecer as automações de WhatsApp + CRM</Link>
            </Button>
          </div>
        </section>
        <section className="border-t bg-white/90">
          <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-16 md:flex-row">
            <article className="flex-1 rounded-2xl border bg-white/80 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-foreground">Calculadora de margem e precificação</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Informe custo direto, despesas alocadas, tributos e margem alvo para obter o preço sugerido e o lucro unitário.
                Validamos os números automaticamente para garantir projeções confiáveis.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary"></span>
                  <span>Geração de leads integrada para converter visitantes em oportunidades qualificadas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary"></span>
                  <span>Resultados otimizados para SEO com conteúdo rico em palavras-chave de finanças e crescimento.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary"></span>
                  <span>Chamada direta para upgrade premium com gatilhos de WhatsApp, simulações em massa e relatórios integrados ao CRM.</span>
                </li>
              </ul>
              <Button asChild className="mt-8">
                <Link href="/tools/calculadora-margem">Disparar cálculo com IA no WhatsApp</Link>
              </Button>
            </article>
            <aside className="flex-1 rounded-2xl border bg-primary/5 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-primary">Roadmap de ferramentas</h2>
              <p className="mt-4 text-sm text-primary/80">
                Estamos construindo uma suíte completa com simuladores de cenários, checklist de implantação de IA, dashboards de
                marketing e gatilhos prontos de conversas inteligentes no WhatsApp conectados ao CRM.
              </p>
              <div className="mt-6 space-y-4 text-sm text-primary/80">
                <p>
                  • Simulador de reajuste anual com diferentes alíquotas e projeções de churn.
                </p>
                <p>• Calculadora de CAC vs. LTV para avaliar a saúde das campanhas.</p>
                <p>• Relatórios em PDF e automações de envio direto para o CRM.</p>
              </div>
              <Button asChild variant="outline" className="mt-8 border-primary text-primary hover:bg-primary hover:text-white">
                <Link href="/signup">Receber novidades das automações no WhatsApp</Link>
              </Button>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
