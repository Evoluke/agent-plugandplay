"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { updateAgentInstructions } from "@/lib/updateAgentInstructions";
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
import {
  MAX_AGENTS_PER_COMPANY,
  ALLOWED_AGENT_TYPES,
  AGENT_PRICE,
} from "@/lib/constants";
import { AGENT_TEMPLATES } from "@/lib/agentTemplates";

export default function NewAgentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentCount, setAgentCount] = useState(0);

  const agentTypes = [
    {
      value: "sdr",
      title: "SDR",
      description: "Gerencia horários e calendários",
      disabled: true,
    },
    {
      value: "pre-qualificacao",
      title: "Pré-qualificação",
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
      const id = company?.id;
      setCompanyId(id || null);
      if (!id) return;
      const { count } = await supabasebrowser
        .from("agents")
        .select("id", { count: "exact", head: true })
        .eq("company_id", id);
      setAgentCount(count || 0);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !companyId || isSubmitting) return;

    if (!ALLOWED_AGENT_TYPES.includes(type)) {
      toast.error("Tipo de agente inválido.");
      return;
    }

    setIsSubmitting(true);

    const { count } = await supabasebrowser
      .from("agents")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId);
    if ((count || 0) >= MAX_AGENTS_PER_COMPANY) {
      toast.error(`Limite de ${MAX_AGENTS_PER_COMPANY} agentes atingido.`);
      setIsSubmitting(false);
      return;
    }

    const { data, error } = await supabasebrowser
      .from("agents")
      .insert({ name, type, company_id: companyId })
      .select("id")
      .single();

    if (error || !data) {
      toast.error("Erro ao criar agente.");
      setIsSubmitting(false);
      return;
    }

    const template = AGENT_TEMPLATES[type];
    if (template) {
      const behavior =
        template.behavior ?? {
          limitations: "",
          default_fallback: "",
        };
      const inserts = [];
      inserts.push(
        supabasebrowser.from("agent_personality").insert({
          agent_id: data.id,
          ...template.personality,
        })
      );
      inserts.push(
        supabasebrowser.from("agent_behavior").insert({
          agent_id: data.id,
          ...behavior,
        })
      );
      inserts.push(
        supabasebrowser.from("agent_onboarding").insert({
          agent_id: data.id,
          ...template.onboarding,
        })
      );
      if (template.specificInstructions.length > 0) {
        inserts.push(
          supabasebrowser
            .from("agent_specific_instructions")
            .insert(
              template.specificInstructions.map((i) => ({
                agent_id: data.id,
                ...i,
              }))
            )
        );
      }
      const results = await Promise.all(inserts);
      if (results.some((r) => r.error)) {
        toast.error("Erro ao aplicar template do agente.");
        setIsSubmitting(false);
        return;
      }
    }

    await updateAgentInstructions(data.id);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const { data: payment, error: paymentError } = await supabasebrowser
      .from("payments")
      .insert({
        company_id: companyId,
        agent_id: data.id,
        amount: AGENT_PRICE,
        due_date: dueDate.toISOString(),
        reference: `Agente ${name}`,
      })
      .select("id, amount, due_date")
      .single();

    if (!paymentError && payment) {
      const { data: sessionData } = await supabasebrowser.auth.getSession();
      const token = sessionData.session?.access_token;
      if (token) {
        await fetch("/api/payments/pay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: payment.id,
            date: payment.due_date.slice(0, 10),
            total: payment.amount,
          }),
        });
      }
    }

    toast.success("Agente criado com sucesso...");
    setTimeout(
      () => window.location.assign(`/dashboard/agents/${data.id}`),
      2000
    );
  };

  const isFormValid = isValidAgentName(name) && type !== "";

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
                      disabled={option.disabled}
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
                    O nome deve ter entre 3 e 50 caracteres
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mt-6 justify-center">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={!isFormValid || agentCount >= MAX_AGENTS_PER_COMPANY || isSubmitting}
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
            {agentCount >= MAX_AGENTS_PER_COMPANY && (
              <p className="text-sm text-center text-red-500 mb-4">
                Limite de {MAX_AGENTS_PER_COMPANY} agentes atingido.
              </p>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}

