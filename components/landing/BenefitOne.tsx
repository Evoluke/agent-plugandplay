"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BenefitOne() {
  return (
    <section>
      <div className="mx-auto grid max-w-[1140px] grid-cols-1 items-center gap-8 px-3 py-8 md:grid-cols-2 md:px-4 md:py-12 lg:px-6 lg:py-16">
        <div className="flex flex-col gap-4">
          <span className="text-sm font-medium text-primary">Tag</span>
          <h2 className="text-3xl font-bold">Benefício 1</h2>
          <p className="text-muted-foreground">
            Pequena descrição do benefício e como ele ajuda seu negócio a
            crescer.
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>Ponto importante 1</li>
            <li>Ponto importante 2</li>
            <li>Ponto importante 3</li>
            <li>Ponto importante 4</li>
          </ul>
          <Link href="#">
            <Button variant="outline" className="mt-2 w-fit">
              Saiba mais
            </Button>
          </Link>
        </div>
        <div className="flex justify-center md:justify-end">
          <Image
            src="/globe.svg"
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

