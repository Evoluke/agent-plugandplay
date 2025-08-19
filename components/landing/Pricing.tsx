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

const PRICE = "R$ 599,00/mês";

const models = [
  {
    name: "Suporte Atendimento",
    description:
      "Consulta sua base de conhecimento e responde seus clientes 24/7.",
  },
  {
    name: "Representante de vendas (SDR)",
    description: "Faz prospecção com CRM completo e Kanban integrado.",
  },
  {
    name: "Enterprise",
    description: "Modelo customizável com suporte dedicado e recursos avançados.",
  },
];

export default function Pricing() {
  return (
    <section id="planos" className="bg-[#FAFAFA] py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="mb-2 text-center text-3xl font-bold">Modelos prontos para uso</h2>
        <p className="mb-12 text-center text-lg font-semibold">
          Valor único de {PRICE}
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {models.map(({ name, description }) => (
            <Card key={name} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">{name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm leading-relaxed">{description}</p>
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
