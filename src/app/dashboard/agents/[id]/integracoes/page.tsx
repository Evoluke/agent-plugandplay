"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import AgentMenu from "@/components/agents/AgentMenu";
import AgentGuide from "@/components/agents/AgentGuide";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DeactivateAgentButton from "@/components/agents/DeactivateAgentButton";
import ActivateAgentButton from "@/components/agents/ActivateAgentButton";
import { toast } from "sonner";

type Agent = {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
};

export default function AgentIntegrationsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [connected, setConnected] = useState(false);
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");

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
      .select("schedule_start, schedule_end")
      .eq("agent_id", id)
      .single()
      .then(({ data }) => {
        setConnected(!!data);
        setScheduleStart(data?.schedule_start ?? "");
        setScheduleEnd(data?.schedule_end ?? "");
      });
  }, [id]);

  useEffect(() => {
    if (agent && agent.type !== "sdr") {
      router.replace(`/dashboard/agents/${id}`);
    }
  }, [agent, id, router]);

  if (!agent) return <div>Carregando...</div>;
  if (agent.type !== "sdr") return null;

  const handleConnect = () => {
    if (!id) return;
    window.location.href = `/api/google-calendar/auth?agent_id=${id}`;
  };

  const handleDisconnect = async () => {
    if (!id) return;
    await fetch(`/api/google-calendar/disconnect?agent_id=${id}`, {
      method: "DELETE",
    });
    setConnected(false);
    setScheduleStart("");
    setScheduleEnd("");
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const { error } = await supabasebrowser
      .from("agent_google_tokens")
      .update({
        schedule_start: scheduleStart,
        schedule_end: scheduleEnd,
      })
      .eq("agent_id", id);
    if (error) {
      toast.error("Erro ao salvar horários.");
    } else {
      toast.success("Horários salvos com sucesso.");
    }
  };

  return (
    <div className="space-y-6">
      <AgentMenu agent={agent} />
      <AgentGuide />
      <div className="flex justify-center">
        <Card className="w-full md:w-[90%] p-6 space-y-4 text-left">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Google Calendar</h2>
            <p className="text-sm text-muted-foreground">
              {connected
                ? "Google Calendar conectado."
                : "Conecte seu calendário para sincronizar eventos."}
            </p>
          </div>
          {connected ? (
            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="scheduleStart" className="text-sm font-medium">
                    Início da janela
                  </label>
                  <Input
                    id="scheduleStart"
                    type="time"
                    value={scheduleStart}
                    onChange={(e) => setScheduleStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="scheduleEnd" className="text-sm font-medium">
                    Fim da janela
                  </label>
                  <Input
                    id="scheduleEnd"
                    type="time"
                    value={scheduleEnd}
                    onChange={(e) => setScheduleEnd(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Salvar horários</Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDisconnect}
                >
                  Desconectar
                </Button>
              </div>
            </form>
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

