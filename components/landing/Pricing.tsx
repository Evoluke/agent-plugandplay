"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import FAQ from "@/components/landing/FAQ";

const DISCOUNT = 0.15;

const plans = [
  {
    name: "Básico",
    monthly: 99,
    popular: false,
    features: ["Atende 24/7", "Integra CRM", "Até 1k contatos"],
  },
  {
    name: "Pro",
    monthly: 199,
    popular: true,
    features: [
      "Tudo do Básico",
      "Suporte prioritário",
      "Até 5k contatos",
    ],
  },
  {
    name: "Enterprise",
    monthly: 399,
    popular: false,
    features: [
      "Tudo do Pro",
      "Consultoria dedicada",
      "Contatos ilimitados",
    ],
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const format = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);

  const getPrice = (p: typeof plans[number]) =>
    billing === "monthly"
      ? p.monthly
      : Math.round(p.monthly * 12 * (1 - DISCOUNT));

  return (
    <>
      <section id="pricing" className="bg-[#FAFAFA] py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold">
            Escolha seu plano
          </h2>
          <div className="mx-auto mb-12 flex w-fit rounded-full border bg-white/80 p-1 text-sm backdrop-blur">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-4 py-1 ${
                billing === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={`rounded-full px-4 py-1 ${
                billing === "yearly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Anual <span className="ml-1 text-xs text-green-600">-15%</span>
            </button>
          </div>
          <ul className="grid gap-6 md:grid-cols-3" role="list">
            {plans.map((plan) => (
              <li key={plan.name} role="listitem">
                <div className="group relative h-full rounded-2xl bg-gradient-to-b from-indigo-500/30 to-purple-500/30 p-[1px] transition-all hover:-translate-y-1 hover:shadow-xl">
                  {plan.popular && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Mais popular
                    </span>
                  )}
                  <div className="flex h-full flex-col rounded-2xl bg-white/90 p-6 backdrop-blur">
                    <h3 className="mb-2 text-xl font-semibold">{plan.name}</h3>
                    <p className="mb-4 text-4xl font-bold">
                      {format(getPrice(plan))}
                      <span className="text-base font-normal text-muted-foreground">
                        {billing === "monthly" ? "/mês" : "/ano"}
                      </span>
                    </p>
                    {billing === "yearly" && (
                      <p className="mb-4 text-xs text-green-600">
                        2 meses grátis
                      </p>
                    )}
                    <ul className="mb-6 flex flex-col gap-2 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/signup"
                      className="mt-auto w-full"
                      aria-label={`Assinar o plano ${plan.name}`}
                    >
                      <Button className="w-full transition-colors group-hover:bg-primary-hover">
                        Assinar
                      </Button>
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs">
            <span className="rounded-full bg-white/80 px-3 py-1">Atende 24/7</span>
            <span className="rounded-full bg-white/80 px-3 py-1">Integra CRM</span>
            <span className="rounded-full bg-white/80 px-3 py-1">Cancelamento fácil</span>
          </div>
        </div>
      </section>
      <FAQ />
    </>
  );
}

