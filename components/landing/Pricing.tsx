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
    tagline: "Responde dúvidas e auxilia clientes.",
    features: [
      "Consulta base de conhecimento",
      "Integra CRM",
      "Atende 24/7"],
  },
  {
    name: "Representante de vendas (SDR)",
    tagline: "Qualifica leads e agenda no calendário.",
    features: [
      "Qualifica leads automaticamente",
      "Integra CRM",
      "Atende 24/7",
    ],
    popular: true,
  },
  {
    name: "Pré-Qualificação",
    tagline: "Pré-qualifica leads e transfere para atendimento humano",
    features: [
      "Pré-qualifica leads automaticamente",
      "Integra CRM",
      "Atende 24/7",
    ],
  },
];

const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Pricing() {
  const billing: "monthly" | "annual" = "monthly";
  const price =
    billing === "monthly"
      ? formatPrice(PRICE_MONTHLY)
      : formatPrice(PRICE_ANNUAL);
  const suffix = billing === "monthly" ? "/mês" : "/ano";

  return (
    <section id="modelos" className="bg-[#FAFAFA] py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="mb-2 text-center text-3xl font-bold">
          Modelos prontos para uso
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Inclui até 5.000 mensagens de IA
        </p>
        <ul
          className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3"
          role="list"
        >
          {plans.map(({ name, tagline, features, popular }) => (
            <li
              key={name}
              role="listitem"
              className="h-full"
            >
              <div className="group h-full rounded-xl bg-gradient-to-br from-purple-500/40 to-blue-500/40 p-[2px] transition-all hover:-translate-y-1 hover:shadow-xl">
                <Card className="relative flex h-full flex-col rounded-[calc(theme(borderRadius.lg)-2px)] bg-white/90 p-3 backdrop-blur">
                  {popular && (
                    <span className="absolute right-4 top-2 rounded-full bg-primary px-2 py-1 text-xs font-medium text-white">
                      Mais popular
                    </span>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="mb-4 text-xl font-bold">
                      {price}
                      <span className="text-sm font-normal text-muted-foreground">
                        {suffix}
                      </span>
                    </p>
                    <p className="mb-3 text-xs text-muted-foreground">{tagline}</p>
                    <ul className="space-y-1">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start text-xs">
                          <Check className="mr-2 h-3 w-3 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex flex-col items-center space-y-2">
                    <Link
                      href="/signup"
                      className="w-full"
                      aria-label={`Assinar o modelo ${name}`}
                    >
                      <Button className="w-full transition-colors group-hover:bg-primary/90">
                        Assinar
                      </Button>
                    </Link>
                    <p className="text-[8px] text-muted-foreground text-center">
                      Mensagens adicionais têm custo extra de R$ 0,0599 por
                      mensagem.
                    </p>
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
