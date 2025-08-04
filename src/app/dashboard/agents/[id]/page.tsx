"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const agentTypes = [
  { value: "agendamento", label: "Agendamento: Automação de agendamentos com usuários." },
  { value: "sdr", label: "SDR: Prospecção e qualificação de leads." },
  { value: "suporte", label: "Suporte: Atendimento automatizado ao cliente." },
];

interface Agent {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
}

export default function EditAgentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      const res = await fetch(`/api/agents/${id}`);
      if (!res.ok) {
        toast.error("Agente não encontrado");
        router.push("/dashboard/agents/new");
        return;
      }
      const data = await res.json();
      setAgent(data);
      setLoading(false);
    };
    fetchAgent();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;
    if (agent.name.trim().length < 3 || agent.name.trim().length > 80) {
      toast.error("Nome deve ter entre 3 e 80 caracteres");
      return;
    }
    const res = await fetch(`/api/agents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(agent),
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Erro ao atualizar agente");
    } else {
      toast.success("Agente atualizado!");
    }
  };

  if (loading || !agent) return <p className="text-center py-10">Carregando...</p>;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="h-full w-full max-w-lg">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white p-6 rounded-lg shadow"
        >
          <CardTitle className="text-xl font-semibold text-gray-800 mb-6">
            Editar agente de IA
          </CardTitle>

          <label className="block mb-1">Função do Agente</label>
          <Select
            onValueChange={(v) => setAgent({ ...agent, type: v })}
            value={agent.type}
          >
            <SelectTrigger className="w-full mb-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {agentTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="block mb-1">Nome do Agente</label>
          <Input
            value={agent.name}
            onChange={(e) => setAgent({ ...agent, name: e.target.value })}
            required
            minLength={3}
            maxLength={80}
            className="mb-2"
          />
          <p className="text-sm text-gray-500 mb-4">
            Escolha um nome interno para seu agente de IA
          </p>

          <label className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              checked={agent.is_active}
              onChange={(e) => setAgent({ ...agent, is_active: e.target.checked })}
            />
            <span>Ativo</span>
          </label>

          <Button type="submit" className="w-full">
            Salvar alterações
          </Button>
        </form>
      </div>
    </main>
  );
}
