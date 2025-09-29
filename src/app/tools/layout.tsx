import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ferramentas gratuitas de crescimento comercial | Evoluke",
  description:
    "Coleção de calculadoras e recursos gratuitos para acelerar as vendas com inteligência artificial, começando pela calculadora de margem e precificação.",
  alternates: {
    canonical: "https://www.evoluke.com.br/tools",
  },
  openGraph: {
    title: "Ferramentas gratuitas de crescimento comercial | Evoluke",
    description:
      "Use nossas calculadoras e recursos para planejar precificação, margens e fluxos comerciais enquanto prepara seu time para agentes de IA.",
    url: "https://www.evoluke.com.br/tools",
    siteName: "Evoluke",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ferramentas gratuitas de crescimento comercial | Evoluke",
    description:
      "Calcule margens e otimize preços com ferramentas gratuitas enquanto conhece os benefícios dos agentes de IA da Evoluke.",
  },
  keywords: [
    "ferramentas empresariais",
    "calculadora de margem",
    "precificação",
    "lucratividade",
    "agentes de IA",
    "evoluke",
  ],
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <main className="bg-slate-50 text-slate-900">{children}</main>;
}
