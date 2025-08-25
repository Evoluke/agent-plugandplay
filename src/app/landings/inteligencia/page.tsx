import Hero from "@/components/landings/inteligencia/Hero";
import Features from "@/components/landings/inteligencia/Features";
import Steps from "@/components/landings/inteligencia/Steps";
import CTA from "@/components/landings/inteligencia/CTA";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inteligência no Atendimento",
  description: "Automatize e personalize o atendimento com IA.",
};

export default function InteligenciaPage() {
  return (
    <>
      <Hero />
      <Features />
      <Steps />
      <CTA />
    </>
  );
}

