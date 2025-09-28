import type { Metadata } from "next";

const sections = [
  {
    title: "Comece com um objetivo claro",
    body:
      "Explique em uma frase o cargo que procura, a disponibilidade para jornada e o valor que entrega. Se ainda não tem experiência formal, destaque projetos universitários, monitorias ou trabalhos voluntários alinhados ao perfil da vaga.",
  },
  {
    title: "Transforme atividades em resultados",
    body:
      "Liste participações em atléticas, empresas juniores, iniciação científica ou eventos como experiências. Converta tarefas em resultados mensuráveis: número de participantes organizados, verba arrecadada, índices de satisfação ou melhorias de processo.",
  },
  {
    title: "Aposte em habilidades comportamentais",
    body:
      "Recrutadores valorizam proatividade, comunicação e colaboração. Use exemplos concretos: apresentações feitas, feedbacks recebidos, times multidisciplinares com os quais colaborou.",
  },
  {
    title: "Palavras-chave que ajudam na triagem",
    body:
      "Inclua termos ligados ao cargo (CRM, atendimento ao cliente, Excel, marketing digital, programação). Observe anúncios semelhantes e replique as expressões mais recorrentes.",
  },
];

export const metadata: Metadata = {
  title: "Currículo para primeiro emprego: modelo comentado",
  description:
    "Aprenda a montar um currículo para a primeira oportunidade destacando conquistas acadêmicas e projetos com métricas claras.",
  alternates: {
    canonical: "/blog/curriculo-primeiro-emprego",
  },
};

export default function FirstJobResumePage() {
  return (
    <main className="bg-gradient-to-b from-[#FAFAFA] to-white pb-16 pt-20">
      <article className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4">
        <header className="rounded-3xl border border-slate-200 bg-white/90 p-10 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">Modelos de currículo</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
            Currículo para primeiro emprego: modelo comentado passo a passo
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Destaque sua evolução acadêmica, projetos extracurriculares e habilidades técnicas para conquistar a primeira vaga com confiança.
          </p>
          <a
            className="mt-6 inline-flex rounded-full bg-[#2F6F68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#255852]"
            href="/curriculo-ia"
          >
            Montar currículo com IA
          </a>
        </header>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-slate-900">Estrutura sugerida</h2>
          <ol className="mt-4 space-y-3 text-sm text-slate-600">
            <li>1. Dados pessoais e objetivo profissional.</li>
            <li>2. Resumo com projetos acadêmicos ou voluntários relevantes.</li>
            <li>3. Experiências (incluindo monitorias, empresas juniores, eventos).</li>
            <li>4. Formação acadêmica e cursos complementares.</li>
            <li>5. Habilidades técnicas, idiomas e certificações.</li>
          </ol>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
              <p className="mt-3 text-sm text-slate-600">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900">Checklist rápido antes de enviar</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>• O resumo está alinhado com a vaga desejada.</li>
            <li>• Experiências trazem números ou impactos concretos.</li>
            <li>• Cursos e certificações estão atualizados.</li>
            <li>• Incluí links relevantes (LinkedIn, portfólio, GitHub).</li>
            <li>• Revisei o português e pedi feedback para alguém de confiança.</li>
          </ul>
          <p className="mt-6 text-sm text-slate-600">
            Dica extra: cada vez que gerar um currículo na Evoluke, monitore quais palavras-chave atraem mais visitas ao seu perfil usando o Google Analytics ou o LinkedIn Analytics.
          </p>
        </section>

        <footer className="rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900">Pronto para seu primeiro currículo profissional?</h2>
          <p className="mt-3 text-sm text-slate-600">
            Acesse o gerador gratuito da Evoluke, preencha os 3 passos e receba um PDF pronto com marca d’água discreta.
          </p>
          <a
            className="mt-5 inline-flex rounded-full bg-[#2F6F68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#255852]"
            href="/curriculo-ia"
          >
            Gerar currículo agora
          </a>
        </footer>
      </article>
    </main>
  );
}
