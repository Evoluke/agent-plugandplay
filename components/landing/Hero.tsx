"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-[#FAFAFA] py-8 md:py-12 lg:py-16" id="home">
      <div className="mx-auto grid max-w-[1140px] items-center gap-8 px-3 md:px-4 lg:px-6 md:grid-cols-2">
        <div className="space-y-4 text-center md:text-left">
          <h1 className="text-4xl font-bold md:text-5xl">
            Atendimento eficiente com IA
          </h1>
          <p className="text-lg text-muted-foreground">
            Centralize conversas, gerencie clientes e otimize processos com ferramentas inteligentes.
          </p>
          <Link href="/signup" className="inline-block w-full md:w-auto">
            <Button size="lg" className="w-full md:w-auto">Começar agora</Button>
          </Link>
          <p className="text-sm text-muted-foreground">Sem cartão de crédito.</p>
        </div>
        <div className="flex justify-center md:justify-end">
          <Image
            src="/window.svg"
            alt="Screenshot do produto"
            width={480}
            height={480}
            className="h-auto w-full max-w-[480px] rounded-md object-cover"
          />
        </div>
      </div>
    </section>
  );
}
