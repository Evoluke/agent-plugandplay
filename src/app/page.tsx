import Script from "next/script";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Stats from "@/components/landing/Stats";
import Benefit from "@/components/landing/Benefit";
import FAQ, { FAQ_ITEMS } from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import Pricing from "@/components/landing/Pricing";
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://evoluke.com.br";
const pageTitle = "CRM com IA para atendimento omnicanal";
const pageDescription =
  "Conheça a Evoluke, plataforma que une CRM omnicanal e inteligência artificial para automatizar processos, aumentar conversões e oferecer experiências personalizadas.";

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "CRM com inteligência artificial",
    "atendimento automatizado",
    "agente virtual para vendas",
    "plataforma omnicanal",
    "automação de atendimento ao cliente",
  ],
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: baseUrl,
    siteName: "Evoluke",
    images: [
      {
        url: `${baseUrl}/logo.png`,
        alt: "Logotipo da Evoluke",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [`${baseUrl}/logo.png`],
  },
};

export default function HomePage() {
  return (
    <>
      <Script
        id="evoluke-homepage-faq-structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(faqStructuredData)}
      </Script>
      <Header />
      <main className="flex flex-col">
        <Hero />
        <Features />
        <Stats />
        <Benefit
          tag="IA + CRM"
          title="Personalize atendimentos com IA"
          description="Personalize seu Agente de IA e transforme cada interação em experiência exclusiva."
          bullets={[
            "Respostas rápidas e precisas",
            "Aprendizado contínuo",
            "Atendimento 24/7",
            "Escalabilidade",
          ]}
          cta="Saiba mais"
          href="/saiba-mais"
          image="/window.png"
          imageAlt="Interface da plataforma Evoluke integrando IA ao atendimento"
          imageWidth={600}
          imageHeight={400}
        />
        <Benefit
          tag="Omnichannel"
          title="Centralize todas as conversas"
          description="Integre seu WhatsApp e tenha todo o histórico centralizado em um só lugar."
          bullets={[
            "Visão 360º do cliente",
            "Registro automático",
            "Board Kanban",
            "Análises em tempo real",
          ]}
          cta="Começar agora"
          href="/signup"
          image="/mobile-app.avif"
          imageAlt="Aplicativo móvel da Evoluke centralizando conversas"
          imageWidth={300}
          imageHeight={600}
          reverse
          primary
        />
        <Pricing />
        {/* <Testimonials /> */}
        <FAQ />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}

