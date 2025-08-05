"use client";

import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    text: "A plataforma revolucionou nosso atendimento.",
    name: "Maria Silva",
    role: "CEO, Empresa X",
    avatar: "/vercel.svg",
  },
  {
    text: "Ganhamos produtividade e clientes felizes!",
    name: "João Souza",
    role: "Gerente, Loja Y",
    avatar: "/next.svg",
  },
  {
    text: "Integração simples e suporte excelente.",
    name: "Ana Paula",
    role: "CTO, Startup Z",
    avatar: "/globe.svg",
  },
];

export default function Testimonials() {
  return (
    <section className="py-8 md:py-12 lg:py-16" id="testemunhos">
      <div className="mx-auto w-full max-w-[1140px] px-3 md:px-4 lg:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">O que dizem</h2>
          <p className="text-muted-foreground">Resultados reais de quem usa</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map(({ text, name, role, avatar }) => (
            <Card key={name} className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">{text}</p>
                <div className="flex items-center gap-3">
                  <Image
                    src={avatar}
                    alt={name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="text-sm">
                    <p className="font-medium">{name}</p>
                    <p className="text-muted-foreground">{role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

