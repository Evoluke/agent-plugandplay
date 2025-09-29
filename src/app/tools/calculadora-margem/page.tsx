import Script from "next/script";
import type { Metadata } from "next";

import CalculatorClient from "./CalculatorClient";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://evoluke.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Calculadora de margem e precificação | Evoluke",
  description:
    "Calcule preço sugerido, margem real e lucro unitário em segundos e descubra como agentes de IA mantêm sua política comercial lucrativa.",
  alternates: {
    canonical: "/tools/calculadora-margem",
  },
  openGraph: {
    title: "Calculadora de margem e precificação | Evoluke",
    description:
      "Informe custos, impostos e margem desejada para descobrir automaticamente o preço ideal de venda e o lucro unitário esperado.",
    url: "/tools/calculadora-margem",
    type: "article",
    siteName: "Evoluke",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculadora de margem e precificação | Evoluke",
    description:
      "Simule margens e precificação para manter suas ofertas competitivas e prontas para automação comercial com agentes de IA.",
  },
  keywords: [
    "calculadora de margem",
    "calculadora de precificação",
    "lucro unitário",
    "precificação de serviços",
    "precificação de produtos",
    "agente de IA comercial",
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Calculadora de margem e precificação Evoluke",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: 0,
    priceCurrency: "BRL",
  },
  creator: {
    "@type": "Organization",
    name: "Evoluke",
    url: "https://www.evoluke.com.br",
  },
};

export default function MarginCalculatorPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <Script
        id="google-adsense"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9486959611066829"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <Script id="margin-calculator-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="max-w-3xl space-y-4">
        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          Ferramentas Evoluke
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Calculadora de margem e precificação
        </h1>
        <p className="text-base leading-relaxed text-slate-600">
          Descubra em poucos segundos qual preço cobrar, qual será o lucro unitário e se a sua meta de margem está realmente alinhada com os custos diretos, despesas alocadas e tributos.
        </p>
      </header>

      <div className="mt-8">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-9486959611066829"
          data-ad-slot="7060633998"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <Script id="margin-calculator-adsense" strategy="afterInteractive">
          {`(adsbygoogle = window.adsbygoogle || []).push({});`}
        </Script>
      </div>

      <div className="mt-12">
        <CalculatorClient />
      </div>
    </div>
  );
}
