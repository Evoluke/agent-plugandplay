"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BenefitTwo() {
  return (
    <section className="bg-[#FAFAFA]">
      <div className="mx-auto grid max-w-[1140px] grid-cols-1 items-center gap-8 px-3 py-8 md:grid-cols-2 md:px-4 md:py-12 lg:px-6 lg:py-16">
        <div className="order-2 flex flex-col gap-4 md:order-1">
          <span className="text-sm font-medium text-primary">Tag</span>
          <h2 className="text-3xl font-bold">Benefício 2</h2>
          <p className="text-muted-foreground">
            Outro benefício importante para destacar o valor do produto.
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>Ponto relevante 1</li>
            <li>Ponto relevante 2</li>
            <li>Ponto relevante 3</li>
            <li>Ponto relevante 4</li>
          </ul>
          <Link href="#">
            <Button className="mt-2 w-fit">Começar agora</Button>
          </Link>
        </div>
        <div className="order-1 flex justify-center md:order-2 md:justify-start">
          <Image
            src="/window.svg"
            alt="Benefício"
            width={720}
            height={540}
            className="h-auto w-full max-w-[720px] rounded-lg"
          />
        </div>
      </div>
    </section>
  );
}

