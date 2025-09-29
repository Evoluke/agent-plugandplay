import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import MarginCalculatorForm from "@/components/tools/MarginCalculatorForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculadora de Margem e Precificação | Evoluke",
  description:
    "Calcule o preço ideal de venda informando custos, impostos e margem desejada. Receba o lucro unitário, a margem real e conecte o gatilho automático de WhatsApp com IA.",
  keywords: [
    "calculadora de margem",
    "precificação",
    "lucro unitário",
    "gestão financeira",
    "simulador de preço",
    "WhatsApp com IA",
  ],
  alternates: {
    canonical: "/tools/calculadora-margem",
  },
};

export default function MarginCalculatorPage() {
  return (
    <>
      <Header />
      <main className="bg-gradient-to-b from-white via-slate-50 to-white pb-20 pt-16">
        <section className="mx-auto max-w-5xl px-4 sm:px-6">
          <header className="mx-auto max-w-3xl text-center">
            <span className="rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Precificação estratégica
            </span>
            <h1 className="mt-6 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Calculadora de margem para empresas que querem escalar com lucro
            </h1>
            <p className="mt-4 text-pretty text-base text-muted-foreground md:text-lg">
              Some custos diretos, despesas fixas e tributos para descobrir o preço de venda sugerido. O cálculo segue as boas práticas de gestão financeira e mostra a diferença entre a margem desejada e a margem real conquistada após cada venda.
            </p>
          </header>
          <div className="mt-12">
            <MarginCalculatorForm />
          </div>
          <section className="mt-16 grid gap-8 rounded-3xl border bg-white/85 p-8 shadow-sm md:grid-cols-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground sm:text-xl">Entregue valor imediato</h2>
              <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
                Colete leads ao mesmo tempo em que oferece uma projeção financeira confiável. Ideal para nutrir empresas que estão avaliando sua oferta antes de contratar o plano premium.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground sm:text-xl">Simplifique decisões</h2>
              <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
                Valide se a margem desejada é sustentável antes de lançar um novo produto. Os resultados exibem preço sugerido, lucro unitário e o custo total considerado no cálculo.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground sm:text-xl">Prepare upgrades premium</h2>
              <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
                Depois do cálculo, destaque as vantagens da Evoluke: precificação em massa, cenários comparativos, exportação de relatórios e integrações diretas com o CRM.
              </p>
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
