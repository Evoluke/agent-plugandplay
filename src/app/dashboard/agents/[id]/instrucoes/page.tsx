"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { updateAgentInstructions } from "@/lib/updateAgentInstructions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AgentMenu from "@/components/agents/AgentMenu";
import AgentGuide from "@/components/agents/AgentGuide";
import DeactivateAgentButton from "@/components/agents/DeactivateAgentButton";
import ActivateAgentButton from "@/components/agents/ActivateAgentButton";

interface Agent {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  company_id: number | null;
}

interface FaqItem {
  context: string;
  userSays: string;
  action: string;
}

export default function AgentInstructionsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabasebrowser
      .from("agents")
      .select("id,name,type,is_active,company_id")
      .eq("id", id)
      .single<Agent>()
      .then(({ data }) => {
        setAgent(data ?? null);
      });

    supabasebrowser
      .from("agent_specific_instructions")
      .select("context,user_says,action")
      .eq("agent_id", id)
      .then(({ data }) => {
        if (data) {
          setFaqs(
            data.slice(0, 5).map(
              (item: {
                context?: string;
                user_says?: string;
                action?: string;
              }) => ({
                context: item.context ?? "",
                userSays: item.user_says ?? "",
                action: item.action ?? "",
              })
            )
          );
        } else {
          setFaqs([]);
        }
      });
  }, [id]);

  if (!agent) return <div>Carregando...</div>;

  const faqValid =
    faqs.length <= 5 &&
    faqs.every(
      (f) =>
        f.context.trim().length > 0 &&
        f.context.trim().length <= 255 &&
        f.userSays.trim().length > 0 &&
        f.userSays.trim().length <= 255 &&
        f.action.trim().length > 0 &&
        f.action.trim().length <= 255
    );
  const isFormValid = faqValid;

  const addFaq = () => {
    if (faqs.length >= 5) return;
    setFaqs([...faqs, { context: "", userSays: "", action: "" }]);
  };

  const removeFaq = (index: number) =>
    setFaqs(faqs.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (!isFormValid || isSubmitting) {
      toast.error("Preencha os campos obrigatórios corretamente.");
      return;
    }
    setIsSubmitting(true);

    const { error: deleteError } = await supabasebrowser
      .from("agent_specific_instructions")
      .delete()
      .eq("agent_id", id);

    if (deleteError) {
      toast.error("Erro ao salvar instruções.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabasebrowser
      .from("agent_specific_instructions")
      .insert(
        faqs.map((f) => ({
          agent_id: id,
          context: f.context,
          user_says: f.userSays,
          action: f.action,
        }))
      );

    if (error) {
      toast.error("Erro ao salvar instruções.");
    } else {
      await updateAgentInstructions(id);
      toast.success("Instruções salvas com sucesso.");
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
            Crie respostas específicas para situações ou perguntas frequentes.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="space-y-4 rounded-md border p-4"
              >
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium">Instrução {index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFaq(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor={`context-${index}`}
                    className="text-sm font-medium"
                  >
                    Contexto
                  </label>
                  <Input
                    id={`context-${index}`}
                    value={faq.context}
                    onChange={(e) =>
                      setFaqs((prev) =>
                        prev.map((f, i) =>
                          i === index ? { ...f, context: e.target.value } : f
                        )
                      )
                    }
                    maxLength={255}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <p>Cenário onde a instrução se aplica.</p>
                    <p className="text-gray-400">1 a 255 caracteres</p>
                  </div>
                  {showErrors && faq.context.trim() === "" && (
                    <p className="text-xs text-red-500">
                      O contexto é obrigatório
                    </p>
                  )}
                  {showErrors && faq.context.trim().length > 255 && (
                    <p className="text-xs text-red-500">
                      O contexto deve ter no máximo 255 caracteres
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor={`userSays-${index}`}
                    className="text-sm font-medium"
                  >
                    Usuário diz
                  </label>
                  <Input
                    id={`userSays-${index}`}
                    value={faq.userSays}
                    onChange={(e) =>
                      setFaqs((prev) =>
                        prev.map((f, i) =>
                          i === index ? { ...f, userSays: e.target.value } : f
                        )
                      )
                    }
                    maxLength={255}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <p>O que o usuário fala.</p>
                    <p className="text-gray-400">1 a 255 caracteres</p>
                  </div>
                  {showErrors && faq.userSays.trim() === "" && (
                    <p className="text-xs text-red-500">
                      A mensagem do usuário é obrigatória
                    </p>
                  )}
                  {showErrors && faq.userSays.trim().length > 255 && (
                    <p className="text-xs text-red-500">
                      A mensagem deve ter no máximo 255 caracteres
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor={`action-${index}`}
                    className="text-sm font-medium"
                  >
                    Aja assim
                  </label>
                  <Textarea
                    id={`action-${index}`}
                    value={faq.action}
                    onChange={(e) =>
                      setFaqs((prev) =>
                        prev.map((f, i) =>
                          i === index ? { ...f, action: e.target.value } : f
                        )
                      )
                    }
                    className="resize-y max-h-50 overflow-auto"
                    maxLength={255}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <p>Resposta ou ação do agente.</p>
                    <p className="text-gray-400">1 a 255 caracteres</p>
                  </div>
                  {showErrors && faq.action.trim() === "" && (
                    <p className="text-xs text-red-500">A ação é obrigatória</p>
                  )}
                  {showErrors && faq.action.trim().length > 255 && (
                    <p className="text-xs text-red-500">
                      A ação deve ter no máximo 255 caracteres
                    </p>
                  )}
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addFaq}
              className="flex items-center gap-2"
              disabled={faqs.length >= 5}
            >
              <Plus className="h-4 w-4" /> Adicionar instrução
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
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

