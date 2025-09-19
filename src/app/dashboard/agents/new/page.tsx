"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import AgentTypeCard from "@/components/agents/AgentTypeCard";
import { toast } from "sonner";
import { supabasebrowser } from "@/lib/supabaseClient";

export default function NewAgentPage() {
  const router = useRouter();
  type AgentCreateResponse = {
    id?: string;
    message?: string;
    error?: string;
    agentCount?: number;
    maxAgents?: number;
    limitReached?: boolean;
  };
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxAgents, setMaxAgents] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);

  const fetchAuthToken = useCallback(async () => {
    try {
      const { data, error } = await supabasebrowser.auth.getSession();

      if (error) {
        console.error("[agents:new] Erro ao obter sessão", error);
        toast.error("Não foi possível validar sua sessão. Faça login novamente.");
        return null;
      }

      const token = data.session?.access_token ?? null;

      if (!token) {
        toast.error("Sessão expirada. Faça login novamente.");
        return null;
      }

      return token;
    } catch (error) {
      console.error("[agents:new] Erro inesperado ao obter sessão", error);
      toast.error("Não foi possível validar sua sessão. Faça login novamente.");
      return null;
    }
  }, []);

  const updateLimitState = useCallback(
    (payload: AgentCreateResponse | null) => {
      if (!payload) return;
      setMaxAgents(
        typeof payload.maxAgents === "number" ? payload.maxAgents : null
      );
      const limit =
        typeof payload.maxAgents === "number" &&
        typeof payload.agentCount === "number"
          ? payload.agentCount >= payload.maxAgents
          : Boolean(payload.limitReached);
      setLimitReached(limit);
    },
    [setLimitReached, setMaxAgents]
  );

  const agentTypes = [
    {
      value: "sdr",
      title: "SDR",
      description: "Qualifica leads e agenda no calendário",
    },
    {
      value: "pre-qualificacao",
      title: "Pré-qualificação",
      description: "Pré-qualifica leads e transfere para atendimento humano.",
    },
    {
      value: "suporte",
      title: "Suporte",
      description: "Responde dúvidas e auxilia clientes",
    },
  ];

  useEffect(() => {
    let isActive = true;

    const loadAgentInfo = async () => {
      setIsLoadingInfo(true);

      const token = await fetchAuthToken();

      if (!isActive) return;

      if (!token) {
        setIsLoadingInfo(false);
        return;
      }

      try {
        const response = await fetch("/api/agents/create", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        let data: AgentCreateResponse | null = null;

        try {
          data = (await response.json()) as AgentCreateResponse;
        } catch {
          data = null;
        }

        if (!isActive) return;

        if (response.ok && data) {
          updateLimitState(data);
        } else if (data?.error) {
          toast.error(data.error);
        }
      } catch {
        if (isActive) {
          toast.error("Não foi possível carregar informações do agente.");
        }
      } finally {
        if (isActive) {
          setIsLoadingInfo(false);
        }
      }
    };

    void loadAgentInfo();

    return () => {
      isActive = false;
    };
  }, [fetchAuthToken, updateLimitState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting || limitReached) return;

    const token = await fetchAuthToken();

    if (!token) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/agents/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, type }),
        credentials: "include",
      });

      let data: AgentCreateResponse | null = null;

      try {
        data = (await response.json()) as AgentCreateResponse;
      } catch {
        data = null;
      }

      if (!response.ok) {
        if (data?.error) {
          toast.error(data.error);
        } else {
          toast.error("Erro ao criar agente.");
        }

        updateLimitState(data);
        return;
      }

      toast.success(data?.message ?? "Agente criado com sucesso.");

      updateLimitState(data);

      const agentId = data?.id;

      if (typeof agentId === "string") {
        router.push(`/dashboard/agents/${agentId}`);
      }
    } catch {
      toast.error("Erro ao criar agente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = name.trim().length > 0 && type !== "";

  return (
    <div className="bg-[#FAFAFA] flex items-center justify-center py-6">
      <div className="w-full px-4 sm:max-w-md md:max-w-lg">
        <Card className="border shadow-lg rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            <CardHeader className="bg-white px-6 py-4 border-b mb-2">
              <CardTitle className="text-xl font-semibold text-gray-800 text-center">Criar novo agente de IA</CardTitle>
              <CardDescription className="text-center">
                Você poderá cria-lo e configurar os fluxos depois.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Modelo do Agente</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {agentTypes.map((option) => (
                    <AgentTypeCard
                      key={option.value}
                      value={option.value}
                      title={option.title}
                      description={option.description}
                      selected={type === option.value}
                      onSelect={setType}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nome do Agente
                </label>
                <Input
                  id="name"
                  placeholder="Ex: Evoluke SDR"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Escolha um nome interno para seu Agente de IA
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mt-6 justify-center">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={
                  !isFormValid || limitReached || isSubmitting || isLoadingInfo
                }
              >
                Criar Agente de IA
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push("/dashboard")}
              >
                Cancelar
              </Button>
            </CardFooter>
            {limitReached && (
              <p className="text-sm text-center text-red-500 mb-4">
                {typeof maxAgents === "number"
                  ? `Limite de ${maxAgents} agentes atingido.`
                  : "Limite de agentes atingido."}
              </p>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}

