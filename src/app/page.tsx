import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { AdSlot } from "@/components/adsense/AdSlot";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://curriculo-ia.pro";

const pageDescription =
  "Gere currículos profissionais com inteligência artificial, otimize para ATS, personalize por vaga e exporte em PDF ou DOCX sem esforço.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  alternates: { canonical: "/" },
  title: "Construtor de Currículos com IA | Currículo IA Pro",
  description: pageDescription,
  openGraph: {
    title: "Construtor de Currículos com IA",
    description: pageDescription,
    url: baseUrl,
    siteName: "Currículo IA Pro",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Construtor de Currículos com IA",
    description: pageDescription,
  },
};

const heroHighlights = [
  "Templates aprovados por recrutadores",
  "Resumo e bullets otimizados para ATS",
  "Exportações ilimitadas na versão premium",
];

const benefits = [
  {
    title: "Resumo profissional com IA",
    description:
      "Nosso prompt proprietário combina suas experiências com tendências de mercado para gerar resumos objetivos e impactantes.",
  },
  {
    title: "Otimização automática para ATS",
    description:
      "Analise descrições de vaga, identifique palavras-chave críticas e adapte cada seção em segundos.",
  },
  {
    title: "Cartas de apresentação em um clique",
    description:
      "Crie cover letters alinhadas com o tom da empresa e com referências às conquistas citadas no currículo.",
  },
  {
    title: "PDF, DOCX e múltiplos layouts",
    description:
      "Escolha entre 6 modelos responsivos, com marca d'água removida e exportações ilimitadas no plano premium.",
  },
];

const faq = [
  {
    question: "O que está incluído na versão gratuita?",
    answer:
      "Você pode gerar um currículo completo com GPT-4o mini, exportar 1 PDF por dia e fazer 1 revisão de conteúdo diária.",
  },
  {
    question: "Como funcionam as otimizações para ATS?",
    answer:
      "Cole a descrição da vaga e a IA ajusta resumo, bullets e skills para destacar palavras-chave relevantes sem perder naturalidade.",
  },
  {
    question: "Posso cancelar o plano premium quando quiser?",
    answer:
      "Sim. A assinatura é mensal via Asaas. Ao cancelar, você mantém acesso premium até o fim do ciclo vigente.",
  },
  {
    question: "Meus dados ficam seguros?",
    answer:
      "Utilizamos Supabase com RLS, criptografia em repouso e não compartilhamos suas informações com terceiros.",
  },
];

export default function HomePage() {
  return (
    <>
      <Script id="softwareapplication-schema" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Currículo IA Pro',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          description: pageDescription,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'BRL',
            price: '0.00',
            availability: 'https://schema.org/InStock',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            ratingCount: '327',
          },
        })}
      </Script>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <header className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-12 pt-16 text-center sm:pt-24">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#E0F2FE] px-4 py-1 text-sm font-medium text-[#0369A1]">
            IA especializada em currículos profissionais
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Construa um currículo irresistível com inteligência artificial em minutos
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-neutral-700">
            Preencha o assistente passo a passo, deixe a IA resumir suas conquistas e exporte versões personalizadas para cada vaga.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/gerar-curriculo"
              className="rounded-full bg-[var(--primary)] px-6 py-3 text-base font-semibold text-white transition hover:bg-[var(--primary-hover)]"
            >
              Gerar currículo grátis
            </Link>
            <Link
              href="#planos"
              className="rounded-full border border-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--primary)] transition hover:bg-[var(--primary)] hover:text-white"
            >
              Conhecer plano premium
            </Link>
          </div>
          <ul className="mx-auto flex flex-col gap-2 text-sm text-neutral-600 sm:flex-row sm:gap-6">
            {heroHighlights.map((highlight) => (
              <li key={highlight} className="flex items-center justify-center gap-2">
                <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                {highlight}
              </li>
            ))}
          </ul>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24">
          <section className="grid gap-10 rounded-3xl bg-white p-8 shadow-lg shadow-[rgba(47,111,104,0.15)] md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-neutral-900">Fluxo completo: do cadastro ao download</h2>
              <ol className="space-y-4 text-neutral-700">
                <li>
                  <strong>1. Wizard inteligente.</strong> Informe dados pessoais, experiências, formações, skills, certificações e idiomas com salvamento automático no Supabase.
                </li>
                <li>
                  <strong>2. Geração com IA.</strong> O endpoint <code className="rounded bg-neutral-100 px-2 py-1">/api/resume/generate</code> produz resumo, bullets, versão para ATS, tradução opcional e carta de apresentação.
                </li>
                <li>
                  <strong>3. Editor modular.</strong> Reordene blocos por <em>drag and drop</em>, reescreva bullets premium e compare templates em tempo real.
                </li>
                <li>
                  <strong>4. Exportação segura.</strong> Baixe PDF ou DOCX com marca d&apos;água removida no premium e histórico de exportações por perfil.
                </li>
              </ol>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <h3 className="text-lg font-semibold text-neutral-900">Monetização híbrida</h3>
              <p className="text-sm text-neutral-700">
                Assinaturas recorrentes via Asaas (R$ 19-29/mês) habilitam GPT-4.1, templates extras, exportações ilimitadas e cartas de apresentação.
              </p>
              <p className="text-sm text-neutral-700">
                O Google AdSense completa a receita com slots dedicados na landing, pós-geração e blog.
              </p>
              <AdSlot slot="4398761234" className="min-h-[120px]" />
            </div>
          </section>

          <section className="grid gap-8 md:grid-cols-2">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-neutral-900">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-700">{benefit.description}</p>
              </article>
            ))}
          </section>

          <section
            id="planos"
            className="grid gap-8 rounded-3xl bg-gradient-to-br from-[#2F6F68] via-[#255852] to-[#1E3A34] p-10 text-white md:grid-cols-2"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold">Versão freemium e premium transparente</h2>
              <p className="text-sm text-neutral-100">
                O plano gratuito libera 1 exportação PDF por dia, 1 revisão e acesso ao modelo clássico. A assinatura mensal desbloqueia GPT-4.1, 4 templates premium, exportações ilimitadas, tradução automática para inglês e cartas de apresentação.
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 p-6 text-sm leading-6 text-neutral-100">
              <p>
                Pagamentos processados via <strong>Asaas</strong> com nota fiscal automática. Integração direta pela API v3 garante conciliação e atualização do status de assinatura no Supabase.
              </p>
              <p className="mt-4">
                Upgrade disponível dentro do editor, acompanhado de painel lateral comparando recursos Free vs Premium.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-semibold text-neutral-900">Perguntas frequentes</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {faq.map((item) => (
                <div key={item.question} className="space-y-2">
                  <h3 className="text-lg font-semibold text-neutral-900">{item.question}</h3>
                  <p className="text-sm leading-6 text-neutral-700">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-[var(--primary)] p-10 text-white">
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-3xl font-semibold">Pronto para destacar sua história profissional?</h2>
              <p className="text-sm text-neutral-100">
                Experimente gratuitamente e desbloqueie o poder da IA para transformar o seu currículo. Nenhum cartão é necessário para começar.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/gerar-curriculo"
                  className="rounded-full bg-white px-6 py-3 text-base font-semibold text-[var(--primary)] transition hover:bg-neutral-100"
                >
                  Começar agora
                </Link>
                <Link
                  href="/blog"
                  className="rounded-full border border-white px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Aprender com nossos guias
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-neutral-200 bg-white py-8">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 px-6 text-center text-xs text-neutral-500 sm:flex-row sm:justify-between">
            <span>© {new Date().getFullYear()} Currículo IA Pro. Todos os direitos reservados.</span>
            <div className="flex gap-4">
              <Link href="/terms">Termos</Link>
              <Link href="/privacy">Privacidade</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
