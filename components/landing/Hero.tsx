"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-[#FAFAFA] py-8 md:py-12 lg:py-16">
      <div className="animate-fade-in mx-auto grid max-w-[1140px] items-center gap-6 md:gap-8 lg:gap-6 px-3 md:px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-12">
        <div className="space-y-4 text-center md:text-left lg:col-span-7">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Transforme cada interação em oportunidade com IA
          </h1>
          <p className="text-lg text-muted-foreground">
            Conecte-se com clientes em segundos e conquiste resultados desde o primeiro atendimento.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Começar agora
              </Button>
            </Link>
            <Link href="#solucoes" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Ver soluções
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex justify-center lg:col-span-5">
          <video
            src="/hero.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="h-auto w-full max-w-[480px] rounded-md"
          />
        </div>
      </div>
    </section>
  );
}

