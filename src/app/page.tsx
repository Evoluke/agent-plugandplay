import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Benefit from "@/components/landing/Benefit";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import Pricing from "@/components/landing/Pricing";
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
        <Benefit
          tag="IA + CRM"
          title="Personalize atendimentos com IA"
          description="A Evoluke usa inteligência artificial para automatizar respostas e entender o contexto dos seus clientes."
          bullets={[
            "Respostas rápidas e precisas",
            "Aprendizado contínuo",
            "Serviços sob demanda",
            "Escalabilidade",
          ]}
          cta="Saiba mais"
          href="/saiba-mais"
          image="/window.svg"
        />
        <Benefit
          tag="Omnichannel"
          title="Centralize todos os canais"
          description="Integre e-mail, chat, redes sociais e acompanhe todo o histórico em um único lugar."
          bullets={[
            "Visão 360º do cliente",
            "Registro automático",
            "Busca avançada",
            "Análises em tempo real",
          ]}
          cta="Começar agora"
          href="/signup"
          image="/file.svg"
          reverse
          primary
        />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}

