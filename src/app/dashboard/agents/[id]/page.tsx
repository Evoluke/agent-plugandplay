"use client";

import Link from "next/link";
import { useEffect, useState, Fragment } from "react";
import { useParams, usePathname } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

export default function AgentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const pathname = usePathname();
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (!id) return;
    supabasebrowser
      .from("agents")
      .select("id,name,type,is_active")
      .eq("id", id)
      .single()
      .then(({ data }) => setAgent(data));
  }, [id]);

  if (!agent) return <div>Carregando...</div>;

  const menuItems = [
    { label: "Personalidade", icon: Smile, href: `/dashboard/agents/${id}` },
    {
      label: "Comportamento",
      icon: Settings,
      href: `/dashboard/agents/${id}/comportamento`,
    },
    { label: "Onboarding", icon: BookOpen, href: `/dashboard/agents/${id}/onboarding` },
    {
      label: "Base de conhecimento",
      icon: Database,
      href: `/dashboard/agents/${id}/base-conhecimento`,
    },
    {
      label: "Instruções Específicas",
      icon: ClipboardList,
      href: `/dashboard/agents/${id}/instrucoes-especificas`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Card className="w-4/5 p-6">
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
                {index < menuItems.length - 1 && (
                  <div className="h-8 border-l" />
                )}
              </Fragment>
            ))}
          </nav>
        </Card>
      </div>
      <div className="flex justify-center">
        <Card className="w-4/5 p-6">
          {/* Conteúdo do submenu */}
        </Card>
      </div>
    </div>
  );
}
