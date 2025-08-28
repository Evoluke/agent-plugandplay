import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Stats from "@/components/landing/Stats";
import Benefit from "@/components/landing/Benefit";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import Pricing from "@/components/landing/Pricing";
import Script from "next/script";
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  title: "Evoluke",
  description:
    "A Evoluke oferece soluções de CRM integradas com inteligência artificial, personalizando atendimentos e automatizando processos para empresas.",
  openGraph: {
    title: "Evoluke",
    description:
      "A Evoluke oferece soluções de CRM integradas com inteligência artificial, personalizando atendimentos e automatizando processos para empresas.",
    url: baseUrl,
    siteName: "Evoluke",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Evoluke",
    description:
      "A Evoluke oferece soluções de CRM integradas com inteligência artificial, personalizando atendimentos e automatizando processos para empresas.",
  },
};

export default function HomePage() {
  return (
    <>
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
      <Script id="dify-config" strategy="afterInteractive">
        {`
          window.difyChatbotConfig = {
            token: '69wjfGN2b8dN8Unn',
            baseUrl: 'https://difyplatform.tracelead.com.br',
            inputs: {},
            systemVariables: {},
            userVariables: {},
          }
        `}
      </Script>
      <Script
        src="https://difyplatform.tracelead.com.br/embed.min.js"
        id="69wjfGN2b8dN8Unn"
        strategy="afterInteractive"
        defer
      />
      <style jsx global>{`
        #dify-chatbot-bubble-button {
          background-color: #1C64F2 !important;
          border-radius: 50% !important;
        }

        #dify-chatbot-bubble-window {
          width: 24rem !important;
          height: 40rem !important;
          border-radius: 1rem !important;
        }
      `}</style>
    </>
  );
}

