"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FocusEvent } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) {
      setMobileToolsOpen(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleToolsBlur = (event: FocusEvent<HTMLElement>) => {
    if (!toolsMenuRef.current?.contains(event.relatedTarget as Node | null)) {
      setToolsOpen(false);
    }
  };

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
              <div
                className="relative"
                ref={toolsMenuRef}
                onMouseEnter={() => setToolsOpen(true)}
                onMouseLeave={() => setToolsOpen(false)}
                onFocusCapture={() => setToolsOpen(true)}
                onBlur={handleToolsBlur}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-primary focus:text-primary focus:outline-none"
                  aria-expanded={toolsOpen}
                  aria-haspopup="true"
                  onClick={() => setToolsOpen((prev) => !prev)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setToolsOpen(false);
                    }
                  }}
                >
                  Ferramentas
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${toolsOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                <div
                  className={`absolute left-1/2 top-full z-20 mt-3 w-64 -translate-x-1/2 rounded-xl border bg-background p-4 shadow-xl transition ${
                    toolsOpen ? "visible opacity-100" : "invisible opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-3 text-sm">
                    <Link
                      href="/tools"
                    className="rounded-lg border border-transparent bg-muted/40 p-3 font-semibold text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary"
                    onClick={() => setToolsOpen(false)}
                  >
                    Central de ferramentas
                  </Link>
                  <Link
                    href="/tools/calculadora-margem"
                    className="rounded-lg border border-muted bg-background p-3 hover:border-primary hover:text-primary"
                    onClick={() => setToolsOpen(false)}
                  >
                    Calculadora de margem e precificação
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Novas soluções chegam em breve para acionar conversas inteligentes no WhatsApp integradas ao CRM.
                  </p>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <Link href="/sob-demanda" className="hover:text-primary">
                Sob demanda
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
            <div className="flex w-full flex-col items-center gap-2">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-muted/60 px-4 py-2 text-base font-medium text-foreground"
                onClick={() => setMobileToolsOpen((prev) => !prev)}
                aria-expanded={mobileToolsOpen}
              >
                Ferramentas
                <ChevronDown className={`h-4 w-4 transition ${mobileToolsOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
              {mobileToolsOpen && (
                <div className="w-full space-y-2 rounded-lg border border-muted bg-white/80 px-4 py-3 text-base text-muted-foreground">
                  <Link
                    href="/tools"
                    onClick={() => {
                      setOpen(false);
                      setMobileToolsOpen(false);
                    }}
                    className="block font-medium text-foreground hover:text-primary"
                  >
                    Central de ferramentas
                  </Link>
                  <Link
                    href="/tools/calculadora-margem"
                    onClick={() => {
                      setOpen(false);
                      setMobileToolsOpen(false);
                    }}
                    className="block font-medium text-foreground hover:text-primary"
                  >
                    Calculadora de margem
                  </Link>
                  <p className="text-sm text-muted-foreground/80">
                    Novos gatilhos de WhatsApp com IA serão liberados em breve.
                  </p>
                </div>
              )}
            </div>
            <Link href="/sob-demanda" onClick={() => setOpen(false)}>
              Sob demanda
            </Link>
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

