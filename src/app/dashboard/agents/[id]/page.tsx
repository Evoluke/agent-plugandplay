"use client";

import { useEffect, useState, Fragment } from "react";
import { useParams } from "next/navigation";
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
    { label: "Personalidade", icon: Smile },
    { label: "Comportamento", icon: Settings },
    { label: "Onboarding", icon: BookOpen },
    { label: "Base de conhecimento", icon: Database },
    { label: "Instruções Específicas", icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{agent.name}</h1>
        <p className="text-sm text-gray-600">Função: {agent.type}</p>
        <p className="text-sm">Status: {agent.is_active ? "Ativo" : "Inativo"}</p>
      </div>

      <div className="flex justify-center">
        <Card className="w-4/5 p-6">
          <nav className="flex items-center justify-around">
            {menuItems.map(({ label, icon: Icon }, index) => (
              <Fragment key={label}>
                <Button
                  variant="ghost"
                  className="flex h-auto flex-col items-center gap-1 text-sm"
                >
                  <Icon className="h-5 w-5 text-gray-700" />
                  <span>{label}</span>
                </Button>
                {index < menuItems.length - 1 && (
                  <div className="h-8 border-l" />
                )}
              </Fragment>
            ))}
          </nav>
        </Card>
      </div>
    </div>
  );
}