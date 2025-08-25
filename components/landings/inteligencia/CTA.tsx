"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="bg-primary text-primary-foreground py-12 md:py-20">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6 text-center space-y-6">
        <h2 className="text-3xl font-bold">Pronto para oferecer atendimento inteligente?</h2>
        <p>Crie sua conta gratuitamente e implemente IA no seu atendimento hoje mesmo.</p>
        <Link href="/signup">
          <Button size="lg" variant="secondary">
            Criar conta
          </Button>
        </Link>
      </div>
    </section>
  );
}

