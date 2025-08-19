import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato - Evoluke",
  description: "Informações de contato da Evoluke",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center">
        <section className="w-full max-w-[1140px] px-3 md:px-4 lg:px-6 py-12">
          <h1 className="mb-6 text-center text-3xl font-bold">Contato</h1>
          <ul className="space-y-4 text-center">
            <li>CNPJ: 12.345.678/0001-90</li>
            <li>Telefone: (11) 1234-5678</li>
            <li>
              Instagram: {" "}
              <Link
                href="https://instagram.com/evoluke"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                @evoluke
              </Link>
            </li>
            <li>
              LinkedIn: {" "}
              <Link
                href="https://www.linkedin.com/company/evoluke"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Evoluke
              </Link>
            </li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
