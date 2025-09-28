import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ResumeEditor from "@/components/resume/ResumeEditor";
import { getResumeById, getUserPlan } from "@/lib/resumeStorage.server";

type ResumePageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: ResumePageProps): Promise<Metadata> {
  const resume = await getResumeById(params.id);
  if (!resume) {
    return { title: "Currículo não encontrado" };
  }
  return {
    title: `Editor de currículo | ${resume.fullName}`,
    description: `Edite o currículo de ${resume.fullName} com IA, exporte em PDF ou DOCX e otimize para vagas específicas.`,
  };
}

export default async function ResumePage({ params }: ResumePageProps) {
  const resume = await getResumeById(params.id);
  if (!resume) {
    notFound();
  }
  const plan = await getUserPlan(resume.userId ?? null);
  const resumeWithPlan = { ...resume, premium: plan === "premium" };

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="mx-auto w-full max-w-6xl px-6">
        <header className="mb-8 flex flex-col gap-2">
          <span className="text-sm text-neutral-500">Currículo criado com IA</span>
          <h1 className="text-3xl font-semibold text-neutral-900">{resume.fullName}</h1>
        </header>
        <ResumeEditor initialResume={resumeWithPlan} plan={plan} />
      </div>
    </div>
  );
}
