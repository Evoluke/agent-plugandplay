"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { supabasebrowser } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface Props {
  agentId: string;
  onDeactivated: () => void;
}

export default function DeactivateAgentButton({ agentId, onDeactivated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeactivate = async () => {
    setLoading(true);
    const { error } = await supabasebrowser
      .from("agents")
      .update({ is_active: false })
      .eq("id", agentId);
    setLoading(false);
    if (error) {
      toast.error("Erro ao desativar agente.");
    } else {
      toast.success("Agente desativado.");
      setOpen(false);
      onDeactivated();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="destructive">Desativar Agente</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow">
          <Dialog.Title className="mb-4 text-lg font-semibold">
            Desativar Agente
          </Dialog.Title>
          <Dialog.Description className="mb-4 text-sm text-gray-600">
            Tem certeza que deseja desativar este agente?
          </Dialog.Description>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeactivate} disabled={loading}>
              {loading ? "Desativando..." : "Desativar"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

