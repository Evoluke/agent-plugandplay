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
    if (loading) return;
    setLoading(true);
    const {
      data: agent,
      error: agentError,
    } = await supabasebrowser
      .from("agents")
      .select("type, company:company(expiration_date)")
      .eq("id", agentId)
      .single<{
        type: string;
        company: { expiration_date: string | null } | null;
      }>();

    if (agentError) {
      toast.error("Erro ao verificar expiração.");
      setLoading(false);
      return;
    }

    const expirationDate = agent?.company?.expiration_date ?? null;

    if (!agent || !expirationDate) {
      toast.error(
        "Nenhum pagamento encontrado. Realize o pagamento para ativar seu Agente."
      );
      setLoading(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiration = new Date(expirationDate);
    expiration.setHours(0, 0, 0, 0);

    if (expiration < today) {
      toast.error(
        "Data de expiração vencida. Não é possível ativar o agente."
      );
      setLoading(false);
      return;
    }

    if (agent.type === "sdr") {
      const { data: calendarToken, error: calendarError } =
        await supabasebrowser
          .from("agent_google_tokens")
          .select("agent_id")
          .eq("agent_id", agentId)
          .maybeSingle();

      if (calendarError) {
        toast.error("Erro ao verificar o Google Calendar.");
        setLoading(false);
        return;
      }

      if (!calendarToken) {
        toast.error(
          "Conecte o Google Calendar nas integrações antes de ativar o agente SDR."
        );
        setLoading(false);
        return;
      }
    }

    const { error } = await supabasebrowser
      .from("agents")
      .update({ is_active: true })
      .eq("id", agentId);
    if (error) {
      toast.error("Erro ao ativar agente.");
      setLoading(false);
    } else {
      toast.success("Agente ativado.");
      onActivated();
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleActivate} disabled={loading}>
      {loading ? "Ativando..." : "Ativar Agente"}
    </Button>
  );
}

