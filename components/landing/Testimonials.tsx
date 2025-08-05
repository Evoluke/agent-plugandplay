"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Maria Silva",
    role: "CEO, Empresa X",
    text: "Plataforma incrível! Aumentamos nossa eficiência em poucos dias.",
  },
  {
    name: "João Souza",
    role: "Gerente, Startup Y",
    text: "Ferramenta essencial para o nosso atendimento ao cliente.",
  },
  {
    name: "Ana Lima",
    role: "Consultora",
    text: "Interface simples e recursos poderosos. Recomendo!",
  },
];

export default function Testimonials() {
  return (
    <section>
      <div className="mx-auto max-w-[1140px] px-3 py-8 md:px-4 md:py-12 lg:px-6 lg:py-16">
        <h2 className="mb-2 text-center text-3xl font-bold">O que dizem</h2>
        <p className="mb-12 text-center text-muted-foreground">
          Depoimentos de alguns clientes
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map(({ name, role, text }) => (
            <Card key={name} className="h-full">
              <CardHeader className="flex flex-row gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">&quot;{text}&quot;</p>
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo.svg"
                    alt="avatar"
                    width={48}
                    height={48}
                    className="rounded-full"
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

