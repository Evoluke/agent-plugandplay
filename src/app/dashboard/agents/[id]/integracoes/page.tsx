"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import AgentMenu from "@/components/agents/AgentMenu";
import AgentGuide from "@/components/agents/AgentGuide";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidEmail } from "@/lib/validators";
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
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

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
      .select("agent_id,email")
      .eq("agent_id", id)
      .single()
      .then(({ data }) => {
        setConnected(!!data);
        if (data?.email) {
          setEmail(data.email);
        } else {
          supabasebrowser.auth.getUser().then(({ data }) => {
            setEmail(data?.user?.email || "");
          });
        }
      });
  }, [id]);

  if (!agent) return <div>Carregando...</div>;

  const handleConnect = () => {
    if (!id) return;
    if (!isValidEmail(email)) {
      setEmailError("E-mail inválido");
      return;
    }
    window.location.href = `/api/google-calendar/auth?agent_id=${id}&email=${encodeURIComponent(email)}`;
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
        <Card className="w-full md:w-[90%] p-6 space-y-4 text-left">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Google Calendar</h2>
            <p className="text-sm text-muted-foreground">
              {connected
                ? "Google Calendar conectado."
                : "Conecte seu calendário para sincronizar eventos."}
            </p>
          </div>
          {!connected && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onBlur={() =>
                  setEmailError(
                    isValidEmail(email) ? "" : "E-mail inválido"
                  )
                }
                required
              />
              {emailError && (
                <p className="text-sm text-destructive mt-1">{emailError}</p>
              )}
            </div>
          )}
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

