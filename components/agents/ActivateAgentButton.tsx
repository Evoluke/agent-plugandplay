"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabasebrowser } from "@/lib/supabaseClient";
import { toast } from "sonner";

type PaymentStatus = "pendente" | "pago" | "estorno";

type PaymentRecord = {
  due_date: string | null;
  status: PaymentStatus | null;
};

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
        .select("id")
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
      data: payments,
      error: paymentsError,
    } = await supabasebrowser
      .from("payments")
      .select("due_date,status")
      .eq("company_id", agent.company_id)
      .order("due_date", { ascending: false })
      .limit(10);

    const {
      data: company,
      error: companyError,
    } = await supabasebrowser
      .from("company")
      .select("subscription_expires_at")
      .eq("id", agent.company_id)
      .single();

    if (paymentsError) {
      toast.error("Erro ao consultar pagamentos da empresa.");
      setLoading(false);
      return;
    }

    if (companyError || !company) {
      toast.error("Não foi possível consultar a assinatura corporativa.");
      setLoading(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activePayment = ((payments ?? []) as PaymentRecord[]).find((item) => {
      if (item.status !== "pago") return false;
      if (!item.due_date) return false;
      const dueDate = new Date(item.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today;
    });

    if (!activePayment) {
      toast.error(
        "Nenhum pagamento corporativo pago com vencimento vigente foi encontrado. Regularize a assinatura da empresa para ativar seus agentes."
      );
      setLoading(false);
      return;
    }

    const expirationSource =
      company.subscription_expires_at ?? activePayment.due_date ?? null;

    if (!expirationSource) {
      toast.error(
        "Não foi possível validar o vencimento da assinatura corporativa."
      );
      setLoading(false);
      return;
    }

    const dueDate = new Date(expirationSource);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      toast.error("Cobrança corporativa vencida. Renove a assinatura para continuar.");
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

