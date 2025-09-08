"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import AgentMenu from "@/components/agents/AgentMenu";
import AgentGuide from "@/components/agents/AgentGuide";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DeactivateAgentButton from "@/components/agents/DeactivateAgentButton";
import ActivateAgentButton from "@/components/agents/ActivateAgentButton";

type Agent = {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
};

export default function AgentIntegrationsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabasebrowser
      .from("agents")
      .select("id,name,type,is_active")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setAgent(data);
      });

    supabasebrowser
      .from("agent_google_tokens")
      .select("agent_id")
      .eq("agent_id", id)
      .single()
      .then(({ data }) => {
        setConnected(!!data);
      });
  }, [id]);

  if (!agent) return <div>Carregando...</div>;

  const handleConnect = () => {
    if (id) {
      window.location.href = `/api/google-calendar/auth?agent_id=${id}`;
    }
  };

  const handleDisconnect = async () => {
    if (!id) return;
    await fetch(`/api/google-calendar/disconnect?agent_id=${id}`, {
      method: "DELETE",
    });
    setConnected(false);
  };

  return (
    <div className="space-y-6">
      <AgentMenu agent={agent} />
      <AgentGuide />
      <div className="flex justify-center">
        <Card className="w-full md:w-[90%] p-6 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Google Calendar</h2>
            <p className="text-sm text-muted-foreground">
              {connected
                ? "Google Calendar conectado."
                : "Conecte seu calendário para sincronizar eventos."}
            </p>
          </div>
          {connected ? (
            <Button variant="destructive" onClick={handleDisconnect}>
              Desconectar
            </Button>
          ) : (
            <Button onClick={handleConnect}>Conectar</Button>
          )}
        </Card>
      </div>
      <div className="flex justify-center">
        <div className="w-full md:w-[90%] flex justify-end gap-2">
          {agent.is_active ? (
            <DeactivateAgentButton
              agentId={id}
              onDeactivated={() =>
                setAgent((a) => (a ? { ...a, is_active: false } : a))
              }
            />
          ) : (
            <ActivateAgentButton
              agentId={id}
              onActivated={() =>
                setAgent((a) => (a ? { ...a, is_active: true } : a))
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

