"use client";

import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

type BenefitProps = {
  tag: string;
  title: string;
  description: string;
  bullets: string[];
  cta: string;
  href: string;
  image: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
  reverse?: boolean;
  primary?: boolean;
};

export default function Benefit({
  tag,
  title,
  description,
  bullets,
  cta,
  href,
  image,
  imageAlt,
  imageWidth = 300,
  imageHeight = 300,
  reverse,
  primary,
}: BenefitProps) {
  return (
    <section className="py-8 md:py-12 lg:py-16">
      <div className="mx-auto grid max-w-[1140px] items-center gap-6 md:gap-8 lg:gap-6 px-3 md:px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-12">
        <div className={`space-y-4 lg:col-span-6 ${reverse ? "md:order-2" : ""}`}>
          <span className="text-sm uppercase text-primary">{tag}</span>
          <h3 className="text-3xl font-bold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span>•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <Link href={href}>
            <Button
              variant={primary ? "default" : "secondary"}
              className="mt-4"
            >
              {cta}
            </Button>
          </Link>
        </div>
        <div
          className={`flex justify-center lg:col-span-6 ${reverse ? "md:order-1" : ""}`}
        >
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button>
                <Image
                  src={image}
                  alt={imageAlt}
                  width={imageWidth}
                  height={imageHeight}
                  className="w-full h-auto max-w-xs sm:max-w-sm rounded-md cursor-zoom-in"
                  sizes="(max-width: 640px) 80vw, 300px"
                />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50" />
              <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-full sm:max-w-3xl -translate-x-1/2 -translate-y-1/2 px-4">
                <Image
                  src={image}
                  alt={imageAlt}
                  width={imageWidth * 2}
                  height={imageHeight * 2}
                  className="w-full h-auto max-w-full rounded-md"
                  sizes="(max-width: 640px) 100vw, 600px"
                />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </section>
  );
}

