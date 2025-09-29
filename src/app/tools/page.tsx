import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Calculator } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://evoluke.com.br";
const pageTitle = "Ferramentas gratuitas para calcular margem e otimizar preços";
const pageDescription =
  "Acesse ferramentas gratuitas da Evoluke para estruturar sua precificação, calcular margens reais e planejar ofertas premium.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/tools",
  },
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "ferramentas empresariais",
    "calculadora de margem",
    "precificação inteligente",
    "gestão financeira",
    "crm evoluke",
  ],
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: `${baseUrl}/tools`,
    siteName: "Evoluke",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
  },
};

const tools = [
  {
    title: "Calculadora de margem e precificação",
    description:
      "Descubra o preço de venda ideal e visualize imediatamente o impacto na margem e no lucro unitário.",
    href: "/tools/calculadora-margem",
    icon: Calculator,
    highlight: "Nova",
  },
];

export default function ToolsLandingPage() {
  return (
    <main className="bg-gradient-to-b from-background to-muted/40">
      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <span className="text-primary font-semibold uppercase tracking-wide">Ferramentas</span>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          Acelere sua estratégia com ferramentas gratuitas da Evoluke
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
          Comece pelas calculadoras gratuitas para validar suas margens e aprenda como elevar o faturamento. Ao criar uma conta,
          você desbloqueia recursos premium, como precificação em massa, cenários automáticos e relatórios em tempo real.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup">
            <Button size="lg">Criar conta grátis</Button>
          </Link>
          <Link href="/pricing" className="flex items-center text-primary hover:text-primary/80">
            Planos premium
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="bg-background/80">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Card key={tool.href} className="relative overflow-hidden border-primary/10">
              {tool.highlight ? (
                <span className="bg-primary/10 text-primary absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold uppercase">
                  {tool.highlight}
                </span>
              ) : null}
              <CardHeader className="pb-2">
                <tool.icon className="text-primary h-10 w-10" aria-hidden="true" />
                <CardTitle className="text-xl font-semibold">{tool.title}</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link
                  href={tool.href}
                  className="text-primary hover:text-primary/80 inline-flex items-center font-semibold"
                  aria-label={`Acessar ${tool.title}`}
                >
                  Acessar ferramenta
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <div className="grid gap-8 rounded-2xl border border-primary/10 bg-card p-8 shadow-lg sm:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Transforme insights em lucro recorrente
            </h2>
            <p className="mt-3 text-muted-foreground">
              Use as ferramentas para entregar valor imediato e colete leads qualificados. Depois, convide sua equipe para testar o
              plano premium com automações de CRM, agentes de IA e integrações omnicanal.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full">
                Entrar e salvar meus cálculos
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" className="w-full">
                Conhecer o plano premium
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
