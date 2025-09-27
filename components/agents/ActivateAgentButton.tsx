"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabasebrowser } from "@/lib/supabaseClient";
import { toast } from "sonner";

type AgentRecord = {
  company_id: string;
  type: string;
};

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
      .select("company_id,type")
      .eq("id", agentId)
      .single<AgentRecord>();

    if (agentError || !agent) {
      toast.error("Erro ao identificar a empresa do agente.");
      setLoading(false);
      return;
    }

    if (agent.type === "sdr") {
      const {
        data: googleTokens,
        error: googleTokensError,
      } = await supabasebrowser
        .from("agent_google_tokens")
        .select("agent_id")
        .eq("agent_id", agentId)
        .limit(1);

      if (googleTokensError) {
        toast.error("Erro ao verificar a conexão com o Google Calendar.");
        setLoading(false);
        return;
      }

      if (!googleTokens || googleTokens.length === 0) {
        toast.error("Conecte o Google Calendar para ativar o agente SDR.");
        setLoading(false);
        return;
      }
    }

    const {
      data: company,
      error: companyError,
    } = await supabasebrowser
      .from("company")
      .select("subscription_expires_at")
      .eq("id", agent.company_id)
      .single();

    if (companyError || !company) {
      toast.error("Não foi possível consultar a assinatura corporativa.");
      setLoading(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!company.subscription_expires_at) {
      toast.error(
        "Não foi possível validar o vencimento da assinatura corporativa."
      );
      setLoading(false);
      return;
    }

    const dueDate = new Date(company.subscription_expires_at);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      toast.error("Cobrança corporativa vencida. Renove a assinatura para continuar.");
      setLoading(false);
      return;
    }

    const { error: deactivateError } = await supabasebrowser
      .from("agents")
      .update({ is_active: false })
      .eq("company_id", agent.company_id)
      .neq("id", agentId);

    if (deactivateError) {
      toast.error("Erro ao desativar outros agentes da empresa.");
      setLoading(false);
      return;
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

