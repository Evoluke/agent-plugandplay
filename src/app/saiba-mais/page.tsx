import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import LearnMore from "@/components/landing/LearnMore";

export default function SaibaMaisPage() {
  return (
    <>
      <Header />
      <main className="flex flex-col">
        <LearnMore />
        <Footer />
      </main>
    </>
  );
}

