"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import {
  Bot,
  ClipboardList,
  CreditCard,
  MessageCircle,
  Rocket,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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

  const steps: Step[] = useMemo(
    () => [
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
          "Escolha a sua melhor forma de pagamento.",
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
    ],
    []
  );

  const totalSteps = steps.length;
  const step = steps[currentStep];
  const Icon = step?.icon;
  const progressValue = ((currentStep + 1) / totalSteps) * 100;

  const handleClose = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    } catch (error) {
      console.error("Erro ao salvar onboarding", error);
    }
    setIsOpen(false);
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose, isOpen]);

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev === totalSteps - 1) {
        handleClose();
        return prev;
      }

      return Math.min(prev + 1, totalSteps - 1);
    });
  }, [handleClose, totalSteps]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSkip = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const handleSelectStep = useCallback((index: number) => {
    setCurrentStep(Math.min(Math.max(index, 0), totalSteps - 1));
  }, [totalSteps]);

  if (!isOpen || !step || !Icon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/70 px-3 py-6 sm:px-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-dialog-title"
        className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5"
      >
        <button
          type="button"
          onClick={handleSkip}
          className="absolute right-4 top-4 z-10 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 transition hover:text-gray-600"
        >
          Pular tour
        </button>

        <div className="grid flex-1 grid-cols-1 md:grid-cols-[1.15fr_1.35fr]">
          <aside className="hidden flex-col justify-between border-r border-[#2F6F68]/10 bg-gradient-to-b from-[#2F6F68]/10 via-white to-white px-8 py-10 md:flex">
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2F6F68]">
                Guia rápido
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Configure seu agente em poucos passos
              </h2>
              <p className="text-sm text-gray-600">
                Explore cada etapa no seu ritmo. Você pode pular, retomar ou revisar as orientações quando preferir.
              </p>
            </div>

            <ol className="space-y-3">
              {steps.map((item, index) => {
                const isActive = index === currentStep;

                return (
                  <li key={item.title}>
                    <button
                      type="button"
                      onClick={() => handleSelectStep(index)}
                      className={cn(
                        "flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left transition-all",
                        isActive
                          ? "border-[#2F6F68]/50 bg-white text-gray-900 shadow-sm"
                          : "border-transparent text-gray-500 hover:border-[#2F6F68]/30 hover:bg-white/70"
                      )}
                      aria-current={isActive ? "step" : undefined}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold",
                          isActive
                            ? "bg-[#2F6F68] text-white"
                            : "bg-white text-[#2F6F68] ring-1 ring-[#2F6F68]/30"
                        )}
                      >
                        {index + 1}
                      </span>
                      <span className="space-y-1">
                        <span className="block text-sm font-semibold text-gray-900">
                          {item.title}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>

          <main className="flex flex-col justify-between gap-6 p-6 md:p-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6F68]/10 text-[#2F6F68]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2F6F68]">
                      Passo {currentStep + 1} de {totalSteps}
                    </p>
                    <h1
                      id="onboarding-dialog-title"
                      className="text-2xl font-bold text-gray-900 sm:text-3xl"
                    >
                      {step.title}
                    </h1>
                    <p className="text-sm text-gray-600 sm:text-base">
                      {step.description}
                    </p>
                  </div>
                  <div className="ml-auto hidden text-right md:block">
                    <span className="text-xs font-medium uppercase tracking-[0.3em] text-gray-400">
                      {Math.round(progressValue)}% concluído
                    </span>
                  </div>
                </div>

                <div className="md:hidden">
                  <Progress value={progressValue} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-[#2F6F68]/20 bg-[#2F6F68]/5 p-4 text-sm text-[#2F6F68] sm:text-base">
                  <span className="font-medium">Por que este passo importa?</span>
                  <p className="mt-2 text-[#2F6F68]/80">
                    Cada ação aqui ajuda seu agente a representar a empresa com precisão e oferece uma experiência consistente para clientes em qualquer canal.
                  </p>
                </div>

                <ul className="space-y-3">
                  {step.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white/60 px-4 py-3 text-sm text-gray-700 shadow-xs sm:text-base"
                    >
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-[#2F6F68]" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="hidden md:block">
                <Progress value={progressValue} />
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 sm:order-2">
                  <Button type="button" onClick={handleNext}>
                    {currentStep === totalSteps - 1 ? "Começar agora" : "Próximo passo"}
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-3 sm:order-1 sm:justify-start">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                  >
                    Voltar
                  </Button>
                  <div className="flex items-center gap-2">
                    {steps.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectStep(index)}
                        className={cn(
                          "h-2.5 w-2.5 rounded-full transition",
                          index === currentStep
                            ? "bg-[#2F6F68]"
                            : "bg-gray-300 hover:bg-[#2F6F68]/60"
                        )}
                        aria-label={`Ir para o passo ${index + 1}`}
                        aria-current={index === currentStep ? "step" : undefined}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default OnboardingOverlay;
