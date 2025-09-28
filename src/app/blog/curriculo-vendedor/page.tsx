import type { Metadata } from "next";

const metrics = [
  "Ticket médio", "Conversão de propostas", "Tempo de ciclo", "Carteira ativa", "Receita recorrente"
];

const checklist = [
  "Informar segmentação da carteira (varejo, PME, enterprise)",
  "Destacar soluções vendidas e diferenciais competitivos",
  "Apresentar metas batidas em % ou valores absolutos",
  "Mencionar ferramentas de CRM, prospecção e automação utilizadas",
  "Adicionar depoimentos ou reconhecimentos internos quando possível",
];

export const metadata: Metadata = {
  title: "Currículo para vendedor: como destacar performance",
  description:
    "Construa um currículo comercial com indicadores concretos, diferenciais de relacionamento e domínio de ferramentas de vendas.",
  alternates: {
    canonical: "/blog/curriculo-vendedor",
  },
};

export default function SalesResumePage() {
  return (
    <main className="bg-gradient-to-b from-[#FAFAFA] to-white pb-16 pt-20">
      <article className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4">
        <header className="rounded-3xl border border-slate-200 bg-white/90 p-10 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">Modelos de currículo</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
            Currículo para vendedor: mostre resultados e relacionamento com clientes
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Estruture um documento com dados de performance, estratégias de prospecção e fidelização para crescer na carreira comercial.
          </p>
          <a
            className="mt-6 inline-flex rounded-full bg-[#2F6F68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#255852]"
            href="/curriculo-ia"
          >
            Gerar currículo com IA
          </a>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-slate-900">Indicadores que não podem faltar</h2>
          <p className="mt-3 text-sm text-slate-600">
            Utilize números para comprovar impacto em vendas consultivas, varejo ou inside sales. Os recrutadores procuram informações objetivas como:
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
            {metrics.map((metric) => (
              <li key={metric} className="rounded-2xl bg-slate-50 px-4 py-3">• {metric}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900">Como contar sua história comercial</h2>
          <p className="mt-3 text-sm text-slate-600">
            Conte cada experiência com foco no cliente atendido, desafios enfrentados e resultados atingidos. Demonstre domínio de funil, cadência de prospecção e relacionamento pós-venda.
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Inclua cases resumidos: “recuperei contas inativas”, “estruturei playbook outbound”, “implementei CRM e aumentei previsibilidade de receita”.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900">Checklist do currículo de vendas</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {checklist.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900">Exemplo de resumo profissional</h2>
          <p className="mt-3 text-sm text-slate-600">
            “Profissional de vendas consultivas com 6 anos de experiência em SaaS B2B. Especialista em mapear stakeholders, estruturar demonstrações personalizadas e criar planos de ROI. Responsável por ampliar a carteira ativa em 42% e reduzir churn de clientes estratégicos para 3% ao ano.”
          </p>
        </section>

        <footer className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900">Pronto para atualizar seu currículo de vendas?</h2>
          <p className="mt-3 text-sm text-slate-600">
            Utilize o gerador gratuito da Evoluke para organizar experiências, conquistas e habilidades em um PDF pronto para compartilhar.
          </p>
          <a
            className="mt-5 inline-flex rounded-full bg-[#2F6F68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#255852]"
            href="/curriculo-ia"
          >
            Montar currículo agora
          </a>
        </footer>
      </article>
    </main>
  );
}
