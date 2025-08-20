"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface Plan {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: "Básico",
    priceMonthly: 99,
    priceYearly: 999,
    features: ["Atende 24/7", "Integra CRM", "Respostas automáticas"],
  },
  {
    name: "Profissional",
    priceMonthly: 199,
    priceYearly: 1999,
    popular: true,
    features: [
      "Tudo do Básico",
      "Relatórios avançados",
      "Suporte prioritário",
      "Automação de vendas",
    ],
  },
  {
    name: "Enterprise",
    priceMonthly: 399,
    priceYearly: 3999,
    features: [
      "Tudo do Profissional",
      "SLA personalizado",
      "Treinamento dedicado",
      "Integrações ilimitadas",
    ],
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="bg-[#FAFAFA] py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold">
          Planos para todo tamanho
        </h2>
        <div className="mb-12 flex justify-center">
          <div className="inline-flex rounded-full border bg-white/90 p-1 backdrop-blur">
            <button
              className={cn(
                "px-3 py-1 text-sm rounded-full transition-all",
                !annual
                  ? "bg-primary text-white"
                  : "text-muted-foreground"
              )}
              onClick={() => setAnnual(false)}
            >
              Mensal
            </button>
            <button
              className={cn(
                "px-3 py-1 text-sm rounded-full transition-all",
                annual ? "bg-primary text-white" : "text-muted-foreground"
              )}
              onClick={() => setAnnual(true)}
            >
              Anual <span className="ml-1 text-xs text-green-600">-15%</span>
            </button>
          </div>
        </div>
        <ul className="grid gap-6 md:grid-cols-3" role="list">
          {plans.map((plan) => (
            <li key={plan.name} role="listitem">
              <Card
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden border bg-white/90 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl",
                  plan.popular ? "ring-2 ring-primary" : "border-gray-200"
                )}
              >
                {plan.popular && (
                  <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs text-white">
                    Mais popular
                  </span>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                  <p className="mb-2 text-4xl font-bold">
                    R$ {annual ? plan.priceYearly : plan.priceMonthly}
                    <span className="text-base font-normal text-muted-foreground">
                      /{annual ? "ano" : "mês"}
                    </span>
                  </p>
                  {annual && (
                    <p className="mb-4 text-xs text-green-600">Economize 15%</p>
                  )}
                  <ul className="mb-6 space-y-2">
                    {plan.features.map((feature) => (
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
                    aria-label={`Assinar o plano ${plan.name}`}
                  >
                    <Button className="w-full transition-colors group-hover:bg-primary/90">
                      Começar
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            Atende 24/7
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            Cancelamento fácil
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            Integra CRM
          </div>
        </div>
      </div>
    </section>
  );
}
