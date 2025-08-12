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
} from "lucide-react";

type Agent = {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
};

export default function AgentMenu({ agent }: { agent: Agent }) {
  const pathname = usePathname();
  const [lastPayment, setLastPayment] = useState<string | null>(null);

  useEffect(() => {
    supabasebrowser
      .from("payments")
      .select("due_date")
      .eq("agent_id", agent.id)
      .order("due_date", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        setLastPayment(data?.due_date ?? null);
      });
  }, [agent.id]);

  const menuItems = [
    { label: "Personalidade", icon: Smile, href: `/dashboard/agents/${agent.id}` },
    { label: "Comportamento", icon: Settings, href: `/dashboard/agents/${agent.id}/comportamento` },
    { label: "Onboarding", icon: BookOpen, href: `/dashboard/agents/${agent.id}/onboarding` },
    { label: "Base de conhecimento", icon: Database, href: `/dashboard/agents/${agent.id}/base-conhecimento` },
    { label: "Instruções Específicas", icon: ClipboardList, href: `/dashboard/agents/${agent.id}/instrucoes-especificas` },
  ];

  return (
    <div className="flex justify-center">
      <div className="w-4/5 flex gap-4">
        <Card className="w-64 p-4 flex flex-col items-center justify-center gap-3 text-sm text-center">
          <div>
            <p className="text-xs text-gray-500">Status do agente</p>
            <p className={`text-base font-semibold ${agent.is_active ? "text-green-600" : "text-red-600"}`}>
              {agent.is_active ? "Ativo" : "Inativo"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Vencimento último pagamento</p>
            <p>
              {lastPayment ? new Date(lastPayment).toLocaleDateString("pt-BR") : "Não existe"}
            </p>
          </div>
        </Card>
        <Card className="flex-1 p-6">
          <nav className="flex items-center justify-around">
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
                {index < menuItems.length - 1 && <div className="h-8 border-l" />}
              </Fragment>
            ))}
          </nav>
        </Card>
      </div>
    </div>
  );
}

