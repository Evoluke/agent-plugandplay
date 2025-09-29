"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";

export type FormData = {
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

export type GeneratedResume = {
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

type StepConfig = {
  id: string;
  title: string;
  description: string;
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

const STEPS: StepConfig[] = [
  {
    id: "informacoes",
    title: "Informações essenciais",
    description: "Preencha os dados de contato que aparecem no topo do currículo.",
  },
  {
    id: "experiencia",
    title: "Experiência e contexto",
    description: "Organize histórico profissional, resumo e conquistas em destaque.",
  },
  {
    id: "formacao",
    title: "Formação e habilidades",
    description: "Finalize com educação formal, competências e atividades extras.",
  },
];

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
    ? `${data.name.split(" ")[0]} é um${data.professionalTitle?.startsWith("A") ? "a" : ""} profissional ${levelCopy} ${areaSnippet}`
        .trim()
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

function splitParagraph(doc: jsPDF, text: string, maxWidth: number): string[] {
  const lines = doc.splitTextToSize(text, maxWidth);
  return Array.isArray(lines) ? lines : [lines];
}

function StepIndicator({
  steps,
  currentStep,
  onNavigate,
}: {
  steps: StepConfig[];
  currentStep: number;
  onNavigate: (index: number) => void;
}) {
  return (
    <ol className="grid gap-3 md:grid-cols-3" aria-label="Etapas do formulário">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const baseStyles = "rounded-2xl border px-4 py-3 text-left transition";
        const stateStyles = isActive
          ? "border-[#2F6F68] bg-[#E7F4F2] text-[#1F4F4A]"
          : isCompleted
          ? "border-[#93C5FD] bg-[#EFF6FF] text-[#1E3A8A] hover:border-[#60A5FA]"
          : "border-slate-200 bg-white text-slate-500";

        return (
          <li key={step.id}>
            <button
              type="button"
              className={`${baseStyles} ${stateStyles} w-full`}
              onClick={() => onNavigate(index)}
              disabled={!isActive && !isCompleted}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.28em]">
                Etapa {index + 1}
              </span>
              <span className="mt-2 block text-sm font-semibold text-inherit">{step.title}</span>
              <span className="mt-1 block text-xs text-inherit/80">{step.description}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function ResumePreview({ resume }: { resume: GeneratedResume }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <header className="border-b border-slate-100 pb-4">
        <h3 className="text-2xl font-semibold text-slate-900">{resume.header.name}</h3>
        {resume.header.title && (
          <p className="mt-1 text-sm font-medium text-[#2F6F68]">{resume.header.title}</p>
        )}
        {resume.header.contacts && (
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">
            {resume.header.contacts}
          </p>
        )}
      </header>

      <section className="mt-6 space-y-6 text-sm text-slate-600">
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Resumo profissional</h4>
          <p className="mt-2 leading-relaxed text-slate-700">{resume.summary}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Destaques</h4>
          <ul className="mt-3 space-y-2">
            {resume.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#2F6F68]" aria-hidden />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Experiência</h4>
          <div className="mt-3 space-y-4">
            {resume.experiences.map((experience) => (
              <div key={`${experience.headline}-${experience.company ?? ""}`}>
                <p className="text-sm font-semibold text-slate-800">{experience.headline}</p>
                {(experience.company || experience.period) && (
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                    {[experience.company, experience.period].filter(Boolean).join(" • ")}
                  </p>
                )}
                <p className="mt-2 leading-relaxed">{experience.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Formação acadêmica</h4>
          <ul className="mt-3 space-y-2">
            {resume.education.map((entry) => (
              <li key={entry} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#2F6F68]" aria-hidden />
                <span>{entry}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Competências</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-[#E0F2FE] px-3 py-1 text-xs font-medium text-[#0F172A]">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {resume.extras.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Informações adicionais</h4>
            <ul className="mt-3 space-y-2">
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

      <p className="mt-10 text-center text-xs uppercase tracking-[0.32em] text-slate-400">
        Gerado por Evoluke.com.br
      </p>
    </article>
  );
}

function FormActions({
  currentStep,
  stepCount,
  hasGenerated,
  onBack,
  onDownload,
}: {
  currentStep: number;
  stepCount: number;
  hasGenerated: boolean;
  onBack: () => void;
  onDownload: () => void;
}) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === stepCount - 1;

  return (
    <footer className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        {!isFirstStep && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            <span aria-hidden>←</span>
            Voltar
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {hasGenerated && (
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#2F6F68] px-5 py-2.5 text-sm font-semibold text-[#2F6F68] transition hover:bg-[#E7F4F2]"
          >
            <span aria-hidden>⬇</span>
            Baixar PDF gratuito
          </button>
        )}

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2F6F68] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#255852]"
        >
          {isLastStep ? (hasGenerated ? "Atualizar currículo" : "Gerar currículo agora") : "Continuar"}
          <span aria-hidden>→</span>
        </button>
      </div>
    </footer>
  );
}

export default function CurriculoWizard() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [currentStep, setCurrentStep] = useState(0);
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  const stepCount = STEPS.length;
  const progress = useMemo(() => Math.round(((currentStep + 1) / stepCount) * 100), [currentStep, stepCount]);

  const handleFieldChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleNavigateStep = useCallback((index: number) => {
    setCurrentStep((prev) => (index <= prev ? index : prev));
  }, []);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

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
    doc.text("Gerado por Evoluke.com.br", doc.internal.pageSize.getWidth() / 2, pageHeight - 24, { align: "center" });

    doc.save("curriculo-evoluke.pdf");
    setTimeout(() => router.push("/curriculo-ia/dicas"), 400);
  }, [resume, router]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const isLastStep = currentStep === stepCount - 1;
      if (!isLastStep) {
        setCurrentStep((prev) => Math.min(prev + 1, stepCount - 1));
        return;
      }

      setResume(buildResume(formData));
      setHasGenerated(true);
      setIsPreviewExpanded(true);
    },
    [currentStep, formData, stepCount],
  );

  useEffect(() => {
    if (hasGenerated) {
      setResume(buildResume(formData));
    }
  }, [formData, hasGenerated]);

  const handleReset = useCallback(() => {
    setFormData(INITIAL_FORM);
    setResume(null);
    setHasGenerated(false);
    setCurrentStep(0);
    setIsPreviewExpanded(false);
  }, []);

  const handleStart = useCallback(() => {
    const section = document.getElementById("curriculo-form");
    section?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const togglePreview = useCallback(() => {
    setIsPreviewExpanded((prev) => !prev);
  }, []);

  const renderStep = useCallback(() => {
    switch (currentStep) {
      case 0:
        return (
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
                autoComplete="name"
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
                autoComplete="organization-title"
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
                autoComplete="email"
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
                autoComplete="tel"
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
                autoComplete="address-level2"
              />
            </div>
          </div>
        );
      case 1:
        return (
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
                placeholder="Fale sobre seus objetivos, estilo de trabalho e principais entregas."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="experiences">
                Experiências profissionais (uma por linha)
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
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="achievements">
                Conquistas e resultados
              </label>
              <textarea
                id="achievements"
                rows={4}
                value={formData.achievements}
                onChange={(event) => handleFieldChange("achievements", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-[#2F6F68] focus:outline-none"
                placeholder="Separe por vírgulas ou quebras de linha. Ex.: Aumento de 40% no faturamento"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="education">
                Formação acadêmica
              </label>
              <textarea
                id="education"
                rows={4}
                value={formData.education}
                onChange={(event) => handleFieldChange("education", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-[#2F6F68] focus:outline-none"
                placeholder="Separe por linha. Ex.: Bacharel em Administração - USP"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="skills">
                Competências principais
              </label>
              <textarea
                id="skills"
                rows={4}
                value={formData.skills}
                onChange={(event) => handleFieldChange("skills", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-[#2F6F68] focus:outline-none"
                placeholder="Separe por vírgulas ou quebras de linha. Ex.: CRM, Prospecção, Gestão de projetos"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="extras">
                Informações adicionais
              </label>
              <textarea
                id="extras"
                rows={3}
                value={formData.extras}
                onChange={(event) => handleFieldChange("extras", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-[#2F6F68] focus:outline-none"
                placeholder="Idiomas, voluntariado, certificações, prêmios"
              />
              <p className="mt-2 text-xs text-slate-500">
                Use este campo para adicionar cursos rápidos, causas sociais e certificações relevantes para a vaga.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [currentStep, formData, handleFieldChange]);

  return (
    <main className="bg-gradient-to-b from-[#FAFAFA] to-white pb-16 pt-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 lg:flex-row">
        <div className="flex-1 space-y-12">
          <section className="rounded-3xl border border-slate-200 bg-white/80 p-10 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal-700">Currículo inteligente</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
              Monte seu currículo grátis em poucos cliques com IA
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Estruture experiências, conquistas e habilidades com recomendações geradas automaticamente. Visualize tudo em tempo
              real e baixe um PDF com marca Evoluke otimizada para recrutadores.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleStart}
                className="rounded-full bg-[#2F6F68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#255852]"
              >
                Começar agora
              </button>
              <p className="text-sm text-slate-500">
                Leva menos de 5 minutos para concluir as 3 etapas e gerar a prévia em tempo real.
              </p>
            </div>
            <dl className="mt-8 grid gap-6 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Foco em mobile</dt>
                <dd className="mt-2 text-sm text-slate-600">
                  Passos curtos, campos grandes e preview expansível garantem uma experiência fluida no celular.
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Texto confiável</dt>
                <dd className="mt-2 text-sm text-slate-600">
                  Sugestões de IA seguem boas práticas de UX writing e incluem métricas para destacar resultados.
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Ads prontos</dt>
                <dd className="mt-2 text-sm text-slate-600">
                  Blocos otimizados para Google AdSense posicionados em áreas de alta visibilidade.
                </dd>
              </div>
            </dl>
          </section>

          <section id="curriculo-form" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <header className="flex flex-col gap-6 border-b border-slate-100 pb-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Assistente guiado</h2>
                  <p className="text-sm text-slate-500">
                    Siga as etapas para criar um currículo enxuto. As respostas alimentam a pré-visualização à direita.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-[#2F6F68]">
                  <span className="hidden md:inline">Etapa {currentStep + 1} de {stepCount}</span>
                  <div className="h-2 w-40 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-[#2F6F68] transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
              <StepIndicator steps={STEPS} currentStep={currentStep} onNavigate={handleNavigateStep} />
            </header>

            <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
              {renderStep()}

              <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
                <p>
                  Dica rápida: utilize verbos fortes (liderou, entregou, estruturou) e números concretos para aumentar a percepção
                  de impacto das suas experiências.
                </p>
              </div>

              <FormActions
                currentStep={currentStep}
                stepCount={stepCount}
                hasGenerated={hasGenerated}
                onBack={handleBack}
                onDownload={handleDownload}
              />

              {hasGenerated && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300"
                >
                  Começar um novo currículo
                </button>
              )}
            </form>
          </section>

          {!hasGenerated && (
            <section className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900">Por que escolher a Evoluke?</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>• Experiência responsiva com foco em mobile-first e acessibilidade.</li>
                <li>• Campos inteligentes e dicas de escrita para acelerar o preenchimento.</li>
                <li>• Prévia atualizada em tempo real e download imediato com marca d’água discreta.</li>
                <li>• Conteúdos recomendados e campanhas pensadas para aumentar o tráfego qualificado.</li>
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
              Ideal para campanhas de recolocação, cursos e treinamentos de carreira.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">Pré-visualização</h4>
              <button
                type="button"
                onClick={togglePreview}
                className="rounded-full px-3 py-1 text-xs font-semibold text-[#2F6F68] transition hover:bg-[#E7F4F2] lg:hidden"
              >
                {isPreviewExpanded ? "Ocultar" : "Ver"}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              A visualização completa fica fixa em telas maiores. No mobile, expanda quando quiser revisar antes de baixar.
            </p>
          </div>

          {(hasGenerated || isPreviewExpanded) && resume && (
            <div className="lg:hidden">
              <ResumePreview resume={resume} />
            </div>
          )}

          <div className="hidden lg:block">
            {resume ? (
              <ResumePreview resume={resume} />
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
                A pré-visualização será exibida aqui após preencher os campos.
              </div>
            )}
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
              Acompanhe currículos gerados por dia, CTR dos anúncios e palavras-chave que trazem visitantes qualificados.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
