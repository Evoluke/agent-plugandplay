import type { Metadata } from "next";

const posts = [
  {
    slug: "curriculo-primeiro-emprego",
    title: "Currículo para primeiro emprego: como destacar seu potencial",
    excerpt:
      "Aprenda a transformar atividades acadêmicas, cursos livres e projetos voluntários em experiências relevantes para a primeira vaga.",
    readingTime: "8 min de leitura",
    category: "Guia prático",
  },
  {
    slug: "curriculo-vendedor",
    title: "Exemplo de currículo para vendedor de alta performance",
    excerpt:
      "Use indicadores comerciais, metas batidas e relacionamento com clientes para conquistar oportunidades no varejo e B2B.",
    readingTime: "7 min de leitura",
    category: "Modelos prontos",
  },
  {
    slug: "como-fazer-curriculo-2025",
    title: "Como fazer currículo competitivo em 2025",
    excerpt:
      "Combine IA, habilidades digitais e soft skills para atualizar seu currículo às tendências mais buscadas pelos recrutadores.",
    readingTime: "10 min de leitura",
    category: "Tendências",
  },
];

export const metadata: Metadata = {
  title: "Blog de carreira da Evoluke",
  description:
    "Artigos sobre currículos, entrevistas e tendências de mercado com CTA direto para o gerador gratuito de currículo com IA.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  return (
    <main className="bg-gradient-to-b from-[#FAFAFA] to-white pb-20 pt-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 lg:flex-row">
        <section className="flex-1 space-y-10">
          <header className="rounded-3xl border border-slate-200 bg-white/90 p-10 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">Carreira em foco</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
              Conteúdos para aumentar suas chances na próxima oportunidade
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Atualizamos o blog semanalmente com exemplos práticos, templates e checklists conectados ao gerador de currículo da Evoluke.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                className="rounded-full bg-[#2F6F68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#255852]"
                href="/curriculo-ia"
              >
                Criar currículo agora
              </a>
              <p className="text-sm text-slate-500">
                Gere seu currículo gratuito e receba recomendações personalizadas após o download.
              </p>
            </div>
          </header>

          <section className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:border-[#2F6F68]"
              >
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2F6F68]">{post.category}</span>
                  <h2 className="mt-3 text-xl font-semibold text-slate-900">{post.title}</h2>
                  <p className="mt-3 text-sm text-slate-600">{post.excerpt}</p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
                  <span>{post.readingTime}</span>
                  <span>CTA: Gerar currículo com IA</span>
                </div>
              </a>
            ))}
          </section>
        </section>

        <aside className="w-full space-y-6 lg:w-72">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-md">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Espaço publicitário</p>
            <div
              className="mt-4 flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400"
              data-ad-slot="blog-sidebar"
            >
              Google Ads 300×250
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Insira campanhas de cursos online, programas de idiomas ou vagas patrocinadas.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="text-sm font-semibold text-slate-900">Guia rápido para SEO</h2>
            <ul className="mt-4 space-y-2 text-xs text-slate-600">
              <li>• Publique semanalmente artigos com palavras-chave long tail.</li>
              <li>• Inclua CTAs internos apontando para /curriculo-ia.</li>
              <li>• Monitore palavras-chave com Search Console e ajuste títulos.</li>
              <li>• Acompanhe CTR dos anúncios nas páginas mais acessadas.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
