"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { upsertResume } from "@/lib/resumeStorage.client";
import type { ResumePayload } from "@/lib/resume";
import { blankResume } from "@/lib/resume";
import { AdSlot } from "@/components/adsense/AdSlot";

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const steps: { id: Step; label: string }[] = [
  { id: 0, label: "Dados pessoais" },
  { id: 1, label: "Experiências" },
  { id: 2, label: "Formação" },
  { id: 3, label: "Skills e idiomas" },
  { id: 4, label: "Objetivo e foco" },
  { id: 5, label: "Revisão" },
];

export function ResumeWizard({ email }: { email?: string | null }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resume, setResume] = useState<ResumePayload>(() => blankResume(nanoid(), email));
  const [error, setError] = useState<string | null>(null);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  const updateResume = useCallback((update: Partial<ResumePayload>) => {
    let nextState: ResumePayload | null = null;
    setResume((prev) => {
      nextState = { ...prev, ...update };
      return nextState;
    });
    if (nextState) {
      upsertResume(nextState).catch((err) => console.error(err));
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (!resume.fullName || resume.fullName.trim().length < 2) {
        setStep(0);
        throw new Error("Informe o nome completo antes de gerar o currículo.");
      }
      await upsertResume(resume);
      const response = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.message ?? "Erro ao gerar currículo");
      }

      router.push(`/resumes/${resume.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }, [resume, router]);

  const renderStep = useMemo(() => {
    switch (step) {
      case 0:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              Nome completo
              <input
                className="rounded-lg border border-neutral-200 px-3 py-2"
                value={resume.fullName}
                onChange={(event) => updateResume({ fullName: event.target.value })}
                placeholder="Ex.: Ana Souza"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Cargo atual ou desejado
              <input
                className="rounded-lg border border-neutral-200 px-3 py-2"
                value={resume.headline ?? ""}
                onChange={(event) => updateResume({ headline: event.target.value })}
                placeholder="Ex.: Product Manager"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Telefone
              <input
                className="rounded-lg border border-neutral-200 px-3 py-2"
                value={resume.phone ?? ""}
                onChange={(event) => updateResume({ phone: event.target.value })}
                placeholder="(11) 99999-9999"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Localização
              <input
                className="rounded-lg border border-neutral-200 px-3 py-2"
                value={resume.location ?? ""}
                onChange={(event) => updateResume({ location: event.target.value })}
                placeholder="São Paulo - SP"
              />
            </label>
            <label className="md:col-span-2 flex flex-col gap-1 text-sm">
              Objetivo profissional
              <textarea
                className="h-24 rounded-lg border border-neutral-200 px-3 py-2"
                value={resume.objective ?? ""}
                onChange={(event) => updateResume({ objective: event.target.value })}
                placeholder="Conte qual desafio deseja assumir e o impacto que quer gerar."
              />
            </label>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            {resume.experiences.map((experience, index) => (
              <div key={experience.id} className="rounded-2xl border border-neutral-200 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-2">
                    <input
                      className="rounded border border-neutral-200 px-3 py-2 text-sm"
                      value={experience.role}
                      onChange={(event) => {
                        const experiences = [...resume.experiences];
                        experiences[index] = { ...experience, role: event.target.value };
                        updateResume({ experiences });
                      }}
                      placeholder="Cargo"
                    />
                    <input
                      className="rounded border border-neutral-200 px-3 py-2 text-sm"
                      value={experience.company}
                      onChange={(event) => {
                        const experiences = [...resume.experiences];
                        experiences[index] = { ...experience, company: event.target.value };
                        updateResume({ experiences });
                      }}
                      placeholder="Empresa"
                    />
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600"
                    onClick={() => {
                      const experiences = resume.experiences.filter((item) => item.id !== experience.id);
                      updateResume({ experiences });
                    }}
                  >
                    Remover
                  </button>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded border border-neutral-200 px-3 py-2 text-sm"
                    value={experience.startDate}
                    onChange={(event) => {
                      const experiences = [...resume.experiences];
                      experiences[index] = { ...experience, startDate: event.target.value };
                      updateResume({ experiences });
                    }}
                    placeholder="Data inicial"
                  />
                  <input
                    className="rounded border border-neutral-200 px-3 py-2 text-sm"
                    value={experience.endDate ?? ""}
                    onChange={(event) => {
                      const experiences = [...resume.experiences];
                      experiences[index] = { ...experience, endDate: event.target.value };
                      updateResume({ experiences });
                    }}
                    placeholder="Data final ou Atual"
                  />
                </div>
                <textarea
                  className="mt-4 h-24 w-full rounded border border-neutral-200 px-3 py-2 text-sm"
                  placeholder="Liste conquistas com números e impacto. Uma por linha."
                  value={experience.achievements.join("\n")}
                  onChange={(event) => {
                    const achievements = event.target.value.split("\n").filter(Boolean);
                    const experiences = [...resume.experiences];
                    experiences[index] = { ...experience, achievements };
                    updateResume({ experiences });
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              className="rounded-full border border-dashed border-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary)]"
              onClick={() => {
                updateResume({
                  experiences: [
                    ...resume.experiences,
                    { id: nanoid(), role: "", company: "", startDate: "", endDate: null, achievements: [] },
                  ],
                });
              }}
            >
              Adicionar experiência
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            {resume.education.map((education, index) => (
              <div key={education.id} className="rounded-2xl border border-neutral-200 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-2">
                    <input
                      className="rounded border border-neutral-200 px-3 py-2 text-sm"
                      value={education.institution}
                      onChange={(event) => {
                        const entries = [...resume.education];
                        entries[index] = { ...education, institution: event.target.value };
                        updateResume({ education: entries });
                      }}
                      placeholder="Instituição"
                    />
                    <input
                      className="rounded border border-neutral-200 px-3 py-2 text-sm"
                      value={education.course}
                      onChange={(event) => {
                        const entries = [...resume.education];
                        entries[index] = { ...education, course: event.target.value };
                        updateResume({ education: entries });
                      }}
                      placeholder="Curso"
                    />
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600"
                    onClick={() => {
                      const entries = resume.education.filter((item) => item.id !== education.id);
                      updateResume({ education: entries });
                    }}
                  >
                    Remover
                  </button>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded border border-neutral-200 px-3 py-2 text-sm"
                    value={education.startDate}
                    onChange={(event) => {
                      const entries = [...resume.education];
                      entries[index] = { ...education, startDate: event.target.value };
                      updateResume({ education: entries });
                    }}
                    placeholder="Início"
                  />
                  <input
                    className="rounded border border-neutral-200 px-3 py-2 text-sm"
                    value={education.endDate ?? ""}
                    onChange={(event) => {
                      const entries = [...resume.education];
                      entries[index] = { ...education, endDate: event.target.value };
                      updateResume({ education: entries });
                    }}
                    placeholder="Conclusão"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="rounded-full border border-dashed border-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary)]"
              onClick={() => {
                updateResume({
                  education: [
                    ...resume.education,
                    { id: nanoid(), institution: "", course: "", startDate: "", endDate: null },
                  ],
                });
              }}
            >
              Adicionar formação
            </button>
          </div>
        );
      case 3:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              Skills (separe por vírgula)
              <textarea
                className="h-28 rounded-lg border border-neutral-200 px-3 py-2"
                value={resume.skills.join(", ")}
                onChange={(event) => updateResume({ skills: event.target.value.split(",").map((skill) => skill.trim()).filter(Boolean) })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Certificações
              <textarea
                className="h-28 rounded-lg border border-neutral-200 px-3 py-2"
                value={resume.certifications.join("\n")}
                onChange={(event) => updateResume({
                  certifications: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean),
                })}
                placeholder="Ex.: PMP - PMI"
              />
            </label>
            <label className="md:col-span-2 flex flex-col gap-1 text-sm">
              Idiomas
              <textarea
                className="h-24 rounded-lg border border-neutral-200 px-3 py-2"
                value={resume.languages.join("\n")}
                onChange={(event) => updateResume({
                  languages: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean),
                })}
                placeholder="Inglês avançado, Espanhol intermediário"
              />
            </label>
          </div>
        );
      case 4:
        return (
          <div className="grid gap-4">
            <label className="flex flex-col gap-1 text-sm">
              Área ou vaga alvo
              <input
                className="rounded-lg border border-neutral-200 px-3 py-2"
                value={resume.focusRole ?? ""}
                onChange={(event) => updateResume({ focusRole: event.target.value })}
                placeholder="Ex.: Gerente de Projetos em SaaS"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Descrição da vaga (opcional)
              <textarea
                className="h-40 rounded-lg border border-neutral-200 px-3 py-2"
                value={resume.atsKeywords.join("\n")}
                onChange={(event) => updateResume({ atsKeywords: event.target.value.split("\n").filter(Boolean) })}
                placeholder="Cole trechos relevantes para priorizar palavras-chave"
              />
            </label>
            <AdSlot slot="4398761235" className="min-h-[90px]" />
          </div>
        );
      case 5:
      default:
        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900">Resumo das informações</h3>
              <dl className="mt-4 grid gap-2 text-sm text-neutral-700">
                <div className="grid gap-1 md:grid-cols-[160px,1fr]">
                  <dt className="font-medium">Nome</dt>
                  <dd>{resume.fullName || "—"}</dd>
                </div>
                <div className="grid gap-1 md:grid-cols-[160px,1fr]">
                  <dt className="font-medium">Objetivo</dt>
                  <dd>{resume.objective || "—"}</dd>
                </div>
                <div className="grid gap-1 md:grid-cols-[160px,1fr]">
                  <dt className="font-medium">Experiências</dt>
                  <dd>{resume.experiences.length} cadastradas</dd>
                </div>
                <div className="grid gap-1 md:grid-cols-[160px,1fr]">
                  <dt className="font-medium">Skills</dt>
                  <dd>{resume.skills.join(", ") || "—"}</dd>
                </div>
              </dl>
            </div>
            <p className="text-sm text-neutral-600">
              Ao continuar, a IA gerará resumo profissional, bullets com resultados, versão em inglês, recomendações de ATS e carta de apresentação opcional.
            </p>
          </div>
        );
    }
  }, [resume, step, updateResume]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[var(--primary)]">Passo {step + 1} de {steps.length}</span>
          <h1 className="text-2xl font-semibold text-neutral-900">Assistente de currículo</h1>
        </div>
        <span className="text-xs text-neutral-500">Salvamento automático ativado</span>
      </div>
      <div className="h-2 w-full rounded-full bg-neutral-200">
        <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${progress}%` }} />
      </div>
      <nav className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 md:grid-cols-6">
        {steps.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setStep(item.id)}
            className={`rounded-full border px-3 py-2 ${step === item.id ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-neutral-200 text-neutral-600"}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        {renderStep}
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <footer className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setStep((prev) => (prev > 0 ? ((prev - 1) as Step) : prev))}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700"
          disabled={step === 0}
        >
          Voltar
        </button>
        {step === steps.length - 1 ? (
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Gerando currículo..." : "Gerar currículo com IA"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep((prev) => ((prev + 1) as Step))}
            className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
          >
            Avançar
          </button>
        )}
      </footer>
    </div>
  );
}

export default ResumeWizard;
