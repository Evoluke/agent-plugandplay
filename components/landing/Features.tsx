"use client";

import { useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Smile,
  Stethoscope,
  Scissors,
  Scale,
  PawPrint,
  TrendingUp,
} from "lucide-react";

const items = [
  {
    title: "Dentistas",
    description: "Agende mais consultas com um atendente 24h",
    icon: Smile,
  },
  {
    title: "Médicos",
    description: "Automatize agendamentos e reduza o tempo de resposta.",
    icon: Stethoscope,
  },
  {
    title: "Salão e Barbearia",
    description: "Responda clientes instantaneamente e tenha mais agendamentos",
    icon: Scissors,
  },
  {
    title: "Advogados",
    description: "Qualifique clientes e agilize seu atendimento jurídico.",
    icon: Scale,
  },
  {
    title: "Pet Shops",
    description: "Aumente suas vendas e marque serviços de forma rápida.",
    icon: PawPrint,
  },
  {
    title: "Info Produtores",
    description: "Venda mais com um atendimento humanizado.",
    icon: TrendingUp,
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {items.map(({ title, description, icon: Icon }, index) => (
            <div
              key={title}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="h-full opacity-0 translate-y-4 transition-all duration-500"
            >
              <Card className="h-full transition-transform duration-300 hover:shadow-lg hover:scale-105">
                <CardHeader className="p-4 sm:p-6">
                  <Icon className="mb-2 h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                  <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

