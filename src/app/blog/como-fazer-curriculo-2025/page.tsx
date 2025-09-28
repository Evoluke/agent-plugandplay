import type { Metadata } from "next";

const trends = [
  {
    title: "Integração com IA",
    description:
      "Mostre como você utiliza ferramentas de inteligência artificial para análise de dados, automação de tarefas ou geração de insights. Cite plataformas (ChatGPT, Copilot, Midjourney) e resultados alcançados.",
  },
  {
    title: "Habilidades digitais e dados",
    description:
      "Reforce competências relacionadas a análise, visualização e gestão de dados. Ferramentas como Power BI, Looker Studio, SQL ou automações no Zapier estão em alta.",
  },
  {
    title: "Soft skills comprovadas",
    description:
      "Liderança remota, colaboração multicultural e comunicação assíncrona ganharam peso. Utilize exemplos que demonstrem empatia, adaptabilidade e poder de decisão.",
  },
  {
    title: "Certificações rápidas",
    description:
      "Microcertificações e cursos livres reconhecidos (Google, AWS, HubSpot, FGV) ajudam a comprovar atualização constante sem depender de uma nova graduação.",
  },
];

export const metadata: Metadata = {
  title: "Como fazer currículo competitivo em 2025",
  description:
    "Atualize seu currículo com tendências para 2025: IA, habilidades digitais, certificações rápidas e storytelling profissional.",
  alternates: {
    canonical: "/blog/como-fazer-curriculo-2025",
  },
};

export default function Resume2025Page() {
  return (
    <main className="bg-gradient-to-b from-[#FAFAFA] to-white pb-16 pt-20">
      <article className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4">
        <header className="rounded-3xl border border-slate-200 bg-white/90 p-10 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">Tendências de mercado</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
            Como fazer currículo competitivo em 2025
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Adapte seu currículo às expectativas de recrutadores digitais, destacando domínio de IA, habilidades analíticas e experiências colaborativas.
          </p>
          <a
            className="mt-6 inline-flex rounded-full bg-[#2F6F68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#255852]"
            href="/curriculo-ia"
          >
            Gerar currículo atualizado
          </a>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-slate-900">O que mudou na análise de currículos</h2>
          <p className="mt-3 text-sm text-slate-600">
            ATS (Applicant Tracking Systems) estão mais sofisticados, analisando contexto, semântica e resultados. O ideal é combinar storytelling com palavras-chave estratégicas e métricas claras.
          </p>
        </section>

        <section className="space-y-6">
          {trends.map((trend) => (
            <section key={trend.title} className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900">{trend.title}</h2>
              <p className="mt-3 text-sm text-slate-600">{trend.description}</p>
            </section>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900">Storytelling em três parágrafos</h2>
          <p className="mt-3 text-sm text-slate-600">
            1. Resumo profissional com conquistas estratégicas. 2. Experiências chave com indicadores de negócios ou impacto no cliente. 3. Bloco final com habilidades, certificações e comunidades das quais participa.
          </p>
        </section>

        <footer className="rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900">A Evoluke te ajuda a acompanhar tendências</h2>
          <p className="mt-3 text-sm text-slate-600">
            Gere o currículo com IA, acompanhe a performance pelo Google Analytics e planeje novos conteúdos no blog para atrair tráfego orgânico qualificado.
          </p>
          <a
            className="mt-5 inline-flex rounded-full bg-[#2F6F68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#255852]"
            href="/curriculo-ia"
          >
            Criar meu currículo agora
          </a>
        </footer>
      </article>
    </main>
  );
}
