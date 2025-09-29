import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Calculator, Mail } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Ferramentas inteligentes para empresas | Evoluke",
  description:
    "Central de ferramentas da Evoluke com calculadoras e recursos de gestão para ajudar empresas a precificar melhor e aumentar a lucratividade.",
  keywords: [
    "ferramentas empresariais",
    "calculadora de margem",
    "precificação",
    "gestão financeira",
    "Evoluke",
  ],
  alternates: {
    canonical: "/tools",
  },
};

const tools = [
  {
    slug: "calculadora-margem",
    title: "Calculadora de margem e precificação",
    description:
      "Simule rapidamente o preço de venda ideal, visualize a margem real obtida e planeje cenários de lucro unitário.",
    icon: Calculator,
  },
];

export default function ToolsPage() {
  return (
    <section className="space-y-12">
      <header className="space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Ferramentas Evoluke</p>
        <h1 className="text-3xl font-bold sm:text-4xl">
          Calcule margens de lucro e otimize sua precificação em minutos
        </h1>
        <p className="mx-auto max-w-3xl text-base text-muted-foreground">
          Explore nossa central de ferramentas digitais pensadas para gestores e empreendedores que desejam ganhar tempo,
          entender a rentabilidade real de cada produto e criar ofertas mais competitivas.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {tools.map((tool) => (
          <Card key={tool.slug} className="h-full border-primary/10 shadow-none transition hover:border-primary/40">
            <CardHeader>
              <tool.icon className="h-8 w-8 text-primary" aria-hidden />
              <CardTitle className="text-2xl font-semibold">{tool.title}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="rounded-md bg-muted/60 p-4 text-sm text-muted-foreground">
                Ideal para criar estratégias de precificação assertivas e identificar oportunidades de aumento de lucro em cada
                venda.
              </div>
              <Button asChild className="self-start">
                <Link href={`/tools/${tool.slug}`} aria-label={`Acessar ${tool.title}`}>
                  Abrir ferramenta
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <aside className="rounded-lg border border-primary/20 bg-primary/5 p-6">
        <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Novas soluções em breve</p>
            <h2 className="text-2xl font-bold">Receba novidades sobre ferramentas premium</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Inscreva-se para saber quando lançarmos precificação em massa, simulações avançadas, relatórios automatizados e
              outras experiências exclusivas.
            </p>
          </div>
          <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
            <Link href="/signup" aria-label="Criar conta gratuita e acessar novidades">
              <Mail className="mr-2 h-4 w-4" aria-hidden />
              Quero ser avisado
            </Link>
          </Button>
        </div>
      </aside>
    </section>
  );
}
