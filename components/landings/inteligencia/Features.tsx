"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bot, MessageSquare, LineChart } from "lucide-react";

const items = [
  {
    title: "Chatbots treinados",
    description: "Configure assistentes virtuais que entendem o contexto das conversas.",
    icon: Bot,
  },
  {
    title: "Centralização de canais",
    description: "Integre WhatsApp e outros canais em um único painel.",
    icon: MessageSquare,
  },
  {
    title: "Relatórios em tempo real",
    description: "Acompanhe métricas de atendimento com dashboards intuitivos.",
    icon: LineChart,
  },
];

export default function Features() {
  return (
    <section className="py-12 md:py-20" id="features">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6">
        <h2 className="mb-8 text-center text-3xl font-bold">Recursos</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

