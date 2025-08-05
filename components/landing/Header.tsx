"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-[1140px] items-center justify-between px-3 py-4 md:px-4 lg:px-6">
        <Link href="/">
          <Image src="/logo.svg" alt="Logo" width={120} height={32} />
        </Link>
        <nav className="hidden gap-6 md:flex">
          <Link href="#" className="text-sm font-medium hover:text-primary">
            Home
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary">
            Sobre
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary">
            Serviços
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary">
            Contato
          </Link>
        </nav>
        <div className="hidden items-center gap-4 md:flex">
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
          className="md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white px-6 py-4 md:hidden">
          <button
            className="self-end"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="h-6 w-6" />
          </button>
          <nav className="mt-8 flex flex-col gap-4 text-center">
            <Link
              href="#"
              className="text-lg font-medium hover:text-primary"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link
              href="#"
              className="text-lg font-medium hover:text-primary"
              onClick={() => setOpen(false)}
            >
              Sobre
            </Link>
            <Link
              href="#"
              className="text-lg font-medium hover:text-primary"
              onClick={() => setOpen(false)}
            >
              Serviços
            </Link>
            <Link
              href="#"
              className="text-lg font-medium hover:text-primary"
              onClick={() => setOpen(false)}
            >
              Contato
            </Link>
          </nav>
          <div className="mt-auto flex flex-col gap-4">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="w-full">Registrar</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

