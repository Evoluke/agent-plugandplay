"use client";

import { useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import sanitizeHtml from "sanitize-html";
import { AdSlot } from "@/components/adsense/AdSlot";
import { allTemplates, defaultSectionOrder, type ResumePayload, type ResumePlan, isPremiumPlan } from "@/lib/resume";
import { upsertResume } from "@/lib/resumeStorage.client";

type ResumeEditorProps = {
  initialResume: ResumePayload;
  plan: ResumePlan;
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function ResumeEditor({ initialResume, plan }: ResumeEditorProps) {
  const [resume, setResume] = useState<ResumePayload>(initialResume);
  const [sectionOrder, setSectionOrder] = useState(defaultSectionOrder);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const premium = isPremiumPlan(plan);

  const handleSectionReorder = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = [...sectionOrder];
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setSectionOrder(reordered);
  };

  const updateResume = async (update: Partial<ResumePayload>) => {
    const nextResume = { ...resume, ...update };
    setResume(nextResume);
    await upsertResume(nextResume);
  };

  const handleTemplateChange = async (templateId: string) => {
    if (!premium && !["minimal", "elegant"].includes(templateId)) {
      return;
    }
    await updateResume({ template: templateId });
  };

  const callAction = async (action: string, payload: Record<string, unknown> = {}, identifier?: string) => {
    setLoadingAction(identifier ?? action);
    try {
      const response = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, action, payload }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message ?? "Erro ao executar ação");
      }
      const data = await response.json();
      if (data?.resume) {
        setResume(data.resume as ResumePayload);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAction(null);
    }
  };

  const exportResume = async (format: "pdf" | "docx") => {
    setLoadingAction(`export-${format}`);
    try {
      const response = await fetch(`/api/resume/export?resumeId=${resume.id}&format=${format}`);
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.message ?? "Erro ao exportar");
      }
      const blob = await response.blob();
      downloadBlob(blob, `curriculo-${resume.fullName || "profissional"}.${format}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAction(null);
    }
  };

  const orderedSections = useMemo(() => sectionOrder.filter((section) => {
    if (section === "englishVersion") {
      return premium && (resume.englishVersion?.trim() ?? "") !== "";
    }
    if (section === "coverLetter") {
      return (resume.coverLetter?.trim() ?? "") !== "";
    }
    if (section === "certifications") {
      return resume.certifications.length > 0;
    }
    if (section === "languages") {
      return resume.languages.length > 0;
    }
    if (section === "skills") {
      return resume.skills.length > 0;
    }
    return true;
  }), [sectionOrder, resume, premium]);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900">Editor de conteúdo</h2>
          <div className="mt-4 space-y-4">
            <label className="flex flex-col gap-1 text-sm">
              Título de destaque
              <input
                className="rounded-lg border border-neutral-200 px-3 py-2"
                value={resume.headline ?? ""}
                onChange={(event) => updateResume({ headline: event.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Resumo profissional
              <textarea
                className="h-28 rounded-lg border border-neutral-200 px-3 py-2"
                value={resume.summary ?? ""}
                onChange={(event) => updateResume({ summary: event.target.value })}
              />
            </label>
            <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
              Palavras-chave ATS: {resume.atsKeywords.join(", ") || "Nenhuma"}
            </div>
            <button
              type="button"
              className="rounded-full border border-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary)]"
              disabled={!premium || loadingAction === "optimize-job"}
              onClick={() => callAction("optimize-job")}
            >
              Otimizar para vaga
            </button>
            <button
              type="button"
              className="rounded-full border border-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary)]"
              disabled={!premium || loadingAction === "translate"}
              onClick={() => callAction("translate")}
            >
              Gerar versão em inglês
            </button>
            <button
              type="button"
              className="rounded-full border border-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary)]"
              disabled={!premium || loadingAction === "cover-letter"}
              onClick={() => callAction("cover-letter")}
            >
              Criar carta de apresentação
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900">Ordenar seções</h3>
          <DragDropContext onDragEnd={handleSectionReorder}>
            <Droppable droppableId="sections">
              {(provided) => (
                <ul ref={provided.innerRef} {...provided.droppableProps} className="mt-4 space-y-3">
                  {orderedSections.map((sectionKey, index) => (
                    <Draggable key={sectionKey} draggableId={sectionKey} index={index}>
                      {(draggableProvided) => (
                        <li
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          {...draggableProvided.dragHandleProps}
                          className="flex items-center justify-between rounded-2xl border border-dashed border-neutral-300 px-4 py-3 text-sm font-medium"
                        >
                          {sectionKey}
                          <span className="text-xs text-neutral-400">arraste para ordenar</span>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900">Template visual</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {allTemplates.map((template) => {
              const disabled = !premium && !["minimal", "elegant"].includes(template.id);
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateChange(template.id)}
                  disabled={disabled}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    resume.template === template.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-neutral-200 text-neutral-700 hover:border-[var(--primary)]"
                  } ${disabled ? "opacity-60" : ""}`}
                >
                  {template.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900">Pré-visualização</h3>
          <div className="mt-4 space-y-4 text-sm text-neutral-700">
            {orderedSections.map((section) => {
              switch (section) {
                case "summary":
                  return (
                    <div key={section}>
                      <h4 className="text-base font-semibold text-neutral-900">Resumo</h4>
                      <p>{resume.summary || "Adicione um resumo profissional"}</p>
                    </div>
                  );
                case "experiences":
                  return (
                    <div key={section}>
                      <h4 className="text-base font-semibold text-neutral-900">Experiências</h4>
                      <ul className="mt-2 space-y-3">
                        {resume.experiences.map((experience, experienceIndex) => (
                          <li key={experience.id} className="rounded-xl bg-neutral-50 p-3">
                            <div className="font-medium text-neutral-900">{experience.role || "Cargo"}</div>
                            <div className="text-xs text-neutral-500">{experience.company}</div>
                            <ul className="mt-2 space-y-2">
                              {experience.achievements.map((achievement, bulletIndex) => (
                                <li key={`${experience.id}-${bulletIndex}`} className="flex items-start gap-2">
                                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--primary)]" />
                                  <span>{achievement}</span>
                                  <button
                                    type="button"
                                    className="ml-auto rounded-full border border-[var(--primary)] px-3 py-1 text-[10px] font-medium text-[var(--primary)]"
                                    disabled={!premium || loadingAction === `rewrite-${experience.id}-${bulletIndex}`}
                                    onClick={() =>
                                      callAction(
                                        "rewrite-bullet",
                                        {
                                          experienceIndex,
                                          bulletIndex,
                                        },
                                        `rewrite-${experience.id}-${bulletIndex}`,
                                      )
                                    }
                                  >
                                    Reescrever
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                case "education":
                  return (
                    <div key={section}>
                      <h4 className="text-base font-semibold text-neutral-900">Formação</h4>
                      <ul className="mt-2 space-y-2">
                        {resume.education.map((education) => (
                          <li key={education.id} className="rounded-xl bg-neutral-50 p-3">
                            <div className="font-medium">{education.course}</div>
                            <div className="text-xs text-neutral-500">{education.institution}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                case "skills":
                  return (
                    <div key={section}>
                      <h4 className="text-base font-semibold text-neutral-900">Skills</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {resume.skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-neutral-100 px-3 py-1 text-xs">{skill}</span>
                        ))}
                      </div>
                    </div>
                  );
                case "certifications":
                  return (
                    <div key={section}>
                      <h4 className="text-base font-semibold text-neutral-900">Certificações</h4>
                      <ul className="mt-2 space-y-1">
                        {resume.certifications.map((certification) => (
                          <li key={certification}>{certification}</li>
                        ))}
                      </ul>
                    </div>
                  );
                case "languages":
                  return (
                    <div key={section}>
                      <h4 className="text-base font-semibold text-neutral-900">Idiomas</h4>
                      <ul className="mt-2 space-y-1">
                        {resume.languages.map((language) => (
                          <li key={language}>{language}</li>
                        ))}
                      </ul>
                    </div>
                  );
                case "englishVersion":
                  return (
                    <div key={section}>
                      <h4 className="text-base font-semibold text-neutral-900">Resumo em inglês</h4>
                      <p>{resume.englishVersion}</p>
                    </div>
                  );
                case "coverLetter":
                  return (
                    <div key={section}>
                      <h4 className="text-base font-semibold text-neutral-900">Carta de apresentação</h4>
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHtml(resume.coverLetter ?? "", {
                            allowedTags: sanitizeHtml.defaults.allowedTags.concat(["p", "br", "strong", "em", "ul", "li"]),
                          }),
                        }}
                      />
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900">Exportar currículo</h3>
          <div className="mt-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => exportResume("pdf")}
              disabled={loadingAction === "export-pdf"}
              className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
            >
              Baixar PDF
            </button>
            <button
              type="button"
              onClick={() => exportResume("docx")}
              disabled={!premium || loadingAction === "export-docx"}
              className="rounded-full border border-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary)]"
            >
              Baixar DOCX (Premium)
            </button>
          </div>
          <p className="mt-4 text-xs text-neutral-500">
            A versão premium remove a marca d&apos;água, adiciona múltiplos layouts e exportações ilimitadas.
          </p>
        </div>

        <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-600">
          <h3 className="text-base font-semibold text-neutral-900">Comparativo de planos</h3>
          <ul className="mt-3 space-y-2">
            <li>✅ Free: GPT-4o mini, 1 export PDF/dia, 1 revisão.</li>
            <li>✅ Premium: GPT-4.1, exportações ilimitadas, 4 layouts extras.</li>
            <li>✅ Recursos exclusivos: carta de apresentação, tradução, reescrita de bullets.</li>
          </ul>
          <a
            href="/assinatura-premium"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
          >
            Assinar por R$ 29/mês
          </a>
        </div>

        <AdSlot slot="4398761236" className="min-h-[120px]" />
      </aside>
    </div>
  );
}

export default ResumeEditor;
