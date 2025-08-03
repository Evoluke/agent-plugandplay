// src/app/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-6">
        <Image src="/logo.svg" alt="Logo" width={96} height={96} />
        <h1 className="text-2xl font-semibold">Seja bem vindo a Evoluke</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
          <Link href="/login">
            <Button className="w-full">Login</Button>
          </Link>
          <Link href="/signup">
            <Button className="w-full bg-transparent border border-teal-600 text-teal-600 hover:bg-teal-50">
              Cadastrar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}