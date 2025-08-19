"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-[1140px] items-center justify-between px-3 md:px-4 lg:px-6">
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="Logo" width={120} height={32} />
        </Link>
        <nav className="hidden flex-1 justify-center md:flex">
          <ul className="flex gap-6 text-sm">
            <li>
              <Link href="#" className="hover:text-primary">
                Início
              </Link>
            </li>
            <li>
              <Link href="#solucoes" className="hover:text-primary">
                Soluções
              </Link>
            </li>
            <li>
              <Link href="#modelos" className="hover:text-primary">
                Modelos
              </Link>
            </li>
            <li>
              <Link href="#contato" className="hover:text-primary">
                Contato
              </Link>
            </li>
          </ul>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Criar conta</Button>
          </Link>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-background/95 p-6 md:hidden">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="mt-8 flex flex-col items-center gap-4 text-lg">
            <Link href="#" onClick={() => setOpen(false)}>
              Início
            </Link>
            <Link href="#solucoes" onClick={() => setOpen(false)}>
              Soluções
            </Link>
            <Link href="#modelos" onClick={() => setOpen(false)}>
              Modelos
            </Link>
            <Link href="#contato" onClick={() => setOpen(false)}>
              Contato
            </Link>
          </nav>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link href="/login" className="w-full" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full">
                Login
              </Button>
            </Link>
            <Link href="/signup" className="w-full" onClick={() => setOpen(false)}>
              <Button className="w-full">Criar conta</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

