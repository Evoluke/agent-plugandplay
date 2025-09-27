"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { isValidAgentName } from "@/lib/validators";
import { updateAgentInstructions } from "@/lib/updateAgentInstructions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import AgentMenu from "@/components/agents/AgentMenu";
import AgentGuide from "@/components/agents/AgentGuide";
import DeactivateAgentButton from "@/components/agents/DeactivateAgentButton";
import ActivateAgentButton from "@/components/agents/ActivateAgentButton";

type Agent = {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  company_id: number | null;
};

export default function AgentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [name, setName] = useState("");
  const [tone, setTone] = useState("");
  const [objective, setObjective] = useState("");
  const [limits, setLimits] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companySegment, setCompanySegment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (!id) return;
    supabasebrowser
      .from("agents")
      .select("id,name,type,is_active,company_id")
      .eq("id", id)
      .single<Agent>()
      .then(({ data }) => {
        setAgent(data ?? null);
        setName(data?.name || "");
      });

    supabasebrowser
      .from("agent_personality")
      .select("voice_tone,objective,limits,company_name,company_segment")
      .eq("agent_id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setTone(data.voice_tone);
          setObjective(data.objective);
          setLimits(data.limits);
          setCompanyName(data.company_name);
          setCompanySegment(data.company_segment);
        }
      });
  }, [id]);

  if (!agent) return <div>Carregando...</div>;

  const objectiveValid =
    objective.trim().length >= 10 && objective.trim().length <= 255;
  const limitsValid =
    limits.trim().length >= 10 && limits.trim().length <= 500;
  const companyNameValid =
    companyName.trim().length >= 3 && companyName.trim().length <= 100;
  const companySegmentValid =
    companySegment.trim().length >= 3 &&
    companySegment.trim().length <= 100;
  const isFormValid =
    isValidAgentName(name) &&
    tone !== "" &&
    objectiveValid &&
    limitsValid &&
    companyNameValid &&
    companySegmentValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);

    const { error: agentError } = await supabasebrowser
      .from("agents")
      .update({ name })
      .eq("id", id);

    const { error: personalityError } = await supabasebrowser
      .from("agent_personality")
      .upsert(
        {
          agent_id: id,
          voice_tone: tone,
          objective,
          limits,
          company_name: companyName,
          company_segment: companySegment,
        },
        { onConflict: "agent_id" }
      );

    if (agentError || personalityError) {
      toast.error("Erro ao salvar personalidade.");
    } else {
      await updateAgentInstructions(id);
      toast.success("Personalidade salva com sucesso.");
      window.dispatchEvent(new Event("agentsUpdated"));
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <AgentMenu agent={agent} />
      <AgentGuide />
      <div className="flex justify-center">
        <Card className="w-full md:w-[90%] p-6">
          <p className="text-xs italic text-gray-500 mb-4">
            Defina a personalidade e os objetivos do agente.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1 space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nome interno
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <p>Identifica o agente no dashboard.</p>
                    <p className="text-gray-400"> 3 a 50 caracteres</p>
                  </div>
                  {name && !isValidAgentName(name) && (
                    <p className="text-xs text-red-500">
                      O nome deve ter entre 3 e 50 caracteres
                    </p>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <label htmlFor="company" className="text-sm font-medium">
                    Empresa
                  </label>
                  <Input
                    id="company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <p>Nome da empresa que o agente representa.</p>
                    <p className="text-gray-400">3 a 100 caracteres</p>
                  </div>
                  {companyName && !companyNameValid && (
                    <p className="text-xs text-red-500">
                      O nome deve ter entre 3 e 100 caracteres
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1 space-y-2">
                  <label htmlFor="segment" className="text-sm font-medium">
                    Segmento da empresa
                  </label>
                  <Input
                    id="segment"
                    value={companySegment}
                    onChange={(e) => setCompanySegment(e.target.value)}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <p>Setor em que a empresa atua.</p>
                    <p className="text-gray-400">3 a 100 caracteres</p>
                  </div>
                  {companySegment && !companySegmentValid && (
                    <p className="text-xs text-red-500">
                      O segmento deve ter entre 3 e 100 caracteres
                    </p>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Tom de voz</label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tom" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Define estilo de resposta</p>
                </div>
              </div>
            </div>


            <div className="space-y-2">
              <label htmlFor="objective" className="text-sm font-medium">
                Objetivo
              </label>
              <Textarea
                id="objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="resize-y max-h-50 overflow-auto"
                maxLength={255}
              />
              <div className="flex justify-between text-xs text-gray-500">

              <p>Resume o “por quê” do agente.</p>
              <p className="text-gray-400">10 a 255 caracteres</p>
              </div>
              {objective && !objectiveValid && (
                <p className="text-xs text-red-500">
                  O objetivo deve ter entre 10 e 255 caracteres
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="limits" className="text-sm font-medium">
                Limites
              </label>
              <Textarea
                id="limits"
                value={limits}
                onChange={(e) => setLimits(e.target.value)}
                className="resize-y max-h-50 overflow-auto"
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-gray-500">
              <p>O que não dizer/fazer.</p>
              <p className="text-xs text-gray-400">10 a 500 caracteres</p>
              </div>
              {limits && !limitsValid && (
                <p className="text-xs text-red-500">
                  Os limites devem ter entre 10 e 500 caracteres
                </p>
              )}
            </div>

            <Button type="submit" disabled={!isFormValid || isSubmitting}>
              Salvar
            </Button>
          </form>
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
