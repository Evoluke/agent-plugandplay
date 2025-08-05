"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-[1140px] items-center justify-between px-3 md:px-4 lg:px-6">
        <Link href="/">
          <Image src="/logo.svg" alt="Logo" width={120} height={32} />
        </Link>
        <nav className="hidden md:flex gap-6 text-sm">
          <Link href="#home">Home</Link>
          <Link href="#sobre">Sobre</Link>
          <Link href="#servicos">Serviços</Link>
          <Link href="#contato">Contato</Link>
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Registrar</Button>
          </Link>
        </div>
        <button
          className="md:hidden"
          aria-label="Abrir menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-background px-3 py-6 md:hidden">
          <div className="flex justify-end">
            <button
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-6 flex flex-col items-center gap-4 text-lg">
            <Link href="#home" onClick={() => setOpen(false)}>
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
            <Link href="/login" className="w-full" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full">
                Login
              </Button>
            </Link>
            <Link href="/signup" className="w-full" onClick={() => setOpen(false)}>
              <Button className="w-full">Registrar</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
