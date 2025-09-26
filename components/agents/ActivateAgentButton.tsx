"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabasebrowser } from "@/lib/supabaseClient";
import { toast } from "sonner";

type PaymentStatus = "pendente" | "pago" | "estorno";

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
      .select("company_id")
      .eq("id", agentId)
      .single();

    if (agentError || !agent) {
      toast.error("Erro ao identificar a empresa do agente.");
      setLoading(false);
      return;
    }

    const {
      data: payment,
      error: paymentError,
    } = await supabasebrowser
      .from("payments")
      .select("due_date,status")
      .eq("company_id", agent.company_id)
      .order("due_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (paymentError) {
      toast.error("Erro ao consultar pagamentos da empresa.");
      setLoading(false);
      return;
    }

    if (!payment) {
      toast.error(
        "Nenhum pagamento corporativo encontrado. Regularize a assinatura da empresa para ativar seus agentes."
      );
      setLoading(false);
      return;
    }

    const status = payment.status as PaymentStatus | null;

    if (status !== "pago") {
      toast.error(
        "A empresa possui uma cobrança pendente ou estornada. Conclua o pagamento corporativo para ativar o agente."
      );
      setLoading(false);
      return;
    }

    if (!payment.due_date) {
      toast.error(
        "Não foi possível validar o vencimento da cobrança corporativa."
      );
      setLoading(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(payment.due_date);
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

