"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
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
import { isValidAgentName } from "@/lib/validators";
import { toast } from "sonner";

export default function NewAgentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [companyId, setCompanyId] = useState<number | null>(null);

  const agentTypes = [
    {
      value: "agendamento",
      title: "Agendamento",
      description: "Gerencia horários e calendários",
    },
    {
      value: "sdr",
      title: "SDR",
      description: "Qualifica e interage com leads",
    },
    {
      value: "suporte",
      title: "Suporte",
      description: "Responde dúvidas e auxilia clientes",
    },
  ];

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
    router.refresh();
    router.push(`/dashboard/agents/${data.id}`);    
  };

  const isFormValid = isValidAgentName(name) && type !== "";

  return (
    <div className="bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="h-full w-full max-w-lg">
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
                <label className="text-sm font-medium">Função do Agente</label>
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
                {name && !isValidAgentName(name) && (
                  <p className="text-xs text-red-500">
                    O nome deve ter entre 3 e 80 caracteres
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex space-x-2 mt-6">
              <Button type="submit" disabled={!isFormValid}>
                Criar Agente de IA
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Cancelar
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

