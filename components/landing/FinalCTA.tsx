"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FinalCTA() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-[1140px] flex-col items-center px-3 py-8 text-center md:px-4 md:py-12 lg:px-6 lg:py-16">
        <h2 className="mb-2 text-3xl font-bold">Pronto para começar?</h2>
        <p className="mb-6 max-w-2xl text-lg opacity-90">
          Experimente todas as funcionalidades e transforme seu atendimento.
        </p>
        <Link href="/signup">
          <Button size="lg" variant="secondary">
            Criar conta
          </Button>
        </Link>
      </div>
    </section>
  );
}

