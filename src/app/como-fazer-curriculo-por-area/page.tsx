import type { Metadata } from "next";
import { AdSlot } from "@/components/adsense/AdSlot";

export const metadata: Metadata = {
  title: "Como fazer currículo por área | Currículo IA Pro",
  description:
    "Veja orientações específicas de currículo para tecnologia, marketing, finanças, atendimento e outras áreas em alta demanda.",
};

const areas = [
  {
    name: "Tecnologia",
    tips: [
      "Priorize stacks, certificações técnicas e impacto em métricas de performance.",
      "Liste projetos open source ou contribuições relevantes.",
    ],
  },
  {
    name: "Marketing",
    tips: [
      "Apresente campanhas com números de alcance, leads ou ROI.",
      "Inclua ferramentas de automação e habilidades analíticas.",
    ],
  },
  {
    name: "Finanças",
    tips: [
      "Mostre resultados em redução de custos, previsão e controles internos.",
      "Destaque conformidade com normas e certificações (CFA, CPA-20).",
    ],
  },
  {
    name: "Atendimento",
    tips: [
      "Descreva indicadores de satisfação (NPS, CSAT) e volume de atendimentos.",
      "Mencione ferramentas de CRM e atendimento omnichannel.",
    ],
  },
];

export default function ComoFazerCurriculoPorAreaPage() {
  return (
    <div className="bg-neutral-50 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold text-neutral-900">Como fazer currículo por área</h1>
          <p className="text-neutral-600">
            Cada setor valoriza habilidades e métricas específicas. Use as recomendações abaixo para adaptar seu currículo com foco em resultados medidos e palavras-chave relevantes.
          </p>
        </header>
        <section className="grid gap-6 md:grid-cols-2">
          {areas.map((area) => (
            <article key={area.name} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-900">{area.name}</h2>
              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                {area.tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--primary)]" />
                    {tip}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
        <AdSlot slot="4398761239" className="min-h-[90px]" />
      </div>
    </div>
  );
}
