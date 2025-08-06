"use client";

import Link from "next/link";
import { useEffect, useState, Fragment } from "react";
import { useParams, usePathname } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  isValidAgentName,
  isValidAgentObjective,
  isValidAgentLimit,
} from "@/lib/validators";
import { toast } from "sonner";
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
  tone_of_voice: string | null;
  objective: string | null;
  limits: string | null;
};

export default function AgentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const pathname = usePathname();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [name, setName] = useState("");
  const [tone, setTone] = useState("");
  const [objective, setObjective] = useState("");
  const [limits, setLimits] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabasebrowser
      .from("agents")
      .select(
        "id,name,type,is_active,tone_of_voice,objective,limits"
      )
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setAgent(data);
        if (data) {
          setName(data.name);
          setTone(data.tone_of_voice || "");
          setObjective(data.objective || "");
          setLimits(data.limits || "");
        }
      });
  }, [id]);

  if (!agent) return <div>Carregando...</div>;

  const isFormValid =
    isValidAgentName(name) &&
    isValidAgentObjective(objective) &&
    isValidAgentLimit(limits) &&
    tone !== "";

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
          <form
            className="space-y-6"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!isFormValid || isSubmitting) return;
              setIsSubmitting(true);
              const { error } = await supabasebrowser
                .from("agents")
                .update({
                  name,
                  tone_of_voice: tone,
                  objective,
                  limits,
                })
                .eq("id", id);
              if (error) {
                toast.error("Erro ao salvar configurações.");
              } else {
                toast.success("Configurações salvas com sucesso.");
              }
              setIsSubmitting(false);
            }}
          >
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nome interno
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {name && !isValidAgentName(name) && (
                <p className="text-xs text-red-500">
                  O nome deve ter entre 3 e 80 caracteres
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tom de voz</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="objective" className="text-sm font-medium">
                Objetivo
              </label>
              <Textarea
                id="objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />
              {objective && !isValidAgentObjective(objective) && (
                <p className="text-xs text-red-500">
                  O objetivo deve ter entre 10 e 200 caracteres
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="limits" className="text-sm font-medium">
                Limites
              </label>
              <Textarea
                id="limits"
                value={limits}
                onChange={(e) => setLimits(e.target.value)}
              />
              {limits && !isValidAgentLimit(limits) && (
                <p className="text-xs text-red-500">
                  Os limites devem ter entre 10 e 200 caracteres
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={!isFormValid || isSubmitting}>
                Salvar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
