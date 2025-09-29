"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-[1140px] items-center justify-between px-3 md:px-4 lg:px-6">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Logotipo da Evoluke" width={120} height={32} />
        </Link>
        <nav className="hidden flex-1 justify-center md:flex">
          <ul className="flex gap-6 text-sm">
            <li>
              <Link href="/#solucoes" className="hover:text-primary">
                Soluções
              </Link>
            </li>
            <li>
              <Link href="/#modelos" className="hover:text-primary">
                Modelos
              </Link>
            </li>
            <li>
              <Link href="/saiba-mais" className="hover:text-primary">
                Como funciona?
              </Link>
            </li>
            <li>
              <Link href="/sob-demanda" className="hover:text-primary">
                Sob demanda
              </Link>
            </li>
            <li
              className="relative"
              onMouseEnter={() => setToolsMenuOpen(true)}
              onMouseLeave={() => setToolsMenuOpen(false)}
              onFocusCapture={() => setToolsMenuOpen(true)}
              onBlur={(event) => {
                const nextFocus = event.relatedTarget as Node | null;
                if (!nextFocus || !event.currentTarget.contains(nextFocus)) {
                  setToolsMenuOpen(false);
                }
              }}
            >
              <button
                type="button"
                className="hover:text-primary flex items-center gap-1"
                aria-haspopup="true"
                aria-expanded={toolsMenuOpen}
                onClick={() => setToolsMenuOpen((current) => !current)}
              >
                Ferramentas
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
              {toolsMenuOpen ? (
                <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-lg border bg-background p-2 shadow-lg">
                  <Link
                    href="/tools"
                    className="hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 block rounded-md px-3 py-2 text-left"
                  >
                    Visão geral das ferramentas
                  </Link>
                  <Link
                    href="/tools/calculadora-margem"
                    className="hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 block rounded-md px-3 py-2 text-left"
                  >
                    Calculadora de margem
                  </Link>
                </div>
              ) : null}
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
          aria-expanded={open}
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
            <Link href="/#solucoes" onClick={() => setOpen(false)}>
              Soluções
            </Link>
            <Link href="/#modelos" onClick={() => setOpen(false)}>
              Modelos
            </Link>
            <Link href="/saiba-mais" onClick={() => setOpen(false)}>
              Como funciona?
            </Link>
            <Link href="/sob-demanda" onClick={() => setOpen(false)}>
              Sob demanda
            </Link>
            <div className="flex flex-col items-center gap-2">
              <Link href="/tools" onClick={() => setOpen(false)} className="font-semibold">
                Ferramentas
              </Link>
              <Link
                href="/tools/calculadora-margem"
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground"
              >
                Calculadora de margem
              </Link>
            </div>
            <Link href="/contact" onClick={() => setOpen(false)}>
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

