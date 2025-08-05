import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bot, MessageSquare, Users } from "lucide-react";

const items = [
  {
    title: "Automação inteligente",
    description:
      "Reduza o tempo de resposta com agentes que entendem seu negócio.",
    icon: Bot,
  },
  {
    title: "Centralização de canais",
    description: "Converse por e-mail, chat e redes sociais em um único lugar.",
    icon: MessageSquare,
  },
  {
    title: "Gestão de clientes",
    description: "Tenha histórico completo e oportunidades sempre à mão.",
    icon: Users,
  },
];

export default function Features() {
  return (
    <section className="bg-[#FAFAFA] py-8 md:py-12 lg:py-16" id="sobre">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Por que é melhor
        </h2>
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

