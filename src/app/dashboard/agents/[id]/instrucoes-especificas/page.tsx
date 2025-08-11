"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Smile,
  Settings,
  BookOpen,
  Database,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
}

export default function AgentSpecificInstructionsPage() {
  const params = useParams();
  const id = params?.id as string;
  const pathname = usePathname();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabasebrowser
      .from("agents")
      .select("id,name,type,is_active")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setAgent(data);
      });

    supabasebrowser
      .from("agent_specific_instructions")
      .select("instructions")
      .eq("agent_id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setInstructions(data.instructions);
        }
      });
  }, [id]);

  if (!agent) return <div>Carregando...</div>;

  const instructionsValid =
    instructions.trim().length > 0 && instructions.trim().length <= 1000;
  const isFormValid = instructionsValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);

    const { error } = await supabasebrowser
      .from("agent_specific_instructions")
      .upsert({ agent_id: id, instructions }, { onConflict: "agent_id" });

    if (error) {
      toast.error("Erro ao salvar instruções específicas.");
    } else {
      toast.success("Instruções específicas salvas com sucesso.");
    }
    setIsSubmitting(false);
  };

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
                {index < menuItems.length - 1 && <div className="h-8 border-l" />}
              </Fragment>
            ))}
          </nav>
        </Card>
      </div>
      <div className="flex justify-center">
        <Card className="w-4/5 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="instructions" className="text-sm font-medium">
                Instruções específicas
              </label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="resize-y max-h-50 overflow-auto"
                maxLength={1000}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <p>Orientações adicionais para o agente.</p>
                <p className="text-gray-400">1 a 1000 caracteres</p>
              </div>
              {!instructions && (
                <p className="text-xs text-red-500">
                  As instruções são obrigatórias
                </p>
              )}
              {instructions && !instructionsValid && (
                <p className="text-xs text-red-500">
                  As instruções devem ter no máximo 1000 caracteres
                </p>
              )}
            </div>
            <Button type="submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

