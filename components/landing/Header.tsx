"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 w-full max-w-[1140px] items-center justify-between px-3 md:px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={120} height={32} />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
          <Link href="#" className="text-sm font-medium hover:text-primary">
            Home
          </Link>
          <Link href="#sobre" className="text-sm font-medium hover:text-primary">
            Sobre
          </Link>
          <Link href="#servicos" className="text-sm font-medium hover:text-primary">
            Serviços
          </Link>
          <Link href="#contato" className="text-sm font-medium hover:text-primary">
            Contato
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Registrar</Button>
          </Link>
        </div>

        <button
          className="p-2 md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
            <button
              className="absolute right-4 top-4 p-2"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="h-6 w-6" />
            </button>
            <nav className="flex flex-col items-center gap-6 text-lg">
              <Link href="#" onClick={() => setOpen(false)}>
                Home
              </Link>
              <Link href="#sobre" onClick={() => setOpen(false)}>
                Sobre
              </Link>
              <Link href="#servicos" onClick={() => setOpen(false)}>
                Serviços
              </Link>
              <Link href="#contato" onClick={() => setOpen(false)}>
                Contato
              </Link>
            </nav>
            <div className="flex flex-col gap-4">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-40">
                  Login
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)}>
                <Button className="w-40">Registrar</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

