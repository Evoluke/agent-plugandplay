"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const plans = [
  {
    name: "Essencial",
    priceMonthly: 99,
    features: [
      "Atende 24/7",
      "Integração básica com CRM",
      "Suporte por e-mail",
    ],
  },
  {
    name: "Pro",
    priceMonthly: 199,
    popular: true,
    features: [
      "Tudo do Essencial",
      "Relatórios em tempo real",
      "Integração avançada",
      "Suporte via chat",
    ],
  },
  {
    name: "Enterprise",
    priceMonthly: 399,
    features: [
      "Consultoria dedicada",
      "SLA personalizado",
      "Integração ilimitada",
      "Atendimento por telefone",
    ],
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const discount = 0.15;

  return (
    <section id="pricing" className="bg-[#FAFAFA] py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold">
          Planos que crescem com você
        </h2>
        <p className="mb-12 text-center text-muted-foreground">
          Escolha o plano ideal para seu time
        </p>

        <div className="mb-10 flex justify-center">
          <div className="inline-flex rounded-full border bg-white/90 p-1 backdrop-blur">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${annual ? "text-muted-foreground" : "bg-primary text-white shadow"}`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`relative rounded-full px-4 py-1 text-sm font-medium transition-colors ${annual ? "bg-primary text-white shadow" : "text-muted-foreground"}`}
            >
              Anual
              <span className="absolute -top-2 right-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                -15%
              </span>
            </button>
          </div>
        </div>

        <ul className="grid gap-6 md:grid-cols-3" role="list">
          {plans.map((plan) => {
            const price = annual
              ? plan.priceMonthly * (1 - discount)
              : plan.priceMonthly;
            return (
              <li key={plan.name} role="listitem">
                <div className="group relative h-full rounded-xl bg-gradient-to-b from-primary/20 to-transparent p-[1px]">
                  {plan.popular && (
                    <span className="absolute left-1/2 top-0 -translate-y-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                      Mais popular
                    </span>
                  )}
                  <Card className="flex h-full flex-col rounded-xl bg-white/90 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl">
                    <CardHeader className="p-0">
                      <CardTitle className="mb-4 text-2xl">
                        {plan.name}
                      </CardTitle>
                      <div className="mb-4 flex items-baseline">
                        <span className="text-4xl font-bold">
                          {formatter.format(price)}
                        </span>
                        <span className="ml-1 text-sm text-muted-foreground">
                          /mês
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow p-0">
                      <ul className="mb-6 space-y-2 text-sm">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check className="mt-1 h-4 w-4 text-primary" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="mt-auto p-0">
                      <Link
                        href="/signup"
                        className="w-full"
                        aria-label={`Assinar o plano ${plan.name}`}
                      >
                        <Button className="w-full transition-colors group-hover:bg-primary/90">
                          Assinar
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

