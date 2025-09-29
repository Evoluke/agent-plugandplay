"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";

type ToolLink = {
  href: string;
  label: string;
  description: string;
};

const toolLinks: ToolLink[] = [
  {
    href: "/tools",
    label: "Central de ferramentas",
    description: "Conheça todas as soluções digitais da Evoluke",
  },
  {
    href: "/tools/calculadora-margem",
    label: "Calculadora de margem",
    description: "Defina preços de venda com segurança e agilidade",
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [toolsMobileOpen, setToolsMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) {
      setToolsMobileOpen(false);
    }
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
            <li>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    aria-haspopup="menu"
                  >
                    Ferramentas
                    <ChevronDown className="h-4 w-4" aria-hidden />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="center"
                    sideOffset={12}
                    className="z-50 min-w-[240px] rounded-lg border border-border bg-background p-2 text-sm shadow-lg"
                  >
                    {toolLinks.map((tool) => (
                      <DropdownMenu.Item key={tool.href} asChild>
                        <Link
                          href={tool.href}
                          className="block rounded-md px-3 py-2 transition hover:bg-primary/5 focus:bg-primary/5"
                        >
                          <span className="block font-medium text-foreground">{tool.label}</span>
                          <span className="block text-xs text-muted-foreground">{tool.description}</span>
                        </Link>
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
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
            <div className="w-full">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md border border-muted-foreground/20 px-4 py-2 text-base font-medium"
                onClick={() => setToolsMobileOpen((prev) => !prev)}
                aria-expanded={toolsMobileOpen}
                aria-controls="mobile-tools-menu"
              >
                Ferramentas
                <ChevronDown className={`h-5 w-5 transition ${toolsMobileOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
              {toolsMobileOpen && (
                <div id="mobile-tools-menu" className="mt-2 space-y-2 rounded-md border border-muted-foreground/10 p-3 text-left text-base">
                  {toolLinks.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="block rounded-md px-2 py-2 text-sm text-foreground transition hover:bg-primary/10"
                      onClick={() => {
                        setOpen(false);
                        setToolsMobileOpen(false);
                      }}
                    >
                      <span className="block font-medium">{tool.label}</span>
                      <span className="block text-xs text-muted-foreground">{tool.description}</span>
                    </Link>
                  ))}
                </div>
              )}
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

