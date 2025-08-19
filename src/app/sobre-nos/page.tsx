import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre Nós - Evoluke",
  description:
    "Saiba mais sobre a Evoluke e nossa missão de transformar o atendimento com tecnologia.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="mb-4 text-3xl font-bold">Sobre Nós</h1>
        <p className="mb-4">
          A Evoluke oferece soluções de CRM integradas com inteligência
          artificial para personalizar atendimentos e automatizar processos.
        </p>
        <p>
          Nosso objetivo é ajudar empresas a construir relacionamentos mais
          eficientes e humanizados por meio de tecnologia acessível.
        </p>
      </main>
      <Footer />
    </>
  );
}

