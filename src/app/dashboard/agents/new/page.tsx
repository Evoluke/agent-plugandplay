"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isValidAgentName } from "@/lib/validators";
import { toast } from "sonner";

export default function NewAgentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [companyId, setCompanyId] = useState<number | null>(null);

  useEffect(() => {
    supabasebrowser.auth.getUser().then(async ({ data }) => {
      const user = data?.user;
      if (!user) return;
      const { data: company } = await supabasebrowser
        .from("company")
        .select("id")
        .eq("user_id", user.id)
        .single();
      setCompanyId(company?.id || null);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !companyId) return;

    const { data, error } = await supabasebrowser
      .from("agents")
      .insert({ name, type, company_id: companyId })
      .select("id")
      .single();

    if (error || !data) {
      toast.error("Erro ao criar agente.");
      return;
    }

    toast.success(
      "Agente criado com sucesso. Configure-o ou ative-o quando estiver pronto."
    );
    router.push(`/dashboard/agents/${data.id}`);
  };

  const isFormValid = isValidAgentName(name) && type !== "";

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-semibold">Criar novo agente de IA</h1>
        <p className="text-sm text-gray-600">
          Você poderá ativá-lo e configurar fluxos depois.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Função do Agente</label>
          <Select onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agendamento">
                Agendamento - Gerencia horários e calendários
              </SelectItem>
              <SelectItem value="sdr">
                SDR - Qualifica e interage com leads
              </SelectItem>
              <SelectItem value="suporte">
                Suporte - Responde dúvidas e auxilia clientes
              </SelectItem>
            </SelectContent>
          </Select>
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
            Escolha um nome interno para seu agente de IA
          </p>
          {name && !isValidAgentName(name) && (
            <p className="text-xs text-red-500">
              O nome deve ter entre 3 e 80 caracteres
            </p>
          )}
        </div>

        <div className="flex space-x-2">
          <Button type="submit" disabled={!isFormValid}>
            Criar Agente de IA
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/agents")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

