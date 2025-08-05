"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#FAFAFA] py-8" id="contato">
      <div className="mx-auto flex max-w-[1140px] flex-col items-center gap-4 px-3 text-center text-sm text-muted-foreground md:px-4 lg:px-6">
        <div className="flex gap-6">
          <Link href="/login" className="hover:text-primary">
            Login
          </Link>
          <Link href="/signup" className="hover:text-primary">
            Cadastrar
          </Link>
          <Link href="#pricing" className="hover:text-primary">
            Planos
          </Link>
        </div>
        <p>© {new Date().getFullYear()} Evoluke. Todos os direitos reservados.</p>
        <p>contato@evoluke.com</p>
      </div>
    </footer>
  );
}
