import Link from "next/link";
import Script from "next/script";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Ferramentas gratuitas Evoluke",
  description:
    "Conjunto de ferramentas gratuitas para ajudar empresas a planejar precificação, margens e estratégias comerciais com apoio de IA.",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Calculadora de margem e precificação",
      url: "https://www.evoluke.com.br/tools/calculadora-margem",
    },
  ],
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Script
        id="google-adsense"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9486959611066829"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <Script id="tools-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="space-y-6 text-center">
        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          Ferramentas gratuitas Evoluke
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Otimize margens e descubra oportunidades com recursos gratuitos
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600">
          Reunimos ferramentas simples para gerar valor imediato ao seu negócio enquanto você conhece como os agentes de IA da Evoluke potencializam sua operação comercial.
        </p>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Nova</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Calculadora de margem e precificação</h2>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
            Descubra o preço de venda ideal, valide sua margem real e estime o lucro unitário antes de colocar uma oferta no mercado.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="font-medium text-slate-900">Perfeita para produtos, serviços e assinaturas.</p>
            <Link
              href="/tools/calculadora-margem"
              className="inline-flex items-center rounded-full bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary/90"
            >
              Acessar ferramenta
            </Link>
          </div>
        </article>

        <article className="flex flex-col justify-center rounded-2xl border border-dashed border-slate-300 bg-white/40 p-6 text-center">
          <h2 className="text-lg font-semibold text-slate-900">Em breve</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Novas calculadoras e roteiros de inteligência artificial serão adicionados aqui. Deixe seu e-mail na ferramenta para ser avisado.
          </p>
        </article>
      </section>
    </div>
  );
}
