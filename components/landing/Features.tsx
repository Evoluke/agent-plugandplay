"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bot, MessageSquare, Users, Kanban } from "lucide-react";

const features = [
  {
    title: "Agente de IA",
    description: "Automatize respostas e agilize atendimentos com inteligência artificial.",
    icon: Bot,
  },
  {
    title: "Atendimento multicanal",
    description: "Conecte-se com clientes por e-mail, chat e redes sociais em um só lugar.",
    icon: MessageSquare,
  },
  {
    title: "CRM",
    description: "Gerencie contatos e oportunidades com uma visão completa do cliente.",
    icon: Users,
  },
  {
    title: "Kanban",
    description: "Organize tarefas e fluxos de trabalho com quadros visuais intuitivos.",
    icon: Kanban,
  },
];

export default function Features() {
  return (
    <section className="bg-white py-24" id="features">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="mb-12 text-center text-3xl font-bold">Recursos principais</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ title, description, icon: Icon }) => (
            <Card key={title} className="h-full">
              <CardHeader>
                <Icon className="mb-2 h-8 w-8 text-primary" />
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
