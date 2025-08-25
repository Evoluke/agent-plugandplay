"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="bg-primary text-primary-foreground py-12 md:py-20">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6 text-center space-y-6">
        <h2 className="text-3xl font-bold">Investimento baixo</h2>
        <p>
          Entre em contato e veja como implementar IA no atendimento com um custo
          acessível.
        </p>
        <Link href="/contact">
          <Button size="lg" variant="secondary">
            Fale conosco
          </Button>
        </Link>
      </div>
    </section>
  );
}

