"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Check } from "lucide-react";

const PRICE_MONTHLY = 599;
const PRICE_ANNUAL = 5990; // 2 meses grátis

const plans = [
  {
    name: "Suporte Atendimento",
    tagline: "Resposta automática para clientes.",
    features: ["Consulta base de conhecimento", "Integra CRM", "Atende 24/7"],
  },
  {
    name: "Representante de vendas (SDR)",
    tagline: "Qualifica leads e organiza oportunidades.",
    features: [
      "Qualifica leads automaticamente",
      "Integra CRM",
      "Atende 24/7",
    ],
    popular: true,
  },
];

const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Pricing() {
  // eslint-disable-next-line prefer-const
  let billing: "monthly" | "annual" = "monthly";
  const price =
    billing === "monthly"
      ? formatPrice(PRICE_MONTHLY)
      : formatPrice(PRICE_ANNUAL);
  const suffix = billing === "monthly" ? "/mês" : "/ano";

  return (
    <section id="modelos" className="bg-[#FAFAFA] py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold mb-8">
          Modelos prontos para uso
        </h2>
        <ul
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none"
          role="list"
        >
          {plans.map(({ name, tagline, features, popular }) => (
            <li
              key={name}
              role="listitem"
              className="w-80 flex-shrink-0 snap-center sm:w-auto sm:flex-shrink"
            >
              <div className="group rounded-xl bg-gradient-to-br from-purple-500/40 to-blue-500/40 p-[2px] transition-all hover:-translate-y-1 hover:shadow-xl">
                <Card className="relative flex h-full flex-col rounded-[calc(theme(borderRadius.lg)-2px)] bg-white/90 p-6 backdrop-blur">
                  {popular && (
                    <span className="absolute right-4 top-4 rounded-full bg-primary px-2 py-1 text-xs font-medium text-white">
                      Mais popular
                    </span>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="mb-6 text-4xl font-bold">
                      {price}
                      <span className="text-base font-normal text-muted-foreground">
                        {suffix}
                      </span>
                    </p>
                    <p className="mb-4 text-sm text-muted-foreground">{tagline}</p>
                    <ul className="space-y-2">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start text-sm">
                          <Check className="mr-2 h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href="/signup"
                      className="w-full"
                      aria-label={`Assinar o modelo ${name}`}
                    >
                      <Button className="w-full transition-colors group-hover:bg-primary/90">
                        Assinar
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
