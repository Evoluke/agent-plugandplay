import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import LearnMore from "@/components/landing/LearnMore";
import type { Metadata } from "next";
import Chatwoot from "@/components/landing/Chatwoot";

export const metadata: Metadata = {
  title: "Saiba Mais - Evoluke",
  description: "Descubra como a Evoluke transforma o atendimento com IA.",
};

export default function SaibaMaisPage() {
  return (
    <>
      <Chatwoot />
      <Header />
      <main className="flex flex-col">
        <LearnMore />
      </main>
      <Footer />
    </>
  );
}

