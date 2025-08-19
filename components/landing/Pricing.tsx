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

const models = [
  {
    name: "Suporte Atendimento",
    description:
      "Consulta sua base de conhecimento e responde clientes 24/7.",
  },
  {
    name: "Representante de vendas (SDR)",
    description:
      "Qualifica leads, integra-se ao CRM e organiza oportunidades no kanban.",
  },
];

const price = "R$ 599/mês";
export default function Pricing() {
  return (
    <section id="modelos" className="bg-[#FAFAFA] py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold">
          Modelos prontos para uso
        </h2>
        <p className="mb-12 text-center text-muted-foreground">
          Cada modelo por {price}
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          {models.map(({ name, description }) => (
            <Card
              key={name}
              className="flex flex-col transition-shadow transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              <CardHeader>
                <CardTitle className="text-2xl">{name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="mb-4 text-2xl font-bold">{price}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
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
