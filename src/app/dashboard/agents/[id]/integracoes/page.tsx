"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import AgentMenu from "@/components/agents/AgentMenu";

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
  const [activeTab, setActiveTab] = useState("google-calendar");
  const [clientEmail, setClientEmail] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      .select("client_email, private_key, is_valid")
      .eq("agent_id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setClientEmail(data.client_email);
          setPrivateKey(data.private_key);
          setIsValid(data.is_valid);
        }
      });
  }, [id]);

  if (!agent) return <div>Carregando...</div>;
  if (agent.type !== "sdr")
    return <div>Integrações disponíveis apenas para agentes SDR.</div>;

  const validateCredentials = async () => {
    setIsValidating(true);
    try {
      const res = await fetch("/api/google-calendar/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientEmail, privateKey }),
      });
      const data = await res.json();
      if (data.valid) {
        setIsValid(true);
        toast.success("Credenciais válidas.");
      } else {
        setIsValid(false);
        toast.error(data.error || "Credenciais inválidas.");
      }
    } catch {
      setIsValid(false);
      toast.error("Erro na validação.");
    }
    setIsValidating(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSaving(true);
    const { error } = await supabasebrowser
      .from("agent_google_calendar")
      .upsert(
        {
          agent_id: id,
          client_email: clientEmail,
          private_key: privateKey,
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

  return (
    <div className="space-y-6">
      <AgentMenu agent={agent} />
      <div className="flex justify-center">
        <Card className="w-full md:w-4/5 p-6">
          <div className="mb-4 border-b">
            <nav className="flex gap-4">
              <button
                className={`pb-2 text-sm font-medium ${
                  activeTab === "google-calendar"
                    ? "border-b-2 border-primary"
                    : ""
                }`}
                onClick={() => setActiveTab("google-calendar")}
              >
                Google Calendar
              </button>
            </nav>
          </div>

          {activeTab === "google-calendar" && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="clientEmail" className="text-sm font-medium">
                  Client Email
                </label>
                <Input
                  id="clientEmail"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="privateKey" className="text-sm font-medium">
                  Private Key
                </label>
                <Textarea
                  id="privateKey"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="resize-y max-h-40"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={validateCredentials}
                  disabled={isValidating}
                >
                  {isValidating ? "Validando..." : "Validar"}
                </Button>
                <Button type="submit" disabled={!isValid || isSaving}>
                  Salvar
                </Button>
              </div>
              {isValid ? (
                <p className="text-sm text-green-600">
                  Credenciais válidas.
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  Credenciais não validadas.
                </p>
              )}
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

