import type { Metadata } from "next";
import ResumeWizard from "@/components/resume/ResumeWizard";

export const metadata: Metadata = {
  title: "Gerar currículo com IA | Currículo IA Pro",
  description:
    "Complete o assistente multi-etapas, salve automaticamente no Supabase e gere um currículo otimizado com inteligência artificial.",
};

export default function GerarCurriculoPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6">
        <ResumeWizard />
      </div>
    </div>
  );
}
