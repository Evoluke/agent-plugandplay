import type { Metadata } from "next";
import { MarginCalculatorForm } from "@/components/tools/MarginCalculatorForm";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://evoluke.com.br";
const pageTitle = "Calculadora de margem e precificação gratuita";
const pageDescription =
  "Simule custos, impostos e margens para descobrir o preço ideal de venda e o lucro unitário da sua empresa.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/tools/calculadora-margem",
  },
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "calculadora de margem",
    "calculadora de precificação",
    "lucro unitário",
    "formação de preço",
    "gestão financeira para pequenas empresas",
  ],
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: `${baseUrl}/tools/calculadora-margem`,
    siteName: "Evoluke",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
  },
};

export default function MarginCalculatorPage() {
  return (
    <main className="bg-gradient-to-b from-background to-muted/30">
      <MarginCalculatorForm />
    </main>
  );
}
