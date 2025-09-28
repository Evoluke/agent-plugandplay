"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Bot,
  ClipboardList,
  CreditCard,
  MessageCircle,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/components/ui/utils";

type Step = {
  title: string;
  description: string;
  details: string[];
  icon: ComponentType<{ className?: string }>;
};

const ONBOARDING_STORAGE_KEY = "plugandplay.dashboard.onboarding.completed";

export function OnboardingOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    try {
      const hasCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!hasCompleted) {
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Erro ao verificar onboarding", error);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const steps: Step[] = useMemo(() => [
    {
      title: "Criação e edição do Agente de IA",
      description: "Construa seu agente com linguagem simples e ajustes rápidos.",
      details: [
        "Escolha um objetivo e dê um nome ao agente.",
        "Defina como ele deve se comunicar com os seus clientes.",
        "Inclua informações da empresa na Base de conhecimento.",
      ],
      icon: Bot,
    },
    {
      title: "Acesso ao CRM",
      description: "Centralize os contatos e acompanhe conversas em um único lugar.",
      details: [
        "Veja quem o agente está atendendo em tempo real.",
        "Registre informações importantes sem planilhas.",
        "Organize oportunidades e acompanhe o andamento.",
      ],
      icon: ClipboardList,
    },
    {
      title: "Integração com WhatsApp",
      description: "Conecte o canal que seus clientes já utilizam.",
      details: [
        "Sincronize a conta oficial da sua empresa.",
        "Receba e responda mensagens diretamente pelo agente.",
        "Mantenha o histórico em segurança.",
      ],
      icon: MessageCircle,
    },
    {
      title: "Pagamento",
      description: "Ative recursos avançados com a forma de pagamento preferida.",
      details: [
        "Escolha a sua melhor foma de pagamento.",
        "Faça o pagamento em segurança com nosso fornecedor Asaas.",
        "Receba notas e comprovantes automaticamente.",
      ],
      icon: CreditCard,
    },
    {
      title: "Ativação do agente",
      description: "Tudo pronto para colocar o agente em ação.",
      details: [
        "Revise as configurações e confirme a publicação.",
        "Acompanhe o desempenho e melhore continuamente.",
        "Conte com nosso suporte sempre que precisar.",
      ],
      icon: Rocket,
    },
  ], []);

  if (!isOpen) return null;

  const totalSteps = steps.length;
  const step = steps[currentStep];
  const Icon = step.icon;
  const progressValue = ((currentStep + 1) / totalSteps) * 100;

  const handleClose = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    } catch (error) {
      console.error("Erro ao salvar onboarding", error);
    }
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep === totalSteps - 1) {
      handleClose();
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={handleSkip}
          className="absolute right-4 top-4 hidden text-sm font-medium text-gray-400 transition-colors hover:text-gray-600 md:inline-flex"
        >
          Pular
        </button>

        <div className="flex flex-col md:grid md:grid-cols-[260px,1fr]">
          <aside className="hidden flex-col justify-between bg-[#2F6F68] p-8 text-white md:flex">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                Jornada do agente
              </h3>
              <p className="mt-3 text-base/relaxed text-white/80">
                Acompanhe os passos essenciais para preparar o agente e liberar todos os recursos da plataforma.
              </p>
            </div>

            <ul className="mt-10 space-y-3 text-sm">
              {steps.map((item, index) => (
                <li
                  key={item.title}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border p-3 transition-colors",
                    index === currentStep
                      ? "border-white bg-white"
                      : "border-white/15 bg-white/5 text-white/80"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      index === currentStep
                        ? "bg-[#2F6F68]/10 text-[#2F6F68]"
                        : "bg-white/10 text-white"
                    )}
                  >
                    {index + 1}
                  </span>
                  <div className="space-y-1">
                    <p
                      className={cn(
                        "font-semibold",
                        index === currentStep ? "text-[#2F6F68]" : "text-white"
                      )}
                    >
                      {item.title}
                    </p>
                    <p
                      className={cn(
                        "text-xs",
                        index === currentStep ? "text-[#2F6F68]/80" : "text-white/70"
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex h-full flex-col gap-6 p-6 sm:p-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between md:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2F6F68]/10 text-[#2F6F68]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#2F6F68]">
                      Passo {currentStep + 1} de {totalSteps}
                    </p>
                    <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{step.title}</h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSkip}
                  className="inline-flex text-sm font-medium text-gray-400 transition-colors hover:text-gray-600 md:hidden"
                >
                  Pular
                </button>
              </div>

              <div className="md:hidden">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {steps.map((item, index) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => setCurrentStep(index)}
                      className={cn(
                        "flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium",
                        index === currentStep
                          ? "border-[#2F6F68] bg-[#2F6F68]/10 text-[#2F6F68]"
                          : "border-gray-200 text-gray-500"
                      )}
                      aria-current={index === currentStep}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#2F6F68] shadow">
                        {index + 1}
                      </span>
                      <span className="max-w-[10rem] truncate text-left">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-base text-gray-600">{step.description}</p>

            <ul className="space-y-2 text-sm text-gray-700">
              {step.details.map((detail) => (
                <li key={detail} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#2F6F68]" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <Progress value={progressValue} />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Concluído</span>
                <span>{Math.round(progressValue)}%</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="ghost"
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="sm:w-auto"
              >
                Voltar
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto"
              >
                {currentStep === totalSteps - 1 ? "Começar agora" : "Próximo"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingOverlay;
