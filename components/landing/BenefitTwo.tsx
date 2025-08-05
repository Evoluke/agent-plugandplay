"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function BenefitTwo() {
  const bullets = [
    "Segmentação avançada",
    "Campanhas personalizadas",
    "Suporte 24/7",
    "Escalabilidade garantida",
  ];

  return (
    <section className="py-8 md:py-12 lg:py-16">
      <div className="mx-auto grid w-full max-w-[1140px] grid-cols-1 items-center gap-8 px-3 md:px-4 lg:px-6 lg:grid-cols-2">
        <div className="flex justify-center">
          <Image
            src="/file.svg"
            alt="Relatório"
            width={720}
            height={540}
            className="h-auto w-full max-w-[720px]"
          />
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase text-primary">
            Benefício 2
          </span>
          <h3 className="text-2xl font-bold">Resultados que impressionam</h3>
          <p className="text-muted-foreground">
            Otimize suas campanhas e melhore a satisfação do cliente com
            tecnologia de ponta.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Button className="w-fit">Começar agora</Button>
        </div>
      </div>
    </section>
  );
}

