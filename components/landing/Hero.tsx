"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-[#FAFAFA] py-8 md:py-12 lg:py-16">
      <div className="mx-auto grid w-full max-w-[1140px] grid-cols-1 items-center gap-8 px-3 md:px-4 lg:px-6 lg:min-h-[560px] lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold md:text-5xl">
            Atendimento eficiente com IA
          </h1>
          <p className="text-lg text-muted-foreground">
            Centralize conversas, gerencie clientes e otimize processos com
            ferramentas inteligentes.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/signup" className="sm:w-auto w-full">
              <Button size="lg" className="w-full">
                Começar agora
              </Button>
            </Link>
            <Link href="#pricing" className="sm:w-auto w-full">
              <Button variant="outline" size="lg" className="w-full">
                Conhecer planos
              </Button>
            </Link>
          </div>
          <Link
            href="/login"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Já possui conta? Entre
          </Link>
        </div>
        <div className="flex justify-center">
          <Image
            src="/globe.svg"
            alt="Ilustração"
            width={480}
            height={480}
            className="h-auto w-full max-w-[480px]"
          />
        </div>
      </div>
    </section>
  );
}
