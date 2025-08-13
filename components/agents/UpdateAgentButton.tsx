"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabasebrowser } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface UpdateAgentButtonProps {
  agentId: string;
}

const COOLDOWN_MS = 5 * 60 * 1000;

export default function UpdateAgentButton({ agentId }: UpdateAgentButtonProps) {
  const [isCooldown, setIsCooldown] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const last = localStorage.getItem(`agent-update-${agentId}`);
    if (!last) return;
    const diff = Date.now() - Number(last);
    if (diff < COOLDOWN_MS) {
      setIsCooldown(true);
      setRemaining(Math.ceil((COOLDOWN_MS - diff) / 1000));
    }
  }, [agentId]);

  useEffect(() => {
    if (!isCooldown) return;
    const interval = setInterval(() => {
      const last = localStorage.getItem(`agent-update-${agentId}`);
      if (!last) {
        setIsCooldown(false);
        setRemaining(0);
        clearInterval(interval);
        return;
      }
      const diff = Date.now() - Number(last);
      if (diff >= COOLDOWN_MS) {
        setIsCooldown(false);
        setRemaining(0);
        clearInterval(interval);
      } else {
        setRemaining(Math.ceil((COOLDOWN_MS - diff) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isCooldown, agentId]);

  const handleClick = async () => {
    if (isCooldown || processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);
    try {
      const { data: { session }, error } = await supabasebrowser.auth.getSession();
      if (error || !session) throw new Error("Sessão não encontrada");

      const res = await fetch("/api/agents/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ agentId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      toast.success("Agente atualizado com sucesso.");
      localStorage.setItem(`agent-update-${agentId}`, Date.now().toString());
      setIsCooldown(true);
      setRemaining(COOLDOWN_MS / 1000);
      if (data.paymentId) {
        router.push(`/dashboard/payments/${data.paymentId}`);
      }
    } catch {
      toast.error("Erro ao atualizar agente.");
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={isCooldown || isProcessing}>
      {isCooldown
        ? `Aguarde ${remaining}s`
        : isProcessing
          ? "Atualizando..."
          : "Atualizar Agente IA"}
    </Button>
  );
}

