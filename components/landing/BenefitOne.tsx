"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function BenefitOne() {
  const bullets = [
    "Automatização de fluxos",
    "Respostas em tempo real",
    "Integração multicanal",
    "Relatórios detalhados",
  ];

  return (
    <section className="py-8 md:py-12 lg:py-16" id="beneficios">
      <div className="mx-auto grid w-full max-w-[1140px] grid-cols-1 items-center gap-8 px-3 md:px-4 lg:px-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase text-primary">
            Benefício 1
          </span>
          <h3 className="text-2xl font-bold">Potencialize seu atendimento</h3>
          <p className="text-muted-foreground">
            Alcance mais clientes e ofereça suporte de qualidade com a ajuda de
            IA.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Button variant="outline" className="w-fit">
            Saiba mais
          </Button>
        </div>
        <div className="flex justify-center">
          <Image
            src="/window.svg"
            alt="Dashboard"
            width={720}
            height={540}
            className="h-auto w-full max-w-[720px]"
          />
        </div>
      </div>
    </section>
  );
}

