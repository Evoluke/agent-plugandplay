"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UpdateAgentButtonProps {
  agentId: string;
}

const COOLDOWN_MS = 5 * 60 * 1000;

export default function UpdateAgentButton({ agentId }: UpdateAgentButtonProps) {
  const [isCooldown, setIsCooldown] = useState(false);
  const [remaining, setRemaining] = useState(0);

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
    try {
      // Futuras validações e ações serão adicionadas aqui
      toast.success("Agente atualizado com sucesso.");
      localStorage.setItem(`agent-update-${agentId}`, Date.now().toString());
      setIsCooldown(true);
      setRemaining(COOLDOWN_MS / 1000);
    } catch {
      toast.error("Erro ao atualizar agente.");
    }
  };

  return (
    <Button onClick={handleClick} disabled={isCooldown}>
      {isCooldown ? `Aguarde ${remaining}s` : "Atualizar Agente IA"}
    </Button>
  );
}

