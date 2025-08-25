import Header from "./components/Header";
import Hero from "./components/Hero";
import KPIList from "./components/KPIList";
import ValueProp from "./components/ValueProp";
import FeatureCards from "./components/FeatureCards";
import IndustryGrid from "./components/IndustryGrid";
import ProcessSteps from "./components/ProcessSteps";
import OnboardingSteps from "./components/OnboardingSteps";
import Checklist from "./components/Checklist";
import TestimonialsCarousel from "./components/TestimonialsCarousel";
import LogosMarquee from "./components/LogosMarquee";
import CTASection from "./components/CTASection";
import StickyWhatsAppButton from "./components/StickyWhatsAppButton";
import Footer from "./components/Footer";
import { landingData } from "./data";

export default function LandingPage() {
  const d = landingData;
  return (
    <>
      <Header nav={d.nav} cta={d.cta_primary} />
      <main className="pt-16">
        <Hero data={d.hero} cta={d.cta_primary} />
        <KPIList kpis={d.kpis} />
        <ValueProp data={d.value_prop} />
        <FeatureCards agents={d.agents} />
        <IndustryGrid industries={d.industries} />
        <ProcessSteps data={{ ...d.how_it_works, ctaHref: d.cta_primary.href }} ctaLabel={d.cta_primary.label} />
        <OnboardingSteps steps={d.onboarding_4steps} />
        <Checklist comparison={d.comparison_checklist} benefits={d.benefits} />
        <TestimonialsCarousel testimonials={d.testimonials} />
        <LogosMarquee logos={d.clients_logos} />
        <CTASection cta={d.cta_final} />
      </main>
      <StickyWhatsAppButton href={d.cta_final.href} />
      <Footer links={d.footer.links} />
    </>
  );
}
