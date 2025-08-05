"use client";

import { Button } from "@/components/ui/button";

export default function FinalCTA() {
  return (
    <section className="bg-primary py-8 md:py-12 lg:py-16 text-primary-foreground">
      <div className="mx-auto flex w-full max-w-[1140px] flex-col items-center gap-4 px-3 md:px-4 lg:px-6 text-center">
        <h2 className="text-3xl font-bold">Pronto para começar?</h2>
        <p className="max-w-md text-primary-foreground/80">
          Experimente gratuitamente e veja como podemos transformar seu atendimento.
        </p>
        <Button size="lg">Criar conta</Button>
      </div>
    </section>
  );
}

