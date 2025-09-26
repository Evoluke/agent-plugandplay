"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabasebrowser } from "@/lib/supabaseClient";
import {
  Smile,
  Settings,
  BookOpen,
  Database,
  ClipboardList,
  Calendar,
} from "lucide-react";

type Agent = {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
};

type PaymentStatus = "pendente" | "pago" | "estorno";

const typeLabels: Record<string, string> = {
  sdr: "SDR",
  "pre-qualificacao": "Pré-qualificação",
  suporte: "Suporte",
};

export default function AgentMenu({ agent }: { agent: Agent }) {
  const pathname = usePathname();
  const [subscriptionDueDate, setSubscriptionDueDate] =
    useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    PaymentStatus | null
  >(null);

  useEffect(() => {
    let active = true;

    async function loadSubscription() {
      const {
        data: agentRecord,
        error: agentError,
      } = await supabasebrowser
        .from("agents")
        .select("company_id")
        .eq("id", agent.id)
        .single();

      if (agentError || !agentRecord) {
        if (active) {
          setSubscriptionDueDate(null);
          setSubscriptionStatus(null);
        }
        return;
      }

      const {
        data: payment,
        error: paymentError,
      } = await supabasebrowser
        .from("payments")
        .select("due_date,status")
        .eq("company_id", agentRecord.company_id)
        .order("due_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) return;

      if (paymentError) {
        setSubscriptionDueDate(null);
        setSubscriptionStatus(null);
        return;
      }

      setSubscriptionDueDate(payment?.due_date ?? null);
      setSubscriptionStatus(
        (payment?.status as PaymentStatus | undefined) ?? null
      );
    }

    loadSubscription();

    return () => {
      active = false;
    };
  }, [agent.id]);

  const menuItems = [
    { label: "Personalidade", icon: Smile, href: `/dashboard/agents/${agent.id}` },
    { label: "Comportamento", icon: Settings, href: `/dashboard/agents/${agent.id}/comportamento` },
    { label: "Onboarding", icon: BookOpen, href: `/dashboard/agents/${agent.id}/onboarding` },
    { label: "Base de conhecimento", icon: Database, href: `/dashboard/agents/${agent.id}/base-conhecimento` },
    { label: "Instruções", icon: ClipboardList, href: `/dashboard/agents/${agent.id}/instrucoes` },
    ...(agent.type === "sdr"
      ? [
          {
            label: "Integrações",
            icon: Calendar,
            href: `/dashboard/agents/${agent.id}/integracoes`,
          },
        ]
      : []),
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDateObject = subscriptionDueDate
    ? new Date(subscriptionDueDate)
    : null;
  if (dueDateObject) {
    dueDateObject.setHours(0, 0, 0, 0);
  }
  const isExpired = Boolean(dueDateObject && dueDateObject < today);

  const statusLabel = subscriptionStatus
    ? subscriptionStatus === "pago"
      ? isExpired
        ? "Expirada"
        : "Ativa"
      : subscriptionStatus === "pendente"
      ? "Pendente"
      : "Estornada"
    : null;

  const statusColor = subscriptionStatus
    ? subscriptionStatus === "pago" && !isExpired
      ? "text-green-600"
      : subscriptionStatus === "pendente"
      ? "text-amber-600"
      : "text-red-600"
    : "";

  return (
    <div className="flex justify-center">
      <div className="w-full md:w-[90%] flex flex-col md:flex-row gap-4">
        <Card className="w-full md:w-52 p-4 flex flex-col items-center justify-center gap-3 text-sm text-center">
          <div>
            <p className="text-xs text-gray-500">Status do agente</p>
            <p
              className={`text-base font-semibold ${agent.is_active ? "text-green-600" : "text-red-600"}`}
            >
              {agent.is_active ? "Ativo" : "Inativo"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Tipo do agente</p>
            <p className="text-base font-semibold">
              {typeLabels[agent.type] || agent.type}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Assinatura corporativa</p>
            {statusLabel ? (
              <div className="flex flex-col items-center md:items-start">
                <p className={`text-base font-semibold ${statusColor}`}>
                  {statusLabel}
                </p>
                {subscriptionDueDate && (
                  <span className="text-xs text-gray-500">
                    Vencimento: {new Date(subscriptionDueDate).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-base font-semibold">Não encontrada</p>
            )}
          </div>
        </Card>
        <Card className="w-full md:flex-1 p-4 md:p-6 flex">
          <nav className="flex h-full w-full flex-wrap items-center justify-center gap-2 md:flex-nowrap md:justify-around md:gap-0">
            {menuItems.map(({ label, icon: Icon, href }, index) => (
              <Fragment key={label}>
                <Button
                  asChild
                  variant={pathname === href ? "secondary" : "ghost"}
                  className="flex h-auto flex-col items-center gap-1 text-sm"
                >
                  <Link href={href} className="flex flex-col items-center">
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                </Button>
                {index < menuItems.length - 1 && <div className="hidden md:block h-8 border-l" />}
              </Fragment>
            ))}
          </nav>
        </Card>
      </div>
    </div>
  );
}
