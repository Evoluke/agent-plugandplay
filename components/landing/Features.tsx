import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bot, MessageSquare, Users } from "lucide-react";

const items = [
  {
    title: "IA integrada",
    description:
      "Automatize processos e personalize atendimentos com inteligência artificial.",
    icon: Bot,
  },
  {
    title: "CRM Omnichannel",
    description: "Conecte e-mail, chat, redes sociais e mais em uma plataforma única.",
    icon: MessageSquare,
  },
  {
    title: "Suporte especializado",
    description: "Conte com nossa equipe para implementar soluções sob medida.",
    icon: Users,
  },
];

export default function Features() {
  return (
    <section className="bg-[#FAFAFA] py-8 md:py-12 lg:py-16" id="solucoes">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6">
        <h2 className="mb-8 text-center text-3xl font-bold">Soluções</h2>
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

