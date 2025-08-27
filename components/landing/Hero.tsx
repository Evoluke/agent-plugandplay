"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-[#FAFAFA] py-8 md:py-12 lg:py-16">
      <div className="mx-auto grid max-w-[1140px] items-center gap-6 md:gap-8 lg:gap-6 px-3 md:px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-12">
        <div className="space-y-4 text-center md:text-left lg:col-span-7">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Empresas inteligentes já usam IA no atendimento
          </h1>
          <p className="text-lg text-muted-foreground">
            A Evoluke integra IA a um CRM para personalizar atendimentos e automatizar processos.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Começar agora
              </Button>
            </Link>
            <Link href="/saiba-mais" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Saiba mais
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative flex justify-center lg:col-span-5">
          <Image
            src="/mascot.png"
            alt="Ilustração"
            width={600}
            height={600}
            className="h-auto w-full max-w-[600px] rounded-md"
          />
        </div>
      </div>
    </section>
  );
}

