import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import SobDemandaContent from "./SobDemandaContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sob demanda - Evoluke",
  description: "Planos sob demanda da Evoluke",
  alternates: {
    canonical: "/sob-demanda",
  },
};

export default function SobDemandaPage() {
  return (
    <>
      <Header />
      <main>
        <SobDemandaContent />
      </main>
      <Footer />
    </>
  );
}
