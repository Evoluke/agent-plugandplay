"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-[#FAFAFA] py-12 md:py-20">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6 text-center space-y-6">
        <h1 className="text-4xl font-bold sm:text-5xl">
          Atendimento inteligente para seu negócio
        </h1>
        <p className="text-lg text-muted-foreground">
          Utilize agentes com IA para responder seus clientes com rapidez e eficiência.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row justify-center">
          <Link href="/signup">
            <Button size="lg">Começar agora</Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg">
              Fale conosco
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

