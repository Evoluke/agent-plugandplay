"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { HelpCircle, CheckCircle2, CircleDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FirstAccessGuideProps = {
  userId: string;
  companyName?: string | null;
  profileComplete?: boolean | null;
};

type Step = {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  done?: boolean;
};

export default function FirstAccessGuide({
  userId,
  companyName,
  profileComplete,
}: FirstAccessGuideProps) {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const storageKey = `dashboardGuideOpen_${userId}`;
    const stored = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
    setOpen(stored !== null ? stored === "true" : true);
  }, [userId]);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(`dashboardGuideOpen_${userId}`, String(value));
    }
  };

  const steps = useMemo<Step[]>(() => {
    const companyStepLink = profileComplete ? "/dashboard/config" : "/complete-profile";
    return [
      {
        title: "Valide os dados da sua empresa",
        description:
          "Confira se as informações fiscais e de contato estão completas. Isso garante o acesso aos recursos de integrações e atendimento.",
        href: companyStepLink,
        actionLabel: profileComplete ? "Revisar cadastro" : "Completar cadastro",
        done: Boolean(profileComplete),
      },
      {
        title: "Crie seu primeiro agente de IA",
        description:
          "Defina nome e tipo do agente para começar. Depois você poderá ajustar personalidade, comportamento e canais.",
        href: "/dashboard/agents/new",
        actionLabel: "Criar agente",
      },
      {
        title: "Personalize o agente",
        description:
          "Ajuste comportamento, base de conhecimento e mensagens de boas-vindas para entregar a experiência ideal aos seus clientes.",
        href: "/dashboard/agents",
        actionLabel: "Configurar agentes",
      },
      {
        title: "Acompanhe as conversas",
        description:
          "Monitore atendimentos no CRM e identifique oportunidades de melhoria com dados em tempo real.",
        href: "/crm",
        actionLabel: "Abrir CRM",
      },
    ];
  }, [profileComplete]);

  if (open === null) {
    return null;
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 space-y-5 rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Bem-vindo{companyName ? `, ${companyName}` : ""}! Vamos começar?
            </Dialog.Title>
            <p className="text-sm text-gray-600">
              Estes são os passos recomendados para aproveitar todo o potencial da plataforma. Conclua cada etapa no seu ritmo — você pode reabrir este guia quando quiser.
            </p>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    {step.done ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                    ) : (
                      <CircleDashed className="mt-0.5 h-5 w-5 text-[#2F6F68]" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={cn("text-base font-semibold", step.done && "text-emerald-600")}>
                          {index + 1}. {step.title}
                        </h3>
                        <Button asChild size="sm" variant={step.done ? "outline" : "default"}>
                          <Link href={step.href}>{step.actionLabel}</Link>
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => handleOpenChange(false)}>
                Entendi, vamos lá
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {!open && (
        <Button
          className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg"
          size="icon"
          onClick={() => handleOpenChange(true)}
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      )}
    </>
  );
}
