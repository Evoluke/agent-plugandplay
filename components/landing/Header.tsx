"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FocusEvent } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const mobileNavId = "mobile-navigation";
const mobileNavLabelId = "mobile-navigation-title";

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
    <header className="border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1140px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="Ir para a página inicial">
          <Image src="/logo.png" alt="Logotipo da Evoluke" width={120} height={32} />
        </Link>
        <nav className="hidden flex-1 justify-center md:flex" aria-label="Menu principal">
          <ul className="flex items-center gap-6 text-sm">
            <li>
              <Link href="/#solucoes" className="rounded-full px-3 py-2 hover:bg-muted/70 hover:text-primary">
                Soluções
              </Link>
            </li>
            <li>
              <Link href="/#modelos" className="rounded-full px-3 py-2 hover:bg-muted/70 hover:text-primary">
                Modelos
              </Link>
            </li>
            <li>
              <Link href="/saiba-mais" className="rounded-full px-3 py-2 hover:bg-muted/70 hover:text-primary">
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
                  className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium hover:bg-muted/70 hover:text-primary focus:bg-muted/80 focus:text-primary focus:outline-none"
                  aria-expanded={toolsOpen}
                  aria-haspopup="true"
                  aria-controls="desktop-tools-menu"
                  onClick={() => setToolsOpen((prev) => !prev)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setToolsOpen(false);
                    }
                  }}
                >
                  Ferramentas
                  <ChevronDown className={`h-4 w-4 transition-transform ${toolsOpen ? "rotate-180" : ""}`} aria-hidden />
                </button>
                <div
                  id="desktop-tools-menu"
                  className={`absolute left-1/2 top-full z-20 mt-3 w-72 -translate-x-1/2 rounded-2xl border bg-background p-4 shadow-xl transition ${
                    toolsOpen ? "visible opacity-100" : "invisible opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-3 text-sm">
                    <Link
                      href="/tools"
                      className="rounded-xl border border-transparent bg-muted/40 p-3 font-semibold text-foreground transition hover:border-primary hover:bg-primary/10 hover:text-primary"
                      onClick={() => setToolsOpen(false)}
                    >
                      Central de ferramentas
                    </Link>
                    <Link
                      href="/tools/calculadora-margem"
                      className="rounded-xl border border-muted bg-background p-3 transition hover:border-primary hover:bg-primary/10 hover:text-primary"
                      onClick={() => setToolsOpen(false)}
                    >
                      Calculadora de margem e precificação
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Novas soluções mobile-first chegarão em breve com gatilhos de WhatsApp com IA conectados ao CRM.
                    </p>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <Link href="/sob-demanda" className="rounded-full px-3 py-2 hover:bg-muted/70 hover:text-primary">
                Sob demanda
              </Link>
            </li>
          </ul>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login">
            <Button variant="outline" size="sm" className="h-10 rounded-full px-6">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="h-10 rounded-full px-6">
              Criar conta
            </Button>
          </Link>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={open}
          aria-controls={mobileNavId}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm md:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={mobileNavLabelId}
        >
          <div className="flex items-center justify-between border-b px-4 pb-4 pt-6">
            <span id={mobileNavLabelId} className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Menu
            </span>
            <Button variant="outline" size="icon" onClick={() => setOpen(false)} aria-label="Fechar menu">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav id={mobileNavId} aria-labelledby={mobileNavLabelId} className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
            <ul className="space-y-3 text-base font-medium text-foreground">
              <li>
                <Link
                  href="/#solucoes"
                  className="block rounded-xl border border-transparent bg-white/60 px-4 py-3 shadow-sm transition hover:border-primary hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Soluções
                </Link>
              </li>
              <li>
                <Link
                  href="/#modelos"
                  className="block rounded-xl border border-transparent bg-white/60 px-4 py-3 shadow-sm transition hover:border-primary hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Modelos
                </Link>
              </li>
              <li>
                <Link
                  href="/saiba-mais"
                  className="block rounded-xl border border-transparent bg-white/60 px-4 py-3 shadow-sm transition hover:border-primary hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Como funciona?
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-muted/60 bg-white/80 px-4 py-3 text-left text-base font-semibold text-foreground shadow-sm transition hover:border-primary"
                  onClick={() => setMobileToolsOpen((prev) => !prev)}
                  aria-expanded={mobileToolsOpen}
                  aria-controls="mobile-tools-menu"
                >
                  Ferramentas
                  <ChevronDown className={`h-4 w-4 transition ${mobileToolsOpen ? "rotate-180" : ""}`} aria-hidden />
                </button>
                {mobileToolsOpen && (
                  <div
                    id="mobile-tools-menu"
                    className="mt-2 space-y-2 rounded-xl border border-muted bg-white/90 px-4 py-4 text-sm text-muted-foreground"
                  >
                    <Link
                      href="/tools"
                      onClick={() => {
                        setOpen(false);
                        setMobileToolsOpen(false);
                      }}
                      className="block rounded-lg px-2 py-2 font-medium text-foreground transition hover:text-primary"
                    >
                      Central de ferramentas
                    </Link>
                    <Link
                      href="/tools/calculadora-margem"
                      onClick={() => {
                        setOpen(false);
                        setMobileToolsOpen(false);
                      }}
                      className="block rounded-lg px-2 py-2 font-medium text-foreground transition hover:text-primary"
                    >
                      Calculadora de margem
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Receba em primeira mão ferramentas mobile-first para acionar conversas no WhatsApp com IA e CRM.
                    </p>
                  </div>
                )}
              </li>
              <li>
                <Link
                  href="/sob-demanda"
                  className="block rounded-xl border border-transparent bg-white/60 px-4 py-3 shadow-sm transition hover:border-primary hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Sob demanda
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="block rounded-xl border border-transparent bg-white/60 px-4 py-3 shadow-sm transition hover:border-primary hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Contato
                </Link>
              </li>
            </ul>
          </nav>
          <div className="border-t bg-white/90 px-4 pb-6 pt-4">
            <Link href="/login" className="block" onClick={() => setOpen(false)}>
              <Button variant="outline" className="h-12 w-full rounded-xl text-base">
                Login
              </Button>
            </Link>
            <Link href="/signup" className="mt-3 block" onClick={() => setOpen(false)}>
              <Button className="h-12 w-full rounded-xl text-base">Criar conta</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
