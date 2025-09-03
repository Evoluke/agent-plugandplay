"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { updateAgentInstructions } from "@/lib/updateAgentInstructions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import AgentMenu from "@/components/agents/AgentMenu";
import AgentGuide from "@/components/agents/AgentGuide";
import DeactivateAgentButton from "@/components/agents/DeactivateAgentButton";
import ActivateAgentButton from "@/components/agents/ActivateAgentButton";

type Agent = {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
};

export default function AgentBehaviorPage() {
  const params = useParams();
  const id = params?.id as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [limitations, setLimitations] = useState("");
  const [fallback, setFallback] = useState("");
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
      .from("agent_behavior")
      .select("limitations, default_fallback")
      .eq("agent_id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setLimitations(data.limitations);
          setFallback(data.default_fallback);
        }
      });
  }, [id]);

  if (!agent) return <div>Carregando...</div>;
  const limitationsValid = limitations.trim().length <= 500;
  const fallbackValid = fallback.trim().length >= 10 && fallback.trim().length <= 200;
  const isFormValid = limitationsValid && fallbackValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);

    const { error } = await supabasebrowser
      .from("agent_behavior")
      .upsert(
        {
          agent_id: id,
          limitations,
          default_fallback: fallback,
        },
        { onConflict: "agent_id" }
      );

    if (error) {
      toast.error("Erro ao salvar comportamento.");
    } else {
      await updateAgentInstructions(id);
      toast.success("Comportamento salvo com sucesso.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <AgentMenu agent={agent} />
      <AgentGuide />
      <div className="flex justify-center">
        <Card className="w-full md:w-4/5 p-6">
          <p className="text-xs italic text-gray-500 mb-4">
            Configure como o agente deve se comportar durante as interações.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="limitations" className="text-sm font-medium">
                Limitações
              </label>
              <Textarea
                id="limitations"
                value={limitations}
                onChange={(e) => setLimitations(e.target.value)}
                className="resize-y max-h-50 overflow-auto"
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <p>O que deve escalar para humano.</p>
                <p className="text-gray-400">0 a 500 caracteres</p>
              </div>
              {limitations && !limitationsValid && (
                <p className="text-xs text-red-500">
                  As limitações devem ter no máximo 500 caracteres
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="fallback" className="text-sm font-medium">
                Saída de segurança
              </label>
              <Input
                id="fallback"
                value={fallback}
                onChange={(e) => setFallback(e.target.value)}
                minLength={10}
                maxLength={200}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <p>
                  Resposta quando não sabe algo (“Não encontrei. Posso encaminhar?”).
                </p>
                <p className="text-gray-400">10 a 200 caracteres</p>
              </div>
              {fallback && !fallbackValid && (
                <p className="text-xs text-red-500">
                  A saída de segurança deve ter entre 10 e 200 caracteres
                </p>
              )}
            </div>

            <Button type="submit" disabled={!isFormValid || isSubmitting}>
              Salvar
            </Button>
          </form>
        </Card>
      </div>
      <div className="flex justify-center">
        <div className="w-full md:w-4/5 flex justify-end gap-2">
          {agent.is_active ? (
            <DeactivateAgentButton
              agentId={id}
              onDeactivated={() =>
                setAgent((a) => (a ? { ...a, is_active: false } : a))
              }
            />
          ) : (
            <ActivateAgentButton
              agentId={id}
              onActivated={() =>
                setAgent((a) => (a ? { ...a, is_active: true } : a))
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

