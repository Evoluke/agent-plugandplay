"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-[#FAFAFA]">
      <div className="mx-auto grid max-w-[1140px] grid-cols-1 gap-8 px-3 py-8 text-sm md:grid-cols-2 md:px-4 md:py-12 lg:grid-cols-4 lg:px-6">
        <div className="space-y-4">
          <Link href="/">
            <Image src="/logo.svg" alt="Logo" width={120} height={32} />
          </Link>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link href="#" className="hover:text-primary">
                Sobre
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Serviços
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Contato
              </Link>
            </li>
            <li>
              <Link href="#pricing" className="hover:text-primary">
                Planos
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-primary">
                Login
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Produto</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link href="#" className="hover:text-primary">
                Recursos
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Preços
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Atualizações
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Blog
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Ajuda
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Empresa</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link href="#" className="hover:text-primary">
                Sobre nós
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Carreiras
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Parceiros
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Contato
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Notícias
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold">Newsletter</h3>
          <form className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              placeholder="Seu e-mail"
              className="w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <Button type="submit" className="sm:w-auto">
              Assinar
            </Button>
          </form>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-[1140px] flex-col justify-between gap-4 px-3 py-4 text-center text-xs text-muted-foreground md:flex-row md:px-4 lg:px-6">
          <p>© {new Date().getFullYear()} Evoluke. Todos os direitos reservados.</p>
          <p>
            <Link href="#" className="hover:text-primary">
              Privacidade
            </Link>{" "}|{" "}
            <Link href="#" className="hover:text-primary">
              Termos
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
