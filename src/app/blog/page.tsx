import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog: dicas de currículo, carta de apresentação e entrevistas",
  description: "Tutoriais completos para construir currículos com IA, adaptar para vagas e se preparar para entrevistas.",
};

const posts = [
  {
    slug: "curriculo-ats-palavras-chave",
    title: "Como escolher palavras-chave para vencer o ATS",
    excerpt: "Aprenda a analisar descrições de vagas e adaptar o currículo para sistemas de triagem automática.",
  },
  {
    slug: "carta-de-apresentacao-que-converte",
    title: "Passo a passo para escrever uma carta de apresentação que converte",
    excerpt: "Estruture abertura, conquistas e call-to-action final utilizando IA como assistente.",
  },
  {
    slug: "template-curriculo-2025",
    title: "Template de currículo 2025: tendências aprovadas por recrutadores",
    excerpt: "Conheça os elementos de design e conteúdo que se destacam nas seleções atuais.",
  },
];

export default function BlogPage() {
  return (
    <div className="bg-neutral-50 py-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6">
        <header className="space-y-3 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900">Guia completo de currículos com IA</h1>
          <p className="text-neutral-600">Artigos atualizados com boas práticas de recrutadores e prompts prontos.</p>
        </header>
        <section className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-900">{post.title}</h2>
              <p className="mt-3 text-sm text-neutral-600">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex items-center text-sm font-semibold text-[var(--primary)]">
                Ler artigo →
              </Link>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
