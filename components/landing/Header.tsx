"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [open, setOpen] = useState(false);

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
            <li className="group relative">
              <Link
                href="/tools"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary focus:text-primary focus:outline-none"
                aria-haspopup="true"
              >
                Ferramentas
                <ChevronDown className="h-4 w-4 transition group-hover:-rotate-180 group-focus-within:-rotate-180" />
              </Link>
              <div className="invisible absolute left-1/2 top-full z-30 mt-3 w-64 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 text-left opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <Link
                  href="/tools/calculadora-margem"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-primary/10 hover:text-primary"
                >
                  Calculadora de margem
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    Descubra preço sugerido, margem real e lucro unitário.
                  </span>
                </Link>
                <div className="mt-3 rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500">
                  Em breve: novos roteiros e calculadoras para apoiar seu time comercial com IA.
                </div>
              </div>
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
            <div className="w-full space-y-3 rounded-2xl border border-slate-200 bg-white/60 p-4 text-center text-base text-slate-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Ferramentas</p>
              <div className="space-y-2 text-sm">
                <Link
                  href="/tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg border border-transparent px-3 py-2 transition hover:border-primary/40 hover:bg-primary/10"
                >
                  Todas as ferramentas
                </Link>
                <Link
                  href="/tools/calculadora-margem"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg border border-transparent px-3 py-2 transition hover:border-primary/40 hover:bg-primary/10"
                >
                  Calculadora de margem
                </Link>
              </div>
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

