import type { Metadata } from "next";

const tips = [
  {
    title: "Atualize seu LinkedIn em paralelo",
    description:
      "Copie as principais conquistas do currículo e atualize o LinkedIn com indicadores concretos (crescimento %, ticket médio, NPS). Isso aumenta sua visibilidade para recrutadores e algoritmos de busca de talentos.",
  },
  {
    title: "Personalize o currículo para cada vaga",
    description:
      "Revise os requisitos da descrição da vaga e destaque habilidades diretamente relacionadas. Utilize o resumo inicial para sinalizar experiências que resolvem o problema do cargo.",
  },
  {
    title: "Inclua palavras-chave do setor",
    description:
      "Ferramentas de triagem automática buscam termos específicos. Adicione certificações, metodologias e softwares mencionados no anúncio para aumentar seu score.",
  },
  {
    title: "Prepare exemplos para entrevistas",
    description:
      "Transforme seus resultados em histórias curtas usando a metodologia STAR (Situação, Tarefa, Ação, Resultado). Isso reforça a narrativa criada pelo currículo.",
  },
];

export const metadata: Metadata = {
  title: "Dicas de carreira após gerar currículo",
  description:
    "Acelere sua busca por emprego com recomendações de carreira, links do blog e espaços de mídia para monetização com Google AdSense.",
  alternates: {
    canonical: "/curriculo-ia/dicas",
  },
};

export default function CareerTipsPage() {
  return (
    <main className="bg-gradient-to-b from-white to-[#F4F9F8] pb-16 pt-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 lg:flex-row">
        <section className="flex-1 space-y-10">
          <header className="rounded-3xl border border-slate-200 bg-white/90 p-10 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">Parabéns! Currículo enviado</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
              Próximos passos para conquistar a vaga dos seus sonhos
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Use estas recomendações para dar visibilidade ao currículo gerado e aproveitar conteúdos exclusivos da Evoluke.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <a
                className="rounded-2xl border border-[#2F6F68] bg-[#2F6F68] px-5 py-4 text-center text-sm font-semibold text-white transition hover:bg-[#255852]"
                href="/curriculo-ia"
              >
                Criar outro currículo
              </a>
              <a
                className="rounded-2xl border border-[#2F6F68] px-5 py-4 text-center text-sm font-semibold text-[#2F6F68] transition hover:bg-[#E7F4F2]"
                href="/blog"
              >
                Ler mais dicas no blog
              </a>
            </div>
          </header>

          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-900">Checklist rápido de carreira</h2>
            <p className="mt-3 text-sm text-slate-600">
              Priorize atividades que mantêm seu nome em evidência no mercado. Essas ações se conectam diretamente com o plano de métricas do gerador de currículo (currículos/dia, CTR de anúncios e palavras-chave de maior impacto).
            </p>
            <ul className="mt-6 space-y-4">
              {tips.map((tip) => (
                <li key={tip.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <h3 className="text-base font-semibold text-slate-900">{tip.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{tip.description}</p>
                </li>
              ))}
            </ul>
          </article>

          <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900">Conteúdos recomendados</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <a className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-[#2F6F68]" href="/blog/curriculo-primeiro-emprego">
                <h3 className="text-base font-semibold text-slate-900">Currículo para primeiro emprego</h3>
                <p className="mt-2 text-sm text-slate-600">Aprenda a traduzir experiências acadêmicas e voluntárias em resultados.</p>
              </a>
              <a className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-[#2F6F68]" href="/blog/curriculo-vendedor">
                <h3 className="text-base font-semibold text-slate-900">Modelo para vendedores de alta performance</h3>
                <p className="mt-2 text-sm text-slate-600">Organize metas batidas, carteira atendida e indicadores comerciais.</p>
              </a>
              <a className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-[#2F6F68]" href="/blog/como-fazer-curriculo-2025">
                <h3 className="text-base font-semibold text-slate-900">Como fazer currículo competitivo em 2025</h3>
                <p className="mt-2 text-sm text-slate-600">Atualize o documento com tendências de IA, habilidades digitais e soft skills.</p>
              </a>
              <a className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-[#2F6F68]" href="/pricing">
                <h3 className="text-base font-semibold text-slate-900">Conheça o CRM com IA da Evoluke</h3>
                <p className="mt-2 text-sm text-slate-600">Centralize leads, acompanhe funil e automatize tarefas com nossos agentes.</p>
              </a>
            </div>
          </section>
        </section>

        <aside className="w-full space-y-6 lg:w-72">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-md">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Espaço publicitário</p>
            <div
              className="mt-4 flex h-60 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400"
              data-ad-slot="curriculo-ia-dicas"
            >
              Google Ads 300×600
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Ideal para campanhas de cursos rápidos, plataformas de vagas e coaching de carreira.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="text-sm font-semibold text-slate-900">Quer mais visibilidade?</h2>
            <p className="mt-3 text-sm text-slate-600">
              Publique artigos no blog corporativo, compartilhe o link do currículo nas redes e acompanhe as métricas de tráfego diretamente no Google Analytics.
            </p>
            <a
              className="mt-4 inline-flex rounded-full bg-[#2F6F68] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#255852]"
              href="/contact"
            >
              Falar com nosso time
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
