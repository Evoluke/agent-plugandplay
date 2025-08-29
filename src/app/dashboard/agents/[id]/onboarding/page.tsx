"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
};

type CollectionItem = {
  question: string;
  information: string;
};

export default function AgentOnboardingPage() {
  const params = useParams();
  const id = params?.id as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [collection, setCollection] = useState<CollectionItem[]>([]);
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
      .from("agent_onboarding")
      .select("welcome_message, collection")
      .eq("agent_id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setWelcomeMessage(data.welcome_message);
          if (Array.isArray(data.collection)) {
            setCollection(data.collection);
          }
        }
      });
  }, [id]);

  if (!agent) return <div>Carregando...</div>;

  const welcomeMessageValid = welcomeMessage.trim().length <= 500;
  const collectionValid = collection.every((item) => {
    const question = item.question.trim();
    const information = item.information.trim();

    if (!question && !information) return true;
    if (question && !information) return false;
    if (!question && information) return false;

    return question.length <= 200 && information.length <= 200;
  });

  const isFormValid = welcomeMessageValid && collectionValid;

  const handleQuestionChange = (index: number, value: string) => {
    const newCollection = [...collection];
    newCollection[index].question = value;
    setCollection(newCollection);
  };

  const handleInformationChange = (index: number, value: string) => {
    const newCollection = [...collection];
    newCollection[index].information = value;
    setCollection(newCollection);
  };

  const addItem = () => {
    if (collection.length >= 5) return;
    setCollection([...collection, { question: "", information: "" }]);
  };

  const removeItem = (index: number) => {
    const newCollection = collection.filter((_, i) => i !== index);
    setCollection(newCollection);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    const filtered = collection.filter(
      (item) => item.question.trim() && item.information.trim()
    );
    const { error } = await supabasebrowser
      .from("agent_onboarding")
      .upsert(
        {
          agent_id: id,
          welcome_message: welcomeMessage,
          collection: filtered,
        },
        { onConflict: "agent_id" }
      );

    if (error) {
      toast.error("Erro ao salvar onboarding.");
    } else {
      toast.success("Onboarding salvo com sucesso.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <AgentMenu agent={agent} />
      <AgentGuide />
      <div className="flex justify-center">
        <Card className="w-full md:w-4/5 p-6">
          <p className="text-xs italic text-gray-500 mb-4">
            Personalize a mensagem inicial e colete dados essenciais dos usuários.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="welcome" className="text-sm font-medium">
                Mensagem de boas-vindas
              </label>
              <Textarea
                id="welcome"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="resize-y max-h-50 overflow-auto"
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <p>exemplo: Oii! Sou a IA da Evoluke.</p>
                <p className="text-gray-400">0 a 500 caracteres</p>
              </div>
              {welcomeMessage && !welcomeMessageValid && (
                <p className="text-xs text-red-500">
                  A mensagem deve ter no máximo 500 caracteres
                </p>
              )}
            </div>

            {collection.map((item, index) => (
              <div key={index} className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1 space-y-2">
                  <label
                    htmlFor={`question-${index}`}
                    className="text-sm font-medium"
                  >
                    Pergunta de coleta
                  </label>
                  <Input
                    id={`question-${index}`}
                    value={item.question}
                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                    maxLength={200}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <p>Nome, telefone, preferência de horário.</p>
                    <p className="text-gray-400">0 a 200 caracteres</p>
                  </div>
                  {item.question && item.question.trim().length > 200 && (
                    <p className="text-xs text-red-500">
                      A pergunta deve ter no máximo 200 caracteres
                    </p>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label
                    htmlFor={`information-${index}`}
                    className="text-sm font-medium"
                  >
                    Explique o que é essa informação
                  </label>
                  <Input
                    id={`information-${index}`}
                    placeholder="Ex: Nome completo do cliente"
                    value={item.information}
                    onChange={(e) =>
                      handleInformationChange(index, e.target.value)
                    }
                    maxLength={200}
                  />
                  <div className="flex justify-end text-xs text-gray-500">
                    <p className="text-gray-400">0 a 200 caracteres</p>
                  </div>
                  {item.information &&
                    item.information.trim().length > 200 && (
                      <p className="text-xs text-red-500">
                        A explicação deve ter no máximo 200 caracteres
                      </p>
                    )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeItem(index)}
                  className="self-start md:self-auto"
                >
                  Remover
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              disabled={collection.length >= 5}
            >
              Adicionar pergunta/explicação
            </Button>
            {collection.length >= 5 && (
              <p className="text-xs text-gray-500">
                Máximo de 5 perguntas/explicações
              </p>
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
        </div>
      </div>
    </div>
  );
}

