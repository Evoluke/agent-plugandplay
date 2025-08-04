"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-[#FAFAFA] py-24 text-center">
      <div className="container mx-auto flex max-w-5xl flex-col items-center gap-6 px-4">
        <h1 className="text-4xl font-bold sm:text-5xl">
          Atendimento eficiente com IA
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Centralize conversas, gerencie clientes e otimize processos com
          ferramentas inteligentes.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/signup">
            <Button size="lg">Começar agora</Button>
          </Link>
          <Link href="#pricing">
            <Button variant="outline" size="lg">
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
    </section>
  );
}
