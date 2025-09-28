import type { Metadata } from "next";
import { AdSlot } from "@/components/adsense/AdSlot";

export const metadata: Metadata = {
  title: "Modelos de currículo prontos para baixar | Currículo IA Pro",
  description:
    "Compare modelos de currículo gratuitos e premium, otimizados para ATS, e descubra qual layout usar em cada etapa da carreira.",
};

const templates = [
  {
    title: "Minimalista",
    description: "Modelo limpo com foco em texto, ideal para áreas corporativas e para passar em filtros ATS.",
    free: true,
  },
  {
    title: "Elegante",
    description: "Layout com tipografia serifada e destaques sutis para cargos de liderança.",
    free: true,
  },
  {
    title: "Executivo",
    description: "Template premium com duas colunas e blocos de resultados para gerentes e diretores.",
    free: false,
  },
  {
    title: "Tech",
    description: "Destaque para projetos, stacks e métricas, pensado para desenvolvedores e PMs.",
    free: false,
  },
];

export default function ModelosDeCurriculoPage() {
  return (
    <div className="bg-neutral-50 py-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6">
        <header className="text-center">
          <h1 className="text-3xl font-semibold text-neutral-900">Modelos de currículo prontos para baixar</h1>
          <p className="mt-3 text-neutral-600">
            Escolha entre layouts gratuitos e premium criados com feedback de recrutadores. Todos são compatíveis com sistemas de triagem e têm espaço para resultados.
          </p>
        </header>
        <section className="grid gap-6 md:grid-cols-2">
          {templates.map((template) => (
            <article key={template.title} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-900">{template.title}</h2>
              <p className="mt-3 text-sm text-neutral-600">{template.description}</p>
              <span className="mt-4 inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: template.free ? "#16A34A" : "#2563EB" }}>
                {template.free ? "Gratuito" : "Premium"}
              </span>
            </article>
          ))}
        </section>
        <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-900">Como escolher o melhor modelo?</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-4 text-sm text-neutral-700">
            <li>Priorize a legibilidade: fontes entre 10 e 12 pt e espaçamento adequado.</li>
            <li>Evite gráficos pesados para não comprometer a leitura por bots.</li>
            <li>Destaque resultados e palavras-chave nos primeiros blocos.</li>
            <li>Use modelos premium para cargos estratégicos ou quando precisar de tradução automática.</li>
          </ol>
        </section>
        <AdSlot slot="4398761237" className="min-h-[90px]" />
      </div>
    </div>
  );
}
