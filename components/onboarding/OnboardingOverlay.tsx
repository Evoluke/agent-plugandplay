"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Bot, ClipboardList, CreditCard, MessageCircle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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

  const steps: Step[] = useMemo(() => [
    {
      title: "Criação e edição do Agente de IA",
      description: "Construa seu agente com linguagem simples e ajustes rápidos.",
      details: [
        "Escolha um objetivo e dê um nome ao agente.",
        "Defina como ele deve se comunicar com os seus clientes.",
        "Faça testes rápidos e edite sempre que precisar.",
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
        "Escolha o plano que combina com o seu volume de atendimento.",
        "Cadastre cartão ou emita boleto com segurança.",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <button
          type="button"
          onClick={handleSkip}
          className="absolute right-4 top-4 text-sm font-medium text-gray-400 hover:text-gray-600"
        >
          Pular
        </button>

        <div className="flex flex-col gap-6 p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2F6F68]/10 text-[#2F6F68]">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#2F6F68]">
                Passo {currentStep + 1} de {totalSteps}
              </p>
              <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
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

          <Progress value={progressValue} />

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              {currentStep < totalSteps - 1 && (
                <Button variant="outline" type="button" onClick={handleSkip}>
                  Entendi depois
                </Button>
              )}
              <Button type="button" onClick={handleNext}>
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
