"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingDown, ShoppingCart, Layers, Users } from "lucide-react";

const items = [
  {
    title: "Redução de custo",
    description: "Automatize conversas e diminua despesas com atendimento.",
    icon: TrendingDown,
  },
  {
    title: "Conversão em vendas",
    description: "Transforme leads em clientes com respostas instantâneas.",
    icon: ShoppingCart,
  },
  {
    title: "Segmentos",
    description: "Adapte o agente para diferentes setores do mercado.",
    icon: Layers,
  },
  {
    title: "Usuários",
    description: "Permita que vários colaboradores acompanhem as conversas.",
    icon: Users,
  },
];

export default function Features() {
  return (
    <section className="py-12 md:py-20" id="features">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6">
        <h2 className="mb-8 text-center text-3xl font-bold">Vantagens</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ title, description, icon: Icon }) => (
            <Card key={title} className="h-full">
              <CardHeader>
                <Icon className="mb-2 h-6 w-6 text-primary" />
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

