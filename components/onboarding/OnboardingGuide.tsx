"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BarChart3, Settings2, Sparkles } from "lucide-react";

const STORAGE_KEY = "agent-plugandplay:onboarding";

type Step = {
  title: string;
  description: string;
  actionLabel?: string;
  href?: string;
  icon: ReactNode;
};

const steps: Step[] = [
  {
    title: "Crie seu primeiro agente",
    description:
      "Defina o objetivo, tom de voz e fluxos do agente que vai atender seus leads.",
    actionLabel: "Configurar agente",
    href: "/dashboard/agents/new",
    icon: <Sparkles className="h-6 w-6 text-[#2F6F68]" aria-hidden="true" />,
  },
  {
    title: "Personalize sua operação",
    description:
      "Revise os dados da empresa, credenciais e integrações para deixar tudo pronto.",
    actionLabel: "Abrir configurações",
    href: "/dashboard/config",
    icon: <Settings2 className="h-6 w-6 text-[#2F6F68]" aria-hidden="true" />,
  },
  {
    title: "Acompanhe os resultados",
    description:
      "Use o painel para monitorar mensagens diárias e priorizar os próximos passos.",
    actionLabel: "Ver painel",
    href: "/dashboard",
    icon: <BarChart3 className="h-6 w-6 text-[#2F6F68]" aria-hidden="true" />,
  },
];

export default function OnboardingGuide() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSeen = window.localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const currentStep = steps[stepIndex];

  const closeGuide = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
    }
    setIsOpen(false);
  }, []);

  const handleSkip = useCallback(() => {
    closeGuide();
  }, [closeGuide]);

  const handleNext = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    } else {
      closeGuide();
    }
  }, [closeGuide, stepIndex]);

  const handleAction = useCallback(() => {
    const step = steps[stepIndex];
    if (!step?.href) return;
    router.push(step.href);
  }, [router, stepIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5F1F0]">
            {currentStep.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#2F6F68]">Bem-vindo(a)!</p>
            <h2 className="text-lg font-bold text-gray-900">Vamos configurar sua experiência</h2>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h3 className="text-xl font-semibold text-gray-900">{currentStep.title}</h3>
          <p className="text-sm text-gray-600">{currentStep.description}</p>
        </div>

        <div className="mt-6 flex items-center gap-2">
          {steps.map((step, index) => (
            <span
              key={step.title}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= stepIndex ? "bg-[#2F6F68]" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={handleSkip} className="justify-center text-gray-600">
            Pular tour
          </Button>
          <div className="flex flex-col gap-3 sm:flex-row">
            {currentStep.href && (
              <Button variant="outline" onClick={handleAction} className="justify-center">
                {currentStep.actionLabel}
              </Button>
            )}
            <Button onClick={handleNext} className="justify-center">
              {stepIndex < steps.length - 1 ? "Próximo" : "Concluir"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
