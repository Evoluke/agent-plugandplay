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
        <p className="mb-4">A Evoluke é uma plataforma que une agentes de IA ao seu CRM multicanal para escalar o atendimento com qualidade.</p>
        <p className="mb-4">Qualquer empresa cria seu próprio agente de IA e personaliza tom, regras e conteúdos com a cara da marca.</p>
        <p className="mb-4">A integração é rápida com WhatsApp e outros canais, centralizando tudo em um só lugar.</p>
        <p className="mb-4">Os agentes entendem seu negócio, automatizam o repetitivo e garantem respostas consistentes; seu time foca no que gera valor.</p>
        <p className="mb-4">Entregamos criação ágil, histórico unificado e métricas, fluxos automatizados, mais produtividade e escala com eficiência.</p>
        <p className="mb-4">Para quem é: empresas que tratam atendimento como estratégia e querem crescer com personalização e dados centralizados.</p>
      </main>
      <Footer />
    </>
  );
}

