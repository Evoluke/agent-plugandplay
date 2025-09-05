"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AgentMenu from "@/components/agents/AgentMenu";
import AgentGuide from "@/components/agents/AgentGuide";
import DeactivateAgentButton from "@/components/agents/DeactivateAgentButton";
import ActivateAgentButton from "@/components/agents/ActivateAgentButton";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
}

export default function AgentIntegrationsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [calendarId, setCalendarId] = useState("");
  const [validated, setValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("google");

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
      .from("agent_google_calendar")
      .select("api_key, calendar_id, is_valid")
      .eq("agent_id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setApiKey(data.api_key);
          setCalendarId(data.calendar_id);
          setValidated(data.is_valid);
        }
      });
  }, [id]);

  if (!agent) return <div>Carregando...</div>;
  if (agent.type !== "sdr")
    return <div>Integrações disponíveis apenas para agentes SDR.</div>;

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const res = await fetch("/api/integrations/google-calendar/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, calendarId }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setValidated(true);
        toast.success("Credenciais válidas.");
      } else {
        setValidated(false);
        toast.error("Credenciais inválidas.");
      }
    } catch {
      setValidated(false);
      toast.error("Erro ao validar credenciais.");
    }
    setIsValidating(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validated) return;
    setIsSaving(true);
    const { error } = await supabasebrowser
      .from("agent_google_calendar")
      .upsert(
        {
          agent_id: id,
          api_key: apiKey,
          calendar_id: calendarId,
          is_valid: true,
        },
        { onConflict: "agent_id" }
      );
    if (error) {
      toast.error("Erro ao salvar credenciais.");
    } else {
      toast.success("Credenciais salvas com sucesso.");
    }
    setIsSaving(false);
  };

  const tabs = [{ id: "google", label: "Google Calendar" }];

  return (
    <div className="space-y-6">
      <AgentMenu agent={agent} />
      <AgentGuide />
      <div className="flex justify-center">
        <Card className="w-full md:w-4/5 p-6">
          <div className="mb-4 flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-sm ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {activeTab === "google" && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="apiKey" className="text-sm font-medium">
                  API Key
                </label>
                <Input
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setValidated(false);
                  }}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="calendarId" className="text-sm font-medium">
                  Calendar ID
                </label>
                <Input
                  id="calendarId"
                  value={calendarId}
                  onChange={(e) => {
                    setCalendarId(e.target.value);
                    setValidated(false);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleValidate}
                  disabled={!apiKey || !calendarId || isValidating}
                >
                  {isValidating ? "Validando..." : "Validar"}
                </Button>
                <Button type="submit" disabled={!validated || isSaving}>
                  Salvar
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
      <div className="flex justify-center">
        <div className="w-full md:w-4/5 flex justify-end gap-2">
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
