"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@supabase/supabase-js";
import { supabasebrowser } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Company {
  id: number;
}

const agentTypes = [
  { value: "agendamento", label: "Agendamento: Automação de agendamentos com usuários." },
  { value: "sdr", label: "SDR: Prospecção e qualificação de leads." },
  { value: "suporte", label: "Suporte: Atendimento automatizado ao cliente." },
];

export default function NewAgentPage() {
  const [type, setType] = useState<string | undefined>(undefined);
  const [name, setName] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabasebrowser.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    supabasebrowser
      .from("company")
      .select("id")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setCompany(data);
      });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) {
      toast.error("Selecione a função do agente");
      return;
    }
    if (!company) {
      toast.error("Empresa não encontrada");
      return;
    }
    if (name.trim().length < 3 || name.trim().length > 80) {
      toast.error("Nome deve ter entre 3 e 80 caracteres");
      return;
    }

    const res = await fetch("/api/agents/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, company_id: company.id }),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Erro ao criar agente");
    } else {
      const { id } = await res.json();
      toast.success("Agente criado!");
      router.push(`/dashboard/agents/${id}`);
    }
  };

  if (!user) return <p className="text-center py-10">Carregando...</p>;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="h-full w-full max-w-lg">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white p-6 rounded-lg shadow"
        >
          <CardTitle className="text-xl font-semibold text-gray-800 mb-6">
            Criar novo agente de IA
          </CardTitle>

          <label className="block mb-1">Função do Agente</label>
          <Select onValueChange={setType} value={type}>
            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Selecione a função" />
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Evoluke SDR"
            required
            minLength={3}
            maxLength={80}
            className="mb-2"
          />
          <p className="text-sm text-gray-500 mb-4">
            Escolha um nome interno para seu agente de IA
          </p>

          <Button type="submit" className="w-full">
            Criar Agente de IA
          </Button>
        </form>
      </div>
    </main>
  );
}
