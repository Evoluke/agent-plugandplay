"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center text-sm text-muted-foreground">
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
