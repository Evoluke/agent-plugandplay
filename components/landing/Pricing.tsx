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

const plans = [
  {
    name: "Básico",
    price: "Grátis",
    features: ["Agente de IA", "Atendimento multicanal"],
  },
  {
    name: "Pro",
    price: "R$49/mês",
    features: ["Todos os recursos do Básico", "CRM completo", "Kanban"],
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    features: ["Todos do Pro", "Suporte dedicado", "Recursos avançados"],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-[#FAFAFA] py-8 md:py-12 lg:py-16">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6">
        <h2 className="mb-12 text-center text-3xl font-bold">Planos</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map(({ name, price, features }) => (
            <Card key={name} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">{name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="mb-4 text-3xl font-bold">{price}</p>
                <ul className="space-y-2 text-sm">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span>•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/signup" className="w-full">
                  <Button className="w-full">Assinar</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
