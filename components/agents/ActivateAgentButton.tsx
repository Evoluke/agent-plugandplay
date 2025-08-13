"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { supabasebrowser } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface Props {
  agentId: string;
  onActivated: () => void;
}

export default function ActivateAgentButton({ agentId, onActivated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    setLoading(true);

    const { data: pending } = await supabasebrowser
      .from("payments")
      .select("id")
      .eq("agent_id", agentId)
      .eq("status", "pendente")
      .lt("due_date", new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (pending) {
      toast.error(
        "Você possui pagamentos em atraso. Regularize-os para ativar o agente."
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
      setOpen(false);
      onActivated();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline">Ativar Agente</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow">
          <Dialog.Title className="mb-4 text-lg font-semibold">
            Ativar Agente
          </Dialog.Title>
          <Dialog.Description className="mb-4 text-sm text-gray-600">
            Tem certeza que deseja ativar este agente?
          </Dialog.Description>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleActivate} disabled={loading}>
              {loading ? "Ativando..." : "Ativar"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

