import Pricing from "@/components/landing/Pricing";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planos - Evoluke",
  description: "Veja nossos planos e escolha o melhor para sua empresa.",
};

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="flex flex-col w-[70%] mx-auto">
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
