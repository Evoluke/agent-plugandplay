"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-[#FAFAFA] py-8 md:py-12 lg:py-16">
      <div className="mx-auto grid max-w-[1140px] items-center gap-6 md:gap-8 lg:gap-6 px-3 md:px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-12">
        <div className="space-y-4 text-center md:text-left lg:col-span-6">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Atendimento eficiente com IA
          </h1>
          <p className="text-lg text-muted-foreground">
            Centralize conversas, gerencie clientes e otimize processos com
            ferramentas inteligentes.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Começar agora
              </Button>
            </Link>
            <Link href="#sobre" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Conhecer planos
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Sem cartão de crédito
          </p>
        </div>
        <div className="flex justify-center lg:col-span-6">
          <Image
            src="/globe.svg"
            alt="Ilustração"
            width={480}
            height={480}
            className="h-auto w-full max-w-[480px] rounded-md"
          />
        </div>
      </div>
    </section>
  );
}

