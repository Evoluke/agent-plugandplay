"use client";

import { useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bot, MessageSquare, Users } from "lucide-react";

const items = [
  {
    title: "IA integrada",
    description:
      "Automatize e personalize atendimentos com inteligência artificial.",
    icon: Bot,
  },
  {
    title: "CRM Omnichannel",
    description: "Conecte Whatsapp com multiplos usuários interagindo em uma plataforma única.",
    icon: MessageSquare,
  },
  {
    title: "Suporte especializado",
    description: "Oferecemos serviços de automações e soluções sob medida.",
    icon: Users,
  },
];

export default function Features() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "translate-y-4");
            entry.target.classList.add("opacity-100", "translate-y-0");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-[#FAFAFA] py-8 md:py-12 lg:py-16" id="solucoes">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6">
        <h2 className="mb-8 text-center text-3xl font-bold">Soluções</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ title, description, icon: Icon }, index) => (
            <div
              key={title}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="h-full opacity-0 translate-y-4 transition-all duration-500"
            >
              <Card className="h-full transition-transform duration-300 hover:shadow-lg hover:scale-105">
                <CardHeader>
                  <Icon className="mb-2 h-6 w-6 text-primary" />
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

