import type { Metadata } from "next";

const tips = [
  {
    title: "Atualize seu LinkedIn em paralelo",
    description:
      "Copie as principais conquistas do currículo e inclua indicadores concretos (crescimento %, ticket médio, NPS). Isso aumenta sua visibilidade para recrutadores e algoritmos de busca de talentos.",
  },
  {
    title: "Personalize cada candidatura",
    description:
      "Revise os requisitos da vaga e destaque habilidades diretamente relacionadas. Utilize o resumo inicial para sinalizar experiências que resolvem o problema do cargo.",
  },
  {
    title: "Inclua palavras-chave do setor",
    description:
      "Ferramentas de triagem automática buscam termos específicos. Adicione certificações, metodologias e softwares mencionados no anúncio para aumentar seu score.",
  },
  {
    title: "Prepare exemplos para entrevistas",
    description:
      "Transforme seus resultados em histórias curtas usando a metodologia STAR (Situação, Tarefa, Ação, Resultado) e mantenha essa estrutura à mão para o follow-up.",
  },
];

const resources = [
  {
    href: "/blog/curriculo-primeiro-emprego",
    title: "Currículo para primeiro emprego",
    description: "Traduza experiências acadêmicas e voluntárias em resultados comprováveis.",
  },
  {
    href: "/blog/curriculo-vendedor",
    title: "Modelo para vendedores de alta performance",
    description: "Organize metas batidas, carteira atendida e indicadores comerciais.",
  },
  {
    href: "/blog/como-fazer-curriculo-2025",
    title: "Como fazer currículo competitivo em 2025",
    description: "Atualize o documento com tendências de IA, habilidades digitais e soft skills.",
  },
  {
    href: "/pricing",
    title: "Conheça o CRM com IA da Evoluke",
    description: "Centralize leads, acompanhe funil e automatize tarefas com nossos agentes.",
  },
];

const nextSteps = [
  {
    title: "Compartilhe com o recrutador",
    description:
      "Envie o PDF por e-mail com mensagem personalizada e inclua um link para seu LinkedIn atualizado.",
  },
  {
    title: "Agende lembretes",
    description:
      "Defina um follow-up no calendário em até 5 dias úteis após enviar o currículo.",
  },
  {
    title: "Monitore suas métricas",
    description:
      "Anote vagas aplicadas, contatos retornados e evolução do CTR dos anúncios para ajustar sua estratégia.",
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
          <header className="rounded-3xl border border-slate-200 bg-white/95 p-10 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">Currículo gerado com sucesso</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
              Continue a jornada com estratégias focadas em contratação
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Use estas ações para potencializar o currículo e aumentar as chances de entrevistas. A experiência foi desenhada para web e mobile, então revise os próximos passos direto do celular.
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
            <dl className="mt-8 grid gap-6 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Follow-up</dt>
                <dd className="mt-2 text-sm text-slate-600">
                  Planeje contatos em até 5 dias para manter sua candidatura no radar das empresas.
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Networking</dt>
                <dd className="mt-2 text-sm text-slate-600">
                  Compartilhe o PDF em comunidades relevantes e peça recomendações personalizadas.
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Mobile-first</dt>
                <dd className="mt-2 text-sm text-slate-600">
                  Adapte a apresentação para reuniões rápidas usando o preview otimizado para smartphones.
                </dd>
              </div>
            </dl>
          </header>

          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-900">Checklist rápido de carreira</h2>
            <p className="mt-3 text-sm text-slate-600">
              Priorize atividades que mantêm seu nome em evidência no mercado. Essas ações se conectam diretamente com o plano de métricas do gerador (currículos/dia, CTR de anúncios e palavras-chave que convertem).
            </p>
            <ul className="mt-6 space-y-4">
              {tips.map((tip) => (
                <li key={tip.title} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <span aria-hidden className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#2F6F68] text-xs font-bold text-white">
                    ✓
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{tip.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{tip.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900">Conteúdos recomendados</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {resources.map((resource) => (
                <a
                  key={resource.href}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-[#2F6F68]"
                  href={resource.href}
                >
                  <h3 className="text-base font-semibold text-slate-900">{resource.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{resource.description}</p>
                </a>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900">Organize seus próximos passos</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {nextSteps.map((step) => (
                <div key={step.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                </div>
              ))}
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
              Ideal para cursos rápidos, plataformas de vagas e serviços de mentoria de carreira.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="text-sm font-semibold text-slate-900">Quer mais visibilidade?</h2>
            <p className="mt-3 text-sm text-slate-600">
              Publique artigos no blog corporativo, compartilhe o link do currículo nas redes e acompanhe as métricas no Google Analytics para otimizar campanhas.
            </p>
            <a
              className="mt-4 inline-flex rounded-full bg-[#2F6F68] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#255852]"
              href="/contact"
            >
              Falar com nosso time
            </a>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="text-sm font-semibold text-slate-900">Métricas essenciais</h2>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              <li>• Currículos gerados por dia para medir tração do produto gratuito.</li>
              <li>• CTR dos anúncios em desktop e mobile para ajustar formatos.</li>
              <li>• Palavras-chave com maior tráfego orgânico para orientar novos conteúdos.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
