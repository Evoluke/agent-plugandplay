import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Benefit from "@/components/landing/Benefit";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  title: "Agent Plug and Play",
  description:
    "Centralize conversas, gerencie clientes e otimize processos com ferramentas inteligentes.",
  openGraph: {
    title: "Agent Plug and Play",
    description:
      "Centralize conversas, gerencie clientes e otimize processos com ferramentas inteligentes.",
    url: baseUrl,
    siteName: "Agent Plug and Play",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Plug and Play",
    description:
      "Centralize conversas, gerencie clientes e otimize processos com ferramentas inteligentes.",
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
          tag="Benefício"
          title="Automatize seu atendimento"
          description="Use agentes inteligentes para responder rapidamente e com precisão."
          bullets={[
            "Respostas em segundos",
            "Aprendizado contínuo",
            "Escalabilidade",
            "Personalização",
          ]}
          cta="Saiba mais"
          href="#"
          image="/window.svg"
        />
        <Benefit
          tag="Produtividade"
          title="Organize suas conversas"
          description="Centralize todos os canais e tenha histórico completo de cada cliente."
          bullets={[
            "E-mail, chat e redes sociais",
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
        <Testimonials />
        <FAQ />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}

