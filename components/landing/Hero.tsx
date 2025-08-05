"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-[#FAFAFA]">
      <div className="mx-auto grid max-w-[1140px] grid-cols-1 items-center gap-8 px-3 py-8 md:grid-cols-2 md:py-12 lg:px-6 lg:py-16">
        <div className="flex flex-col gap-4 text-center md:text-left">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Atendimento eficiente com IA
          </h1>
          <p className="text-lg text-muted-foreground">
            Centralize conversas, gerencie clientes e otimize processos com
            ferramentas inteligentes.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/signup" className="sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Começar agora
              </Button>
            </Link>
            <Link href="#pricing" className="sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
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
            src="/next.svg"
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
