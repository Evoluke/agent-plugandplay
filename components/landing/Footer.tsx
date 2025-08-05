"use client";

import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-[#FAFAFA]">
      <div className="mx-auto w-full max-w-[1140px] px-3 md:px-4 lg:px-6 py-8 md:py-12 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Image src="/logo.svg" alt="Logo" width={120} height={32} />
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary">
                  Início
                </Link>
              </li>
              <li>
                <Link href="#sobre" className="hover:text-primary">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="#servicos" className="hover:text-primary">
                  Serviços
                </Link>
              </li>
              <li>
                <Link href="#testemunhos" className="hover:text-primary">
                  Depoimentos
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Produto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#por-que" className="hover:text-primary">
                  Por que
                </Link>
              </li>
              <li>
                <Link href="#beneficios" className="hover:text-primary">
                  Benefícios
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-primary">
                  Planos
                </Link>
              </li>
              <li>
                <Link href="#contato" className="hover:text-primary">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Empresa</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary">
                  Carreiras
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Parcerias
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Suporte
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Documentação
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Status
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Newsletter</h4>
            <form className="flex gap-2">
              <Input type="email" placeholder="Seu e-mail" className="h-10" />
              <Button type="submit">Enviar</Button>
            </form>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex w-full max-w-[1140px] flex-col items-center justify-between gap-4 px-3 py-4 text-xs text-muted-foreground md:flex-row md:px-4 lg:px-6">
          <p>© {new Date().getFullYear()} Evoluke. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="#">Privacidade</Link>
            <Link href="#">Termos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

