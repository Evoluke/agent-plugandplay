"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import UpdateAgentButton from "@/components/agents/UpdateAgentButton";
import AgentMenu from "@/components/agents/AgentMenu";
import AgentGuide from "@/components/agents/AgentGuide";
import DeactivateAgentButton from "@/components/agents/DeactivateAgentButton";
import ActivateAgentButton from "@/components/agents/ActivateAgentButton";
import {
  QUALIFICATION_TRANSFER_RULES,
  QualificationTransferRule,
} from "@/lib/qualificationTransferRules";

type Agent = {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
};

export default function AgentBehaviorPage() {
  const params = useParams();
  const id = params?.id as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [limitations, setLimitations] = useState("");
  const [forbiddenWords, setForbiddenWords] = useState("");
  const [fallback, setFallback] = useState("");
  const [qualificationTransferRule, setQualificationTransferRule] =
    useState<QualificationTransferRule>("never");
  const [qualificationTransferConditions, setQualificationTransferConditions] =
    useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      .from("agent_behavior")
      .select(
        "limitations, forbidden_words, default_fallback, qualification_transfer_rule, qualification_transfer_conditions",
      )
      .eq("agent_id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setLimitations(data.limitations);
          setForbiddenWords(data.forbidden_words);
          setFallback(data.default_fallback);
          setQualificationTransferRule(
            data.qualification_transfer_rule as QualificationTransferRule,
          );
          setQualificationTransferConditions(
            data.qualification_transfer_conditions ?? "",
          );
        }
      });
  }, [id]);

  if (!agent) return <div>Carregando...</div>;

  const limitationsValid = limitations.trim().length <= 500;
  const forbiddenWordsValid = forbiddenWords.trim().length <= 500;
  const fallbackValid = fallback.trim().length >= 10 && fallback.trim().length <= 200;
  const qualificationTransferRuleValid = QUALIFICATION_TRANSFER_RULES.some(
    (r) => r.value === qualificationTransferRule,
  );
  const qualificationTransferConditionsValid =
    qualificationTransferRule !== "personalized" ||
    (qualificationTransferConditions.trim().length > 0 &&
      qualificationTransferConditions.trim().length <= 500);
  const isFormValid =
    limitationsValid &&
    forbiddenWordsValid &&
    fallbackValid &&
    qualificationTransferRuleValid &&
    qualificationTransferConditionsValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);

    const { error } = await supabasebrowser
      .from("agent_behavior")
      .upsert(
        {
          agent_id: id,
          limitations,
          forbidden_words: forbiddenWords,
          default_fallback: fallback,
          qualification_transfer_rule: qualificationTransferRule,
          qualification_transfer_conditions: qualificationTransferConditions,
        },
        { onConflict: "agent_id" }
      );

    if (error) {
      toast.error("Erro ao salvar comportamento.");
    } else {
      toast.success("Comportamento salvo com sucesso.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <AgentMenu agent={agent} />
      <AgentGuide />
      <div className="flex justify-center">
        <Card className="w-full md:w-4/5 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="limitations" className="text-sm font-medium">
                Limitações
              </label>
              <Textarea
                id="limitations"
                value={limitations}
                onChange={(e) => setLimitations(e.target.value)}
                className="resize-y max-h-50 overflow-auto"
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <p>O que deve escalar para humano.</p>
                <p className="text-gray-400">0 a 500 caracteres</p>
              </div>
              {limitations && !limitationsValid && (
                <p className="text-xs text-red-500">
                  As limitações devem ter no máximo 500 caracteres
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="forbiddenWords" className="text-sm font-medium">
                Palavras proibidas
              </label>
              <Textarea
                id="forbiddenWords"
                value={forbiddenWords}
                onChange={(e) => setForbiddenWords(e.target.value)}
                className="resize-y max-h-50 overflow-auto"
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <p>Filtra expressões e ações.</p>
                <p className="text-gray-400">0 a 500 caracteres</p>
              </div>
              {forbiddenWords && !forbiddenWordsValid && (
                <p className="text-xs text-red-500">
                  As palavras proibidas devem ter no máximo 500 caracteres
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="fallback" className="text-sm font-medium">
                Fallback padrão
              </label>
              <Input
                id="fallback"
                value={fallback}
                onChange={(e) => setFallback(e.target.value)}
                minLength={10}
                maxLength={200}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <p>
                  Resposta quando não sabe algo (“Não encontrei. Posso encaminhar?”).
                </p>
                <p className="text-gray-400">10 a 200 caracteres</p>
              </div>
              {fallback && !fallbackValid && (
                <p className="text-xs text-red-500">
                  O fallback deve ter entre 10 e 200 caracteres
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Quando transferir para humano após a qualificação
              </label>
              <Select
                value={qualificationTransferRule}
                onValueChange={(v) => {
                  const value = v as QualificationTransferRule;
                  setQualificationTransferRule(value);
                  if (value !== 'personalized') {
                    setQualificationTransferConditions('');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a regra" />
                </SelectTrigger>
                <SelectContent>
                  {QUALIFICATION_TRANSFER_RULES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Defina a regra para transferência após qualificar o lead.
              </p>
            </div>

            {qualificationTransferRule === 'personalized' && (
              <div className="space-y-2">
                <label
                  htmlFor="qualificationTransferConditions"
                  className="text-sm font-medium"
                >
                  Condições personalizadas
                </label>
                <Textarea
                  id="qualificationTransferConditions"
                  value={qualificationTransferConditions}
                  onChange={(e) =>
                    setQualificationTransferConditions(e.target.value)
                  }
                  className="resize-y max-h-50 overflow-auto"
                  maxLength={500}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <p>Descreva as condições para qualificar o lead.</p>
                  <p className="text-gray-400">1 a 500 caracteres</p>
                </div>
                {qualificationTransferConditions &&
                  !qualificationTransferConditionsValid && (
                    <p className="text-xs text-red-500">
                      As condições personalizadas devem ter entre 1 e 500
                      caracteres
                    </p>
                  )}
              </div>
            )}

            <Button type="submit" disabled={!isFormValid || isSubmitting}>
              Salvar
            </Button>
          </form>
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
          <UpdateAgentButton agentId={id} />
        </div>
      </div>
    </div>
  );
}

