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
    const { data: payment, error: paymentError } = await supabasebrowser
      .from("payments")
      .select("due_date")
      .eq("agent_id", agentId)
      .eq("status", "pendente")
      .order("due_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (paymentError) {
      toast.error("Erro ao verificar pagamentos.");
      setLoading(false);
      return;
    }

    if (!payment) {
      toast.error(
        "Primeiramente é necessário atualizar o agente de IA."
      );
      setLoading(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(payment.due_date);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      toast.error(
        "Pagamento pendente vencido. Não é possível ativar o agente."
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

