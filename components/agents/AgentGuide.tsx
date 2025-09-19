"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Bot, CreditCard, HelpCircle, Plug, QrCode, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type AgentGuideVariant = "tour" | "script";

type Step = {
  title: string;
  description: string;
  icon?: LucideIcon;
  imageHint?: string;
};

const DEFAULT_VARIANT: AgentGuideVariant = "tour";

function getVariantFromValue(value: string | null | undefined): AgentGuideVariant | null {
  if (!value) return null;
  return value === "script" || value === "tour" ? value : null;
}

function getTourSteps(agentType?: string | null): Step[] {
  const steps: Step[] = [
    {
      title: "Criação e edição do agente",
      description:
        "Escolha nome, avatar e canais enquanto define o propósito do assistente para começar com o pé direito.",
      icon: Bot
    },
    {
      title: "CRM integrado",
      description:
        "Acompanhe conversas, salve notas e ajuste respostas em tempo real direto do painel de contatos.",
      icon: Users
    },
    {
      title: "Configuração de pagamento",
      description:
        "Confirme o plano e a forma de cobrança para liberar todos os recursos profissionais do agente.",
      icon: CreditCard
    }
  ];

  if (agentType === "sdr") {
    steps.push({
      title: "Integrações essenciais",
      description:
        "Conecte o agente SDR às integrações de calendário e CRM para automatizar agendas e distribuir leads com agilidade.",
      icon: Plug
    });
  }

  steps.push({
    title: "Ative com QR Code",
    description:
      "Gere o QR code do agente e compartilhe para que clientes comecem a interagir imediatamente.",
    icon: QrCode
  });

  return steps;
}

function getScriptSteps(): Step[] {
  return [
    {
      title: "Boas-vindas & Criação do agente",
      description:
        "Bem-vindo! Vamos começar escolhendo um nome e um avatar. Em poucos cliques você define como o agente fala e onde ele atende.",
      imageHint: "Sugestão: ilustração de um assistente virtual ganhando forma."
    },
    {
      title: "Personalize e acompanhe no CRM",
      description:
        "Veja contatos e conversas em um só lugar. Ajuste respostas, registre notas e acompanhe o histórico para melhorar cada interação.",
      imageHint: "Sugestão: painel com cartões de clientes."
    },
    {
      title: "Configure o pagamento",
      description:
        "Informe o método de cobrança, revise valores e datas. Assim você mantém o agente ativo sem surpresas.",
      imageHint: "Sugestão: cartão de crédito aprovado ou recibo simples."
    },
    {
      title: "Ative via QR Code",
      description:
        "Tudo pronto! Gere o QR code para compartilhar. Seus clientes apontam a câmera do celular e começam a conversar na hora.",
      imageHint: "Sugestão: celular escaneando um QR code."
    }
  ];
}

export default function AgentGuide() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string | undefined;
  const [introOpen, setIntroOpen] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [agentType, setAgentType] = useState<string | null>(null);

  useEffect(() => {
    supabasebrowser.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      const stored = uid ? localStorage.getItem(`agentIntroOpen_${uid}`) : null;
      setIntroOpen(stored !== null ? stored === "true" : true);
    });
  }, []);

  const handleIntroOpenChange = (open: boolean) => {
    setIntroOpen(open);
    if (userId) {
      localStorage.setItem(`agentIntroOpen_${userId}`, String(open));
    }
  };

  useEffect(() => {
    if (!id || id === "new") {
      setAgentType(null);
      return;
    }

    let isMounted = true;

    supabasebrowser
      .from("agents")
      .select("type")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          setAgentType(null);
          return;
        }
        setAgentType(data?.type ?? null);
      })
      .catch(() => {
        if (!isMounted) return;
        setAgentType(null);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const variantFromQuery = getVariantFromValue(searchParams?.get("agentGuideVersion"));
  const envVariant = getVariantFromValue(process.env.NEXT_PUBLIC_AGENT_GUIDE_VERSION);
  const variant: AgentGuideVariant = variantFromQuery ?? envVariant ?? DEFAULT_VARIANT;

  const steps = useMemo(
    () => (variant === "tour" ? getTourSteps(agentType) : getScriptSteps()),
    [variant, agentType]
  );

  useEffect(() => {
    if (introOpen) {
      setCurrentStep(0);
    }
  }, [introOpen, variant]);

  if (introOpen === null) return null;

  const totalSteps = steps.length;
  const activeStep = steps[currentStep] ?? steps[0];
  const isLastStep = currentStep >= totalSteps - 1;
  const progressValue = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const goToPrevious = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const goToNext = () => {
    if (isLastStep) {
      handleIntroOpenChange(false);
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  return (
    <>
      <Dialog.Root open={introOpen} onOpenChange={handleIntroOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-xl -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-2xl bg-white p-6 shadow-xl sm:w-full">
            <Dialog.Title className="text-xl font-semibold">
              {variant === "tour"
                ? "Conheça os próximos passos"
                : "Bem-vindo! Vamos dar o primeiro tour"}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              {variant === "tour"
                ? "Siga as etapas abaixo para colocar o seu agente em produção."
                : "Veja como usar a plataforma em minutos. Cada slide destaca o que você precisa saber."}
            </Dialog.Description>

            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <span>
                  Etapa {currentStep + 1} de {totalSteps}
                </span>
                <div className="flex-1">
                  <Progress value={progressValue} />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                {variant === "tour" ? (
                  <TourSlide step={activeStep} />
                ) : (
                  <ScriptSlide step={activeStep} />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() => handleIntroOpenChange(false)}
              >
                Pular tour
              </Button>
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <Button variant="outline" onClick={goToPrevious}>
                    Anterior
                  </Button>
                )}
                <Button onClick={goToNext}>
                  {isLastStep ? "Concluir" : "Próximo"}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {!introOpen && (
        <Button
          className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
          size="icon"
          onClick={() => handleIntroOpenChange(true)}
        >
          <HelpCircle className="size-8" />
        </Button>
      )}
    </>
  );
}

function TourSlide({ step }: { step: Step }) {
  const Icon = step.icon;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="mt-1 flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
            <Icon className="size-6 text-primary" />
          </span>
        )}
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">{step.title}</h2>
          <p className="text-sm text-slate-600">{step.description}</p>
        </div>
      </div>
    </div>
  );
}

function ScriptSlide({ step }: { step: Step }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">{step.title}</h2>
        <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
      </div>
      {step.imageHint ? (
        <p className="text-xs italic text-muted-foreground">{step.imageHint}</p>
      ) : null}
    </div>
  );
}

