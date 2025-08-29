"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabasebrowser } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface Props {
  agentId: string;
  onActivated: () => void;
}

export default function ActivateAgentButton({ agentId, onActivated }: Props) {
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    setLoading(true);
    const { data: agent, error: agentError } = await supabasebrowser
      .from("agents")
      .select("expiration_date")
      .eq("id", agentId)
      .single();

    if (agentError) {
      toast.error("Erro ao verificar expiração.");
      setLoading(false);
      return;
    }

    if (!agent || !agent.expiration_date) {
      toast.error(
        "Primeiramente é necessário atualizar o agente de IA."
      );
      setLoading(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiration = new Date(agent.expiration_date);
    expiration.setHours(0, 0, 0, 0);

    if (expiration < today) {
      toast.error(
        "Data de expiração vencida. Não é possível ativar o agente."
      );
      setLoading(false);
      return;
    }

    const { error } = await supabasebrowser
      .from("agents")
      .update({ is_active: true })
      .eq("id", agentId);
    setLoading(false);
    if (error) {
      toast.error("Erro ao ativar agente.");
    } else {
      toast.success("Agente ativado.");
      onActivated();
    }
  };

  return (
    <Button variant="outline" onClick={handleActivate} disabled={loading}>
      {loading ? "Ativando..." : "Ativar Agente"}
    </Button>
  );
}

