import Header from "../landing/components/Header";
import Footer from "../landing/components/Footer";
import { landingData } from "../landing/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
};

export default function PoliticaPage() {
  const d = landingData;
  return (
    <>
      <Header nav={d.nav} cta={d.cta_primary} />
      <main className="mx-auto max-w-3xl space-y-4 py-24">
        <h1 className="text-3xl font-bold">Política de Privacidade</h1>
        <p>
          Esta é uma página de exemplo de política de privacidade para a nova
          landing page.
        </p>
      </main>
      <Footer links={d.footer.links} />
    </>
  );
}
