import type { Metadata } from "next";
import { AdSlot } from "@/components/adsense/AdSlot";

export const metadata: Metadata = {
  title: "Como fazer currículo para primeiro emprego | Currículo IA Pro",
  description:
    "Guia prático para montar o primeiro currículo, com exemplos de resumo, experiências acadêmicas e atividades extracurriculares.",
};

const dicas = [
  "Comece com um objetivo claro destacando a área de interesse.",
  "Liste experiências acadêmicas, projetos voluntários e cursos livres.",
  "Use bullets com foco em resultados mesmo em atividades extracurriculares.",
  "Inclua habilidades comportamentais e técnicas adquiridas nos estudos.",
];

export default function CurriculoPrimeiroEmpregoPage() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold text-neutral-900">Como fazer currículo para primeiro emprego</h1>
          <p className="text-neutral-600">
            Mesmo sem experiência formal, é possível construir um currículo competitivo. Destaque projetos acadêmicos, cursos livres, atividades voluntárias e conquistas que demonstrem responsabilidade e aprendizado rápido.
          </p>
        </header>
        <section className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-xl font-semibold text-neutral-900">Checklist essencial</h2>
          <ul className="mt-4 space-y-2 text-sm text-neutral-700">
            {dicas.map((dica) => (
              <li key={dica} className="flex items-start gap-2">
                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--primary)]" />
                {dica}
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-4 text-sm text-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900">Exemplo de resumo profissional</h2>
          <p>
            &ldquo;Estudante de Administração com participação em empresa júnior e projetos de consultoria acadêmica. Organizei feiras de negócios locais, captei 12 patrocinadores e auxiliei na análise de indicadores financeiros para microempresas. Busco oportunidade como assistente administrativo para aplicar visão analítica e foco em resultados.&rdquo;
          </p>
        </section>
        <AdSlot slot="4398761238" className="min-h-[90px]" />
      </div>
    </div>
  );
}
