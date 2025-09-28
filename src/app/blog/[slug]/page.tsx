import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/adsense/AdSlot";

const posts: Record<
  string,
  { title: string; description: string; content: string[]; publishedAt: string }
> = {
  "curriculo-ats-palavras-chave": {
    title: "Como escolher palavras-chave para vencer o ATS",
    description:
      "Entenda como ler descrições de vaga, extrair palavras-chave e posicioná-las no currículo para maximizar o score em sistemas de triagem.",
    content: [
      "Mapeie os termos repetidos na descrição da vaga e confirme se fazem sentido para sua experiência.",
      "Priorize palavras-chave no resumo profissional, nas três primeiras conquistas e na lista de skills.",
      "Use a IA do Currículo IA Pro para comparar vaga x currículo e sugerir sinônimos naturais.",
    ],
    publishedAt: "2025-02-10",
  },
  "carta-de-apresentacao-que-converte": {
    title: "Passo a passo para escrever uma carta de apresentação que converte",
    description:
      "Estruture introdução, evidência de conquistas e chamada para conversa utilizando prompts de IA.",
    content: [
      "Abra com uma conexão personalizada com a empresa ou o desafio da vaga.",
      "Conte uma história breve com números que comprovem sua entrega.",
      "Finalize convidando para uma conversa e reforçando disponibilidade.",
    ],
    publishedAt: "2025-02-08",
  },
  "template-curriculo-2025": {
    title: "Template de currículo 2025: tendências aprovadas por recrutadores",
    description:
      "Veja o que mudou nos layouts vencedores, como equilibrar cores e como o IA Pro ajuda a manter o design alinhado.",
    content: [
      "Seções modulares facilitam reordenar e personalizar versões por vaga.",
      "Tipografia sem serifa com títulos curtos melhora a leitura em telas.",
      "Elementos visuais devem ser leves para preservar compatibilidade com ATS.",
    ],
    publishedAt: "2025-02-05",
  },
};

type BlogPageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: BlogPageProps): Metadata {
  const post = posts[params.slug];
  if (!post) {
    return { title: "Artigo não encontrado" };
  }
  return {
    title: `${post.title} | Currículo IA Pro`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default function BlogPostPage({ params }: BlogPageProps) {
  const post = posts[params.slug];
  if (!post) {
    notFound();
  }

  return (
    <div className="bg-white py-16">
      <Script id={`article-schema-${params.slug}`} type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.description,
          datePublished: post.publishedAt,
          author: { '@type': 'Organization', name: 'Currículo IA Pro' },
        })}
      </Script>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6">
        <header className="space-y-3">
          <span className="text-xs uppercase tracking-wide text-[var(--primary)]">Blog</span>
          <h1 className="text-3xl font-semibold text-neutral-900">{post.title}</h1>
          <p className="text-neutral-600">{post.description}</p>
        </header>
        <article className="space-y-4 text-sm text-neutral-700">
          {post.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </article>
        <AdSlot slot="4398761241" className="min-h-[90px]" />
      </div>
    </div>
  );
}
