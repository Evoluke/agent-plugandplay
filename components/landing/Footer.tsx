import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#FAFAFA] text-sm">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Image src="/logo.svg" alt="Logo" width={120} height={32} />
            <ul className="space-y-2">
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
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Ajuda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Produto</h4>
            <ul className="space-y-2">
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
                  Integrações
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Status
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  API
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Empresa</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-primary">
                  Parceiros
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Segurança
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Termos
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Newsletter</h4>
            <div className="flex gap-2">
              <Input type="email" placeholder="Seu e-mail" />
              <Button>Enviar</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-[1140px] flex-col items-center gap-2 px-3 md:flex-row md:justify-between md:px-4 lg:px-6 py-4 text-muted-foreground">
          <p>© {year} Evoluke. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary">
              Privacidade
            </Link>
            <Link href="#" className="hover:text-primary">
              Termos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

