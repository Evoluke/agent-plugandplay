import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Benefit from "@/components/landing/Benefit";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

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

