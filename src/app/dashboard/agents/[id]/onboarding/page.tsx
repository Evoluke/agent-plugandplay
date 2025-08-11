"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Smile,
  Settings,
  BookOpen,
  Database,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import UpdateAgentButton from "@/components/agents/UpdateAgentButton";

type Agent = {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
};

type CollectionItem = {
  question: string;
  variable: string;
};

export default function AgentOnboardingPage() {
  const params = useParams();
  const id = params?.id as string;
  const pathname = usePathname();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [collection, setCollection] = useState<CollectionItem[]>([
    { question: "", variable: "" },
  ]);
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
          if (Array.isArray(data.collection) && data.collection.length > 0) {
            setCollection(data.collection);
          }
        }
      });
  }, [id]);

  if (!agent) return <div>Carregando...</div>;

  const variableRegex = /^[a-z]+(?:_[a-z]+)*$/;

  const welcomeMessageValid = welcomeMessage.trim().length <= 500;
  const collectionValid = collection.every((item) => {
    const question = item.question.trim();
    const variable = item.variable.trim();

    if (!question && !variable) return true;
    if (question && !variable) return false;
    if (!question && variable) return false;

    return (
      question.length <= 200 &&
      variable.length >= 10 &&
      variable.length <= 200 &&
      variableRegex.test(variable)
    );
  });

  const hasAtLeastOneItem = collection.some(
    (item) => item.question.trim() && item.variable.trim()
  );

  const isFormValid = welcomeMessageValid && collectionValid && hasAtLeastOneItem;

  const handleQuestionChange = (index: number, value: string) => {
    const newCollection = [...collection];
    newCollection[index].question = value;
    setCollection(newCollection);
  };

  const handleVariableChange = (index: number, value: string) => {
    const sanitized = value
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z_]/g, "");
    const newCollection = [...collection];
    newCollection[index].variable = sanitized;
    setCollection(newCollection);
  };

  const addItem = () => {
    if (collection.length >= 5) return;
    setCollection([...collection, { question: "", variable: "" }]);
  };

  const removeItem = (index: number) => {
    if (collection.length === 1) return;
    const newCollection = collection.filter((_, i) => i !== index);
    setCollection(newCollection);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    const filtered = collection.filter(
      (item) => item.question.trim() && item.variable.trim()
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

  const menuItems = [
    { label: "Personalidade", icon: Smile, href: `/dashboard/agents/${id}` },
    {
      label: "Comportamento",
      icon: Settings,
      href: `/dashboard/agents/${id}/comportamento`,
    },
    { label: "Onboarding", icon: BookOpen, href: `/dashboard/agents/${id}/onboarding` },
    {
      label: "Base de conhecimento",
      icon: Database,
      href: `/dashboard/agents/${id}/base-conhecimento`,
    },
    {
      label: "Instruções Específicas",
      icon: ClipboardList,
      href: `/dashboard/agents/${id}/instrucoes-especificas`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Card className="w-4/5 p-6">
          <div className="space-y-4">
            <nav className="flex items-center justify-around">
              {menuItems.map(({ label, icon: Icon, href }, index) => (
                <Fragment key={label}>
                  <Button
                    asChild
                    variant={pathname === href ? "secondary" : "ghost"}
                    className="flex h-auto flex-col items-center gap-1 text-sm"
                  >
                    <Link href={href} className="flex flex-col items-center">
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </Link>
                  </Button>
                  {index < menuItems.length - 1 && (
                    <div className="h-8 border-l" />
                  )}
                </Fragment>
              ))}
            </nav>
            <div className="flex justify-end">
              <UpdateAgentButton agentId={id} />
            </div>
          </div>
        </Card>
      </div>
      <div className="flex justify-center">
        <Card className="w-4/5 p-6">
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
                <p>Oii! Sou a IA da Evoluke.</p>
                <p className="text-gray-400">0 a 500 caracteres</p>
              </div>
              {welcomeMessage && !welcomeMessageValid && (
                <p className="text-xs text-red-500">
                  A mensagem deve ter no máximo 500 caracteres
                </p>
              )}
            </div>

            {collection.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
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
                    htmlFor={`variable-${index}`}
                    className="text-sm font-medium"
                  >
                    Variável de coleta
                  </label>
                  <Input
                    id={`variable-${index}`}
                    placeholder="example_variable"
                    pattern="^[a-z]+(?:_[a-z]+)*$"
                    value={item.variable}
                    onChange={(e) => handleVariableChange(index, e.target.value)}
                    minLength={10}
                    maxLength={200}
                  />
                  <div className="flex justify-end text-xs text-gray-500">
                    <p className="text-gray-400">10 a 200 caracteres, use snake_case</p>
                  </div>
                  {item.variable &&
                    (item.variable.trim().length < 10 ||
                      item.variable.trim().length > 200 ||
                      !variableRegex.test(item.variable.trim())) && (
                      <p className="text-xs text-red-500">
                        A variável deve ter entre 10 e 200 caracteres, usando letras minúsculas e underscore
                      </p>
                    )}
                </div>
                {collection.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeItem(index)}
                  >
                    Remover
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              disabled={collection.length >= 5}
            >
              Adicionar pergunta/variável
            </Button>
            {collection.length >= 5 && (
              <p className="text-xs text-gray-500">
                Máximo de 5 perguntas/variáveis
              </p>
            )}

            <Button type="submit" disabled={!isFormValid || isSubmitting}>
              Salvar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

