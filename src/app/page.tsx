// src/app/page.tsx
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import WhyBetter from "@/components/landing/WhyBetter";
import BenefitOne from "@/components/landing/BenefitOne";
import BenefitTwo from "@/components/landing/BenefitTwo";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <Header />
      <Hero />
      <WhyBetter />
      <BenefitOne />
      <BenefitTwo />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
