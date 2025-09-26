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

type PaymentRecord = {
  due_date: string | null;
  status: PaymentStatus | null;
};

const typeLabels: Record<string, string> = {
  sdr: "SDR",
  "pre-qualificacao": "Pré-qualificação",
  suporte: "Suporte",
};

export default function AgentMenu({ agent }: { agent: Agent }) {
  const pathname = usePathname();
  const [corporateExpiration, setCorporateExpiration] =
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
          setCorporateExpiration(null);
          setSubscriptionStatus(null);
        }
        return;
      }

      const {
        data: payments,
        error: paymentError,
      } = await supabasebrowser
        .from("payments")
        .select("due_date,status")
        .eq("company_id", agentRecord.company_id)
        .order("due_date", { ascending: false })
        .limit(10);

      const {
        data: companyRecord,
        error: companyError,
      } = await supabasebrowser
        .from("company")
        .select("subscription_expires_at")
        .eq("id", agentRecord.company_id)
        .single();

      if (!active) return;

      if (paymentError) {
        setCorporateExpiration(
          companyRecord?.subscription_expires_at ?? null
        );
        setSubscriptionStatus(null);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const paymentList = (payments ?? []) as PaymentRecord[];

      const activePayment = paymentList.find((item) => {
        if (item.status !== "pago" || !item.due_date) return false;
        const dueDate = new Date(item.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today;
      });

      const pendingPayment = paymentList.find((item) => {
        if (item.status !== "pendente") return false;
        if (!item.due_date) return true;
        const dueDate = new Date(item.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today;
      });

      const refundedPayment = paymentList.find((item) => item.status === "estorno");

      const expiresAt =
        companyRecord?.subscription_expires_at ?? activePayment?.due_date ?? null;

      if (companyError) {
        setCorporateExpiration(activePayment?.due_date ?? null);
      } else {
        setCorporateExpiration(expiresAt);
      }

      const derivedStatus: PaymentStatus | null = activePayment
        ? "pago"
        : pendingPayment
        ? "pendente"
        : refundedPayment
        ? "estorno"
        : null;

      setSubscriptionStatus(derivedStatus);
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
  const dueDateObject = corporateExpiration
    ? new Date(corporateExpiration)
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
                {corporateExpiration && (
                  <span className="text-xs text-gray-500">
                    Vencimento: {new Date(corporateExpiration).toLocaleDateString("pt-BR")}
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
