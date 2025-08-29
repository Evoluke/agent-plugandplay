import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Building2,
  Instagram,
  Linkedin,
  Mail,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contato - Evoluke",
  description: "Informações de contato da Evoluke",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <section className="mx-auto w-full max-w-[1140px] px-3 py-12 md:px-4 lg:px-6 mb-12">
          <h1 className="mb-8 text-3xl font-bold">Contato</h1>
          <address className="grid gap-6 not-italic md:grid-cols-2">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-semibold">CNPJ</p>
                  <p>60.173.541/0001-43</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Telefone</p>
                  <a href="tel:+554788533553" className="hover:underline">
                    (47) 8853-3553
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-semibold">E-mail</p>
                  <Link
                    href="mailto:contato@evoluke.com"
                    className="text-primary hover:underline"
                  >
                    contato@evoluke.com
                  </Link>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Instagram className="h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Instagram</p>
                  <Link
                    href="https://instagram.com/e.voluke"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @e.voluke
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Linkedin className="h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-semibold">LinkedIn</p>
                  <Link
                    href="https://www.linkedin.com/company/evoluke-ia"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Evoluke
                  </Link>
                </div>
              </div>
            </div>
          </address>
        </section>
      </main>
      <Footer />
    </>
  );
}
