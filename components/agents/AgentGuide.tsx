"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { supabasebrowser } from "@/lib/supabaseClient";
import { HelpCircle } from "lucide-react";

type GuideVariant = "detailed" | "journey";

type Step = {
  title: string;
  description: string;
  ctaLabel?: string;
  href?: string;
  tip?: string;
  imageHint?: string;
};

const normalizeVariant = (value: string | null | undefined): GuideVariant => {
  if (!value) return "detailed";
  const normalized = value.toLowerCase();
  if (["journey", "onboarding", "user", "leigo", "b"].includes(normalized)) {
    return "journey";
  }
  return "detailed";
};

export default function AgentGuide() {
  const params = useParams();
  const id = params?.id as string;
  const searchParams = useSearchParams();
  const [introOpen, setIntroOpen] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const variant = useMemo<GuideVariant>(() => {
    const fromSearch = searchParams?.get("guideVariant");
    const fromEnv = process.env.NEXT_PUBLIC_AGENT_GUIDE_VARIANT;
    return normalizeVariant(fromSearch ?? fromEnv);
  }, [searchParams]);

  const storageKey = useMemo(() => {
    if (!userId) return null;
    return `agentIntroOpen_${userId}_${variant}`;
  }, [userId, variant]);

  const steps: Step[] = useMemo(() => {
    if (variant === "journey") {
      return [
        {
          title: "Boas-vindas & criação do agente",
          description:
            "Vamos começar escolhendo um nome, um avatar e dizendo ao agente como ele deve ajudar os seus clientes.",
          tip: "Dica: pense em um tom de voz que combine com a sua marca.",
          imageHint: "Sugestão: ilustração de um assistente ganhando vida.",
        },
        {
          title: "Tudo no mesmo CRM",
          description:
            "Acompanhe contatos, conversas e notas em um só lugar. Ajuste respostas e veja o histórico de cada cliente.",
          imageHint: "Sugestão: painel com cartões de clientes.",
        },
        {
          title: "Configure o pagamento",
          description:
            "Informe o método de cobrança para liberar os recursos do agente. Você verá plano, valores e data antes de confirmar.",
          imageHint: "Sugestão: cartão de crédito aprovado.",
        },
        {
          title: "Ative com o QR Code",
          description:
            "Gere o QR code e compartilhe com seus clientes. Basta apontar a câmera do celular para começar a conversar.",
          imageHint: "Sugestão: celular escaneando um QR code.",
          ctaLabel: "Gerar QR code",
          href: `/dashboard/agents/${id}/integracoes`,
        },
      ];
    }

    return [
      {
        title: "Personalidade do agente",
        description:
          "Defina o tom de voz, o objetivo e os limites de atuação para alinhar a experiência ao seu negócio.",
        ctaLabel: "Definir personalidade",
        href: `/dashboard/agents/${id}`,
        tip: "Essas informações direcionam todas as interações futuras.",
      },
      {
        title: "Comportamento",
        description:
          "Ajuste limitações, defina respostas de segurança e garanta que o agente saiba quando escalar para o time humano.",
        ctaLabel: "Configurar comportamento",
        href: `/dashboard/agents/${id}/comportamento`,
      },
      {
        title: "Onboarding",
        description:
          "Customize a saudação inicial e as perguntas que coletam dados importantes dos clientes.",
        ctaLabel: "Personalizar onboarding",
        href: `/dashboard/agents/${id}/onboarding`,
      },
      {
        title: "Base de conhecimento",
        description:
          "Adicione documentos e materiais de referência que o agente usará para responder com precisão.",
        ctaLabel: "Adicionar arquivos",
        href: `/dashboard/agents/${id}/base-conhecimento`,
      },
      {
        title: "Instruções avançadas",
        description:
          "Inclua orientações detalhadas e casos especiais para personalizar ainda mais o comportamento.",
        ctaLabel: "Escrever instruções",
        href: `/dashboard/agents/${id}/instrucoes`,
      },
    ];
  }, [variant, id]);

  useEffect(() => {
    supabasebrowser.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setIntroOpen(true);
        return;
      }

      const variantKey = `agentIntroOpen_${uid}_${variant}`;
      const legacyKey = `agentIntroOpen_${uid}`;
      const stored =
        localStorage.getItem(variantKey) ?? localStorage.getItem(legacyKey);

      if (stored !== null && localStorage.getItem(variantKey) === null) {
        localStorage.setItem(variantKey, stored);
      }

      setIntroOpen(stored !== null ? stored === "true" : true);
    });
  }, [variant]);

  useEffect(() => {
    setCurrentStep(0);
  }, [variant, introOpen]);

  const handleIntroOpenChange = (open: boolean) => {
    setIntroOpen(open);
    if (storageKey) {
      localStorage.setItem(storageKey, String(open));
    }
  };

  const handleNext = () => {
    if (currentStep >= steps.length - 1) {
      handleIntroOpenChange(false);
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const isLastStep = currentStep === steps.length - 1;

  const progress = ((currentStep + 1) / steps.length) * 100;

  const dialogTitle =
    variant === "journey"
      ? "Conheça o seu agente"
      : "Configuração do agente";

  if (introOpen === null) return null;

  return (
    <>
      <Dialog.Root open={introOpen} onOpenChange={handleIntroOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 space-y-6 rounded-md bg-white p-6 shadow">
            <div className="space-y-3">
              <Dialog.Title className="text-lg font-semibold">
                {dialogTitle}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                Etapa {currentStep + 1} de {steps.length}
              </Dialog.Description>
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {steps[currentStep].description}
              </p>
              {steps[currentStep].tip && (
                <p className="text-xs text-muted-foreground">
                  {steps[currentStep].tip}
                </p>
              )}
              {steps[currentStep].imageHint && (
                <p className="text-xs italic text-muted-foreground">
                  {steps[currentStep].imageHint}
                </p>
              )}
              {steps[currentStep].href && steps[currentStep].ctaLabel && (
                <Button asChild className="mt-2 w-fit">
                  <Link href={steps[currentStep].href}>
                    {steps[currentStep].ctaLabel}
                  </Link>
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {steps.map((step, index) => (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setCurrentStep(index)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === currentStep
                        ? "bg-primary"
                        : "bg-muted-foreground/40"
                    }`}
                    aria-label={`Ir para etapa ${index + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  Anterior
                </Button>
                <Button onClick={handleNext}>
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

