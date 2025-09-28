import type { Metadata } from "next";
import CurriculoWizard from "./CurriculoWizard";

export const metadata: Metadata = {
  title: "Gerador de Currículo com IA",
  description:
    "Monte seu currículo profissional em poucos minutos com nosso assistente gratuito de IA e baixe em PDF com a marca Evoluke.",
  alternates: {
    canonical: "/curriculo-ia",
  },
  keywords: [
    "gerador de currículo",
    "currículo com IA",
    "currículo grátis",
    "modelo de currículo",
    "currículo 2025",
  ],
};

export default function CurriculoIAPage() {
  return <CurriculoWizard />;
}
