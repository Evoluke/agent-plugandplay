"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface MascotProps {
  className?: string;
}

export default function Mascot({ className }: MascotProps) {
  return (
    <Image
      src="/mascot.png"
      alt="Mascote"
      width={160}
      height={160}
      className={cn("animate-float", className)}
      priority={false}
    />
  );
}
