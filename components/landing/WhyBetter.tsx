"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bot, MessageSquare, Users } from "lucide-react";

const items = [
  {
    title: "Automação inteligente",
    description: "Reduza tempo com respostas automatizadas e precisas.",
    icon: Bot,
  },
  {
    title: "Comunicação unificada",
    description: "Integre diferentes canais de forma simples.",
    icon: MessageSquare,
  },
  {
    title: "Gestão de clientes",
    description: "Tenha visão 360º do relacionamento com cada contato.",
    icon: Users,
  },
];

export default function WhyBetter() {
  return (
    <section className="py-8 md:py-12 lg:py-16" id="por-que">
      <div className="mx-auto w-full max-w-[1140px] px-3 md:px-4 lg:px-6">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Por que é melhor
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ title, description, icon: Icon }) => (
            <Card key={title} className="text-center">
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

