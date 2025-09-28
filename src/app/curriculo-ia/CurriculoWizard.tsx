"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";

type FormData = {
  name: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  areaAtuacao: string;
  experienceLevel: string;
  summary: string;
  experiences: string;
  achievements: string;
  education: string;
  skills: string;
  extras: string;
};

type ResumeExperience = {
  headline: string;
  company?: string;
  period?: string;
  description: string;
};

type GeneratedResume = {
  header: {
    name: string;
    title: string;
    contacts: string;
  };
  summary: string;
  highlights: string[];
  experiences: ResumeExperience[];
  education: string[];
  skills: string[];
  extras: string[];
};

const INITIAL_FORM: FormData = {
  name: "",
  professionalTitle: "",
  email: "",
  phone: "",
  location: "",
  areaAtuacao: "",
  experienceLevel: "",
  summary: "",
  experiences: "",
  achievements: "",
  education: "",
  skills: "",
  extras: "",
};

const EXPERIENCE_LEVEL_COPY: Record<string, string> = {
  Iniciante: "iniciante",
  "Intermediário": "com experiência intermediária",
  Pleno: "nível pleno",
  Sênior: "nível sênior",
  Liderança: "experiência em liderança",
};

function parseList(value: string): string[] {
  return value
    .split(/\r?\n|[,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseExperiences(value: string): ResumeExperience[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [roleSegment, descriptionSegment] = line.split(":");
      const [headlineRaw, companyRaw] = roleSegment?.split(" - ") ?? [];
      const [company, period] = companyRaw?.split("(") ?? [];
      const cleanPeriod = period ? period.replace(")", "").trim() : undefined;

      return {
        headline: headlineRaw?.trim() ?? line,
        company: company?.trim(),
        period: cleanPeriod,
        description: (descriptionSegment ?? "Resultados e responsabilidades principais.").trim(),
      } satisfies ResumeExperience;
    });
}

function createSummary(data: FormData): string {
  const levelCopy = EXPERIENCE_LEVEL_COPY[data.experienceLevel] ?? "com experiência comprovada";
  const areaSnippet = data.areaAtuacao ? `na área de ${data.areaAtuacao}` : "";
  const intro = data.name
    ? `${data.name.split(" ")[0]} é um${data.professionalTitle?.startsWith("A") ? "a" : ""} profissional ${levelCopy} ${areaSnippet}`.trim()
    : `Profissional ${levelCopy} ${areaSnippet}`.trim();
  const summaryBase = data.summary
    ? data.summary.trim()
    : `Focado(a) em entregar resultados mensuráveis, com facilidade para colaborar com equipes multidisciplinares e transformar dados em decisões.`;

  const achievementCue = data.achievements
    ? ` Destaque para conquistas como ${parseList(data.achievements)
        .slice(0, 2)
        .map((item) => item.toLowerCase())
        .join(" e ")}.`
    : "";

  return `${intro}. ${summaryBase}${achievementCue}`.replace(/\s+/g, " ");
}

function buildResume(data: FormData): GeneratedResume {
  const experiences = parseExperiences(data.experiences);
  const education = parseList(data.education);
  const skills = parseList(data.skills);
  const extras = parseList(data.extras);
  const highlights = parseList(data.achievements);

  const contacts = [data.email, data.phone, data.location]
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" • ");

  const title = data.professionalTitle
    ? data.professionalTitle
    : data.areaAtuacao
    ? `Profissional de ${data.areaAtuacao}`
    : "Profissional multidisciplinar";

  return {
    header: {
      name: data.name || "Nome do(a) candidato(a)",
      title,
      contacts,
    },
    summary: createSummary(data),
    highlights: highlights.length
      ? highlights
      : [
          "Capacidade de estruturar processos eficientes com foco em métricas e impacto no cliente",
          "Comunicação clara com stakeholders e colaboração em squads multidisciplinares",
        ],
    experiences: experiences.length
      ? experiences
      : [
          {
            headline: "Experiência relevante",
            description:
              "Responsável por projetos com metas bem definidas, atuando com foco em crescimento e melhoria contínua.",
          },
        ],
    education: education.length ? education : ["Formação acadêmica disponível mediante solicitação."],
    skills: skills.length
      ? skills
      : ["Planejamento estratégico", "Comunicação interpessoal", "Ferramentas digitais"],
    extras,
  };
}

function splitParagraph(doc: jsPDF, text: string, maxWidth: number) {
  return doc.splitTextToSize(text, maxWidth);
}

export default function CurriculoWizard() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [currentStep, setCurrentStep] = useState(0);
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const progress = useMemo(() => Math.round(((currentStep + 1) / 3) * 100), [currentStep]);

  const handleFieldChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  }, []);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleGenerate = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const generatedResume = buildResume(formData);
      setResume(generatedResume);
      setHasGenerated(true);
      setCurrentStep(2);
    },
    [formData],
  );

  const handleDownload = useCallback(() => {
    if (!resume) {
      return;
    }

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const usableWidth = doc.internal.pageSize.getWidth() - margin * 2;
    let cursorY = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(resume.header.name, margin, cursorY);

    cursorY += 22;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    if (resume.header.title) {
      doc.text(resume.header.title, margin, cursorY);
      cursorY += 18;
    }

    if (resume.header.contacts) {
      doc.setTextColor(90);
      doc.text(resume.header.contacts, margin, cursorY);
      doc.setTextColor(0);
      cursorY += 24;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Resumo profissional", margin, cursorY);
    cursorY += 18;

    doc.setFont("helvetica", "normal");
    splitParagraph(doc, resume.summary, usableWidth).forEach((line) => {
      doc.text(line, margin, cursorY);
      cursorY += 18;
    });

    cursorY += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Destaques", margin, cursorY);
    cursorY += 18;
    doc.setFont("helvetica", "normal");
    resume.highlights.forEach((highlight) => {
      const lines = splitParagraph(doc, `• ${highlight}`, usableWidth);
      lines.forEach((line) => {
        doc.text(line, margin, cursorY);
        cursorY += 18;
      });
    });

    cursorY += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Experiência profissional", margin, cursorY);
    cursorY += 18;
    doc.setFont("helvetica", "normal");
    resume.experiences.forEach((experience) => {
      doc.setFont("helvetica", "bold");
      doc.text(experience.headline, margin, cursorY);
      cursorY += 16;
      doc.setFont("helvetica", "normal");
      if (experience.company || experience.period) {
        const companyLine = [experience.company, experience.period].filter(Boolean).join(" • ");
        doc.text(companyLine, margin, cursorY);
        cursorY += 16;
      }
      splitParagraph(doc, experience.description, usableWidth).forEach((line) => {
        doc.text(line, margin, cursorY);
        cursorY += 18;
      });
      cursorY += 12;
    });

    doc.setFont("helvetica", "bold");
    doc.text("Formação acadêmica", margin, cursorY);
    cursorY += 18;
    doc.setFont("helvetica", "normal");
    resume.education.forEach((entry) => {
      splitParagraph(doc, `• ${entry}`, usableWidth).forEach((line) => {
        doc.text(line, margin, cursorY);
        cursorY += 18;
      });
    });

    cursorY += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Competências", margin, cursorY);
    cursorY += 18;
    doc.setFont("helvetica", "normal");
    const skillsLine = `• ${resume.skills.join(", ")}`;
    splitParagraph(doc, skillsLine, usableWidth).forEach((line) => {
      doc.text(line, margin, cursorY);
      cursorY += 18;
    });

    if (resume.extras.length) {
      cursorY += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Informações adicionais", margin, cursorY);
      cursorY += 18;
      doc.setFont("helvetica", "normal");
      resume.extras.forEach((entry) => {
        splitParagraph(doc, `• ${entry}`, usableWidth).forEach((line) => {
          doc.text(line, margin, cursorY);
          cursorY += 18;
        });
      });
    }

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setTextColor(150);
    doc.setFontSize(10);
    doc.text(
      "Gerado por Evoluke.com.br",
      doc.internal.pageSize.getWidth() / 2,
      pageHeight - 24,
      { align: "center" },
    );

    doc.save("curriculo-evoluke.pdf");
    setTimeout(() => router.push("/curriculo-ia/dicas"), 400);
  }, [resume, router]);

  const handleReset = useCallback(() => {
    setFormData(INITIAL_FORM);
    setResume(null);
    setHasGenerated(false);
    setCurrentStep(0);
  }, []);

  const handleStart = useCallback(() => {
    const section = document.getElementById("curriculo-form");
    section?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <main className="bg-gradient-to-b from-[#FAFAFA] to-white pb-16 pt-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 lg:flex-row">
        <div className="flex-1 space-y-10">
          <section className="rounded-3xl border border-slate-200 bg-white/80 p-10 shadow-lg">
            <p className="text-sm font-medium uppercase tracking-widest text-teal-700">Currículo inteligente</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
              Monte seu currículo grátis em poucos cliques com IA
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Organize sua trajetória profissional com orientações inteligentes, visualização instantânea e download em PDF com a marca Evoluke.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleStart}
                className="rounded-full bg-[#2F6F68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#255852]"
              >
                Criar meu currículo agora
              </button>
              <p className="text-sm text-slate-500">
                Leva menos de 5 minutos para concluir os 3 passos e baixar seu PDF profissional.
              </p>
            </div>
          </section>

          <section id="curriculo-form" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <header className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Assistente guiado</h2>
                <p className="text-sm text-slate-500">Responda às perguntas em até 3 etapas. A IA monta o currículo completo automaticamente.</p>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-[#2F6F68]">
                <span className="hidden md:inline">Etapa {currentStep + 1} de 3</span>
                <div className="h-2 w-40 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#2F6F68] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </header>

            <form className="mt-8 space-y-8" onSubmit={handleGenerate}>
              {currentStep === 0 && (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="name">
                      Nome completo
                    </label>
                    <input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(event) => handleFieldChange("name", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-[#2F6F68] focus:outline-none"
                      placeholder="Ex.: Ana Silva"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="professionalTitle">
                      Título profissional
                    </label>
                    <input
                      id="professionalTitle"
                      value={formData.professionalTitle}
                      onChange={(event) => handleFieldChange("professionalTitle", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-[#2F6F68] focus:outline-none"
                      placeholder="Ex.: Analista de Marketing Digital"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="email">
                      E-mail principal
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(event) => handleFieldChange("email", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-[#2F6F68] focus:outline-none"
                      placeholder="seunome@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="phone">
                      Telefone/WhatsApp
                    </label>
                    <input
                      id="phone"
                      value={formData.phone}
                      onChange={(event) => handleFieldChange("phone", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-[#2F6F68] focus:outline-none"
                      placeholder="(11) 90000-0000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="location">
                      Cidade/UF
                    </label>
                    <input
                      id="location"
                      value={formData.location}
                      onChange={(event) => handleFieldChange("location", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-[#2F6F68] focus:outline-none"
                      placeholder="Ex.: São Paulo - SP"
                    />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700" htmlFor="areaAtuacao">
                        Área de atuação
                      </label>
                      <input
                        id="areaAtuacao"
                        value={formData.areaAtuacao}
                        onChange={(event) => handleFieldChange("areaAtuacao", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-[#2F6F68] focus:outline-none"
                        placeholder="Ex.: Marketing, Tecnologia, Vendas"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700" htmlFor="experienceLevel">
                        Nível de experiência
                      </label>
                      <select
                        id="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={(event) => handleFieldChange("experienceLevel", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-[#2F6F68] focus:outline-none"
                      >
                        <option value="">Selecione</option>
                        <option>Iniciante</option>
                        <option>Intermediário</option>
                        <option>Pleno</option>
                        <option>Sênior</option>
                        <option>Liderança</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="summary">
                      Descrição profissional
                    </label>
                    <textarea
                      id="summary"
                      rows={4}
                      value={formData.summary}
                      onChange={(event) => handleFieldChange("summary", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-[#2F6F68] focus:outline-none"
                      placeholder="Fale rapidamente sobre seus objetivos, estilo de trabalho e principais entregas."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="experiences">
                      Experiências profissionais (um por linha)
                    </label>
                    <textarea
                      id="experiences"
                      rows={5}
                      value={formData.experiences}
                      onChange={(event) => handleFieldChange("experiences", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-[#2F6F68] focus:outline-none"
                      placeholder="Cargo - Empresa (período): Principais resultados e responsabilidades"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Ex.: Analista de Vendas - Loja XPTO (2022-Atual): Criei playbook comercial e aumentei em 35% o ticket médio.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="achievements">
                      Conquistas em destaque (uma por linha)
                    </label>
                    <textarea
                      id="achievements"
                      rows={4}
                      value={formData.achievements}
                      onChange={(event) => handleFieldChange("achievements", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-[#2F6F68] focus:outline-none"
                      placeholder="Premiações, metas batidas, projetos estratégicos ou certificações relevantes"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="education">
                      Formação acadêmica (uma por linha)
                    </label>
                    <textarea
                      id="education"
                      rows={4}
                      value={formData.education}
                      onChange={(event) => handleFieldChange("education", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-[#2F6F68] focus:outline-none"
                      placeholder="Curso - Instituição (ano): Foco principal"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="skills">
                      Habilidades e ferramentas (separe por vírgula ou linha)
                    </label>
                    <textarea
                      id="skills"
                      rows={3}
                      value={formData.skills}
                      onChange={(event) => handleFieldChange("skills", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-[#2F6F68] focus:outline-none"
                      placeholder="Gestão de projetos, Power BI, Metodologia Ágil, CRM"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="extras">
                      Informações adicionais (opcional)
                    </label>
                    <textarea
                      id="extras"
                      rows={3}
                      value={formData.extras}
                      onChange={(event) => handleFieldChange("extras", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-[#2F6F68] focus:outline-none"
                      placeholder="Disponibilidade para viagens, idiomas ou trabalho voluntário"
                    />
                  </div>
                </div>
              )}

              <footer className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                    >
                      Voltar
                    </button>
                  )}
                  {currentStep < 2 && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="rounded-full bg-[#2F6F68] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#255852]"
                    >
                      Próximo passo
                    </button>
                  )}
                </div>
                {currentStep === 2 && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      type="submit"
                      className="rounded-full bg-[#2F6F68] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#255852]"
                    >
                      Gerar currículo com IA
                    </button>
                    <p className="text-xs text-slate-500">
                      Revisamos as respostas automaticamente para sugerir textos profissionais.
                    </p>
                  </div>
                )}
              </footer>
            </form>
          </section>

          {resume && (
            <section className="rounded-3xl border border-teal-100 bg-white/90 p-8 shadow-xl">
              <header className="flex flex-col gap-2 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Pré-visualização do currículo</h2>
                  <p className="text-sm text-slate-500">
                    Ajuste as respostas acima se quiser refinar. O PDF trará esta mesma estrutura com a marca da Evoluke.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="rounded-full bg-[#2F6F68] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#255852]"
                  >
                    Baixar PDF gratuito
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                  >
                    Começar novamente
                  </button>
                </div>
              </header>

              <article className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-inner">
                <div className="border-b border-slate-100 pb-6">
                  <h3 className="text-2xl font-semibold text-slate-900">{resume.header.name}</h3>
                  <p className="text-sm font-medium text-[#2F6F68]">{resume.header.title}</p>
                  {resume.header.contacts && (
                    <p className="mt-2 text-sm text-slate-500">{resume.header.contacts}</p>
                  )}
                </div>

                <section className="mt-6 space-y-4">
                  <div>
                    <h4 className="text-base font-semibold uppercase tracking-wide text-slate-700">Resumo profissional</h4>
                    <p className="mt-2 text-sm text-slate-600">{resume.summary}</p>
                  </div>

                  <div>
                    <h4 className="text-base font-semibold uppercase tracking-wide text-slate-700">Destaques</h4>
                    <ul className="mt-2 space-y-2 text-sm text-slate-600">
                      {resume.highlights.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#2F6F68]" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-base font-semibold uppercase tracking-wide text-slate-700">Experiência profissional</h4>
                    <div className="mt-2 space-y-4">
                      {resume.experiences.map((experience) => (
                        <div key={`${experience.headline}-${experience.company ?? ""}`} className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-800">{experience.headline}</p>
                          {(experience.company || experience.period) && (
                            <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                              {[experience.company, experience.period].filter(Boolean).join(" • ")}
                            </p>
                          )}
                          <p className="mt-2 text-sm text-slate-600">{experience.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-semibold uppercase tracking-wide text-slate-700">Formação acadêmica</h4>
                    <ul className="mt-2 space-y-2 text-sm text-slate-600">
                      {resume.education.map((entry) => (
                        <li key={entry} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#2F6F68]" aria-hidden />
                          <span>{entry}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-base font-semibold uppercase tracking-wide text-slate-700">Competências</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {resume.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-[#E0F2FE] px-3 py-1 text-xs font-medium text-[#0F172A]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {resume.extras.length > 0 && (
                    <div>
                      <h4 className="text-base font-semibold uppercase tracking-wide text-slate-700">Informações adicionais</h4>
                      <ul className="mt-2 space-y-2 text-sm text-slate-600">
                        {resume.extras.map((entry) => (
                          <li key={entry} className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#2F6F68]" aria-hidden />
                            <span>{entry}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>

                <p className="mt-8 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
                  Gerado por Evoluke.com.br
                </p>
              </article>
            </section>
          )}

          {!hasGenerated && (
            <section className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900">Por que usar o gerador da Evoluke?</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>
                  • Sugestões automáticas de texto com tom profissional alinhado às melhores práticas de recrutamento.
                </li>
                <li>• Layout limpo com foco no conteúdo que recrutadores procuram em processos seletivos.</li>
                <li>• Download imediato em PDF com marca d’água discreta da Evoluke para fortalecer seu networking.</li>
                <li>• Recomendamos conteúdos de carreira e vagas alinhadas ao seu perfil após o download.</li>
              </ul>
            </section>
          )}
        </div>

        <aside className="w-full space-y-6 lg:w-72">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-md">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Espaço publicitário</p>
            <div
              className="mt-4 flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400"
              data-ad-slot="curriculo-ia-top"
            >
              Google Ads 300×250
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Reserve este bloco para campanhas de remarketing ou parceiros estratégicos.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
            <h4 className="text-sm font-semibold text-slate-900">Conteúdos de carreira</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>
                <a className="text-[#2F6F68] hover:underline" href="/blog/curriculo-primeiro-emprego">
                  Currículo para primeiro emprego: modelo pronto
                </a>
              </li>
              <li>
                <a className="text-[#2F6F68] hover:underline" href="/blog/curriculo-vendedor">
                  Exemplo de currículo para vendedor de alta performance
                </a>
              </li>
              <li>
                <a className="text-[#2F6F68] hover:underline" href="/blog/como-fazer-curriculo-2025">
                  Como fazer currículo competitivo em 2025
                </a>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
            <h4 className="text-sm font-semibold text-slate-900">Métrica acompanhada</h4>
            <p className="mt-3 text-sm text-slate-600">
              Monitore currículos gerados por dia, acompanhe o CTR dos anúncios e descubra as palavras-chave que trazem mais visitas.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
