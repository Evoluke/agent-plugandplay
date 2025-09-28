import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/adsense/AdSlot";

const professions: Record<string, { title: string; tips: string[]; keywords: string[] }> = {
  enfermeiro: {
    title: "Enfermeiro",
    tips: [
      "Destaque experiências em hospitais, clínicas ou home care com volume de atendimentos.",
      "Inclua certificações como BLS, ACLS e cursos de manejo de equipamentos.",
    ],
    keywords: ["assistência", "segurança do paciente", "protocolos", "cuidados intensivos"],
  },
  vendedor: {
    title: "Vendedor",
    tips: [
      "Apresente metas batidas, ticket médio e indicadores de conversão.",
      "Mencione CRM utilizado, metodologias (SPIN, BANT) e cases relevantes.",
    ],
    keywords: ["prospectar", "negociação", "CRM", "relacionamento"],
  },
  designer: {
    title: "Designer",
    tips: [
      "Inclua portfólio, ferramentas (Figma, Adobe CC) e métricas de impacto visual.",
      "Descreva colaboração com squads, pesquisas UX e testes A/B.",
    ],
    keywords: ["ux", "ui", "figma", "prototipagem"],
  },
};

type PageProps = {
  params: { profissao: string };
};

export function generateStaticParams() {
  return Object.keys(professions).map((profissao) => ({ profissao }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const data = professions[params.profissao];
  if (!data) {
    return { title: "Currículo personalizado" };
  }
  return {
    title: `Como fazer currículo de ${data.title}`,
    description: `Estruture o currículo ideal para ${data.title} com dicas práticas e palavras-chave.`,
  };
}

export default function CurriculoProfissaoPage({ params }: PageProps) {
  const data = professions[params.profissao];
  if (!data) {
    notFound();
  }

  return (
    <div className="bg-white py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-neutral-900">Currículo para {data.title}</h1>
          <p className="text-neutral-600">
            Utilize conquistas mensuráveis, palavras-chave específicas e destaque certificações obrigatórias para aumentar o match com ATS.
          </p>
        </header>
        <section className="space-y-3 text-sm text-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900">Boas práticas</h2>
          <ul className="space-y-2">
            {data.tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--primary)]" />
                {tip}
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-3 text-sm text-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900">Palavras-chave sugeridas</h2>
          <div className="flex flex-wrap gap-2">
            {data.keywords.map((keyword) => (
              <span key={keyword} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
                {keyword}
              </span>
            ))}
          </div>
        </section>
        <AdSlot slot="4398761240" className="min-h-[90px]" />
      </div>
    </div>
  );
}
