"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";
import { toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal, Plus, Trash2, Pencil, MoveHorizontal } from "lucide-react";

const MIN_STAGES = 2;
const MAX_STAGES = 10;
const MAX_FUNNELS = 5;

interface Lead {
  id: string;
  name: string;
  company?: string;
  value?: string;
  notes?: string;
}

interface Stage {
  id: string;
  name: string;
  leads: Lead[];
}

interface Funnel {
  id: string;
  name: string;
  stages: Stage[];
}

function createLead(values: Pick<Lead, "name" | "company" | "value" | "notes">): Lead {
  return {
    id: crypto.randomUUID(),
    ...values,
  };
}

function createStage(name: string): Stage {
  return {
    id: crypto.randomUUID(),
    name,
    leads: [],
  };
}

function createFunnel(name: string, stages: string[]): Funnel {
  return {
    id: crypto.randomUUID(),
    name,
    stages: stages.map((stage) => createStage(stage)),
  };
}

const DEFAULT_FUNNEL = createFunnel("Funil de Aquisição IA", [
  "Novo lead",
  "Transferência humano",
  "Ganho",
  "Perdido",
]);

const FALLBACK_STAGE_TITLES = [
  "Novos Contatos",
  "Em Andamento",
  "Qualificado",
  "Negociação",
  "Fechado",
];

const FALLBACK_FUNNEL_TITLES = [
  "Funil Comercial",
  "Funil de Expansão",
  "Funil de Retenção",
  "Funil Personalizado",
];

type StageForm = {
  name: string;
  company: string;
  value: string;
  notes: string;
};

const EMPTY_FORM: StageForm = {
  name: "",
  company: "",
  value: "",
  notes: "",
};

export default function SalesFunnelPage() {
  const [funnels, setFunnels] = useState<Funnel[]>([{
    ...DEFAULT_FUNNEL,
    stages: DEFAULT_FUNNEL.stages.map((stage, index) => ({
      ...stage,
      leads:
        index === 0
          ? [
              createLead({
                name: "Ana Souza",
                company: "Evoluke",
                value: "R$ 2.000/mês",
                notes: "Lead recém-importado via IA.",
              }),
              createLead({
                name: "Pedro Alves",
                company: "FinData",
                value: "R$ 1.200/mês",
                notes: "Aguardando resposta do e-mail inicial.",
              }),
            ]
          : [],
    })),
  }]);
  const [selectedFunnelId, setSelectedFunnelId] = useState<string>(
    DEFAULT_FUNNEL.id,
  );
  const [forms, setForms] = useState<Record<string, StageForm>>({});

  const selectedFunnel = useMemo(() => {
    const fallback = funnels[0];
    return funnels.find((funnel) => funnel.id === selectedFunnelId) ?? fallback;
  }, [funnels, selectedFunnelId]);

  const handleSelectFunnel = (funnelId: string) => {
    setSelectedFunnelId(funnelId);
  };

  const handleAddFunnel = () => {
    if (funnels.length >= MAX_FUNNELS) {
      toast.warning(`Você atingiu o limite de ${MAX_FUNNELS} funis.`);
      return;
    }

    const nextName = FALLBACK_FUNNEL_TITLES[funnels.length - 1] ?? "Novo funil";
    const newFunnel = createFunnel(nextName, FALLBACK_STAGE_TITLES.slice(0, MIN_STAGES));
    setFunnels((prev) => [...prev, newFunnel]);
    setSelectedFunnelId(newFunnel.id);
    toast.success("Funil criado com sucesso.");
  };

  const handleRenameFunnel = (funnelId: string) => {
    const current = funnels.find((funnel) => funnel.id === funnelId);
    if (!current) return;
    const nextName = window.prompt("Como deseja nomear este funil?", current.name);
    if (!nextName) return;

    setFunnels((prev) =>
      prev.map((funnel) =>
        funnel.id === funnelId ? { ...funnel, name: nextName.trim() } : funnel,
      ),
    );
    toast.success("Nome do funil atualizado.");
  };

  const handleRemoveFunnel = (funnelId: string) => {
    if (funnels.length === 1) {
      toast.error("É necessário manter pelo menos um funil.");
      return;
    }
    setFunnels((prev) => {
      const updated = prev.filter((funnel) => funnel.id !== funnelId);
      if (selectedFunnelId === funnelId && updated[0]) {
        setSelectedFunnelId(updated[0].id);
      }
      return updated;
    });
    toast.success("Funil removido.");
  };

  const handleAddStage = (funnelId: string) => {
    setFunnels((prev) =>
      prev.map((funnel) => {
        if (funnel.id !== funnelId) return funnel;
        if (funnel.stages.length >= MAX_STAGES) {
          toast.warning(`Limite de ${MAX_STAGES} estágios alcançado.`);
          return funnel;
        }
        const nextIndex = funnel.stages.length + 1;
        const fallbackTitle =
          FALLBACK_STAGE_TITLES[(nextIndex - 1) % FALLBACK_STAGE_TITLES.length];
        const newStage = createStage(`Novo estágio ${nextIndex}`);
        newStage.name = fallbackTitle ?? newStage.name;
        return {
          ...funnel,
          stages: [...funnel.stages, newStage],
        };
      }),
    );
  };

  const handleRenameStage = (funnelId: string, stageId: string) => {
    const currentFunnel = funnels.find((funnel) => funnel.id === funnelId);
    const currentStage = currentFunnel?.stages.find((stage) => stage.id === stageId);
    const stageName = window.prompt(
      "Renomear estágio para:",
      currentStage?.name ?? "",
    );
    if (!stageName) return;
    setFunnels((prev) =>
      prev.map((funnel) => {
        if (funnel.id !== funnelId) return funnel;
        return {
          ...funnel,
          stages: funnel.stages.map((stage) =>
            stage.id === stageId ? { ...stage, name: stageName.trim() } : stage,
          ),
        };
      }),
    );
  };

  const handleRemoveStage = (funnelId: string, stageId: string) => {
    setFunnels((prev) =>
      prev.map((funnel) => {
        if (funnel.id !== funnelId) return funnel;
        if (funnel.stages.length <= MIN_STAGES) {
          toast.error(`Cada funil precisa ter pelo menos ${MIN_STAGES} estágios.`);
          return funnel;
        }
        const targetStage = funnel.stages.find((stage) => stage.id === stageId);
        if (targetStage && targetStage.leads.length > 0) {
          toast.warning("Remova ou mova os leads antes de excluir o estágio.");
          return funnel;
        }
        return {
          ...funnel,
          stages: funnel.stages.filter((stage) => stage.id !== stageId),
        };
      }),
    );
  };

  const handleFormChange = (
    stageId: string,
    field: keyof StageForm,
    value: string,
  ) => {
    setForms((prev) => {
      const current = prev[stageId] ?? EMPTY_FORM;
      return {
        ...prev,
        [stageId]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const handleAddLead = (funnelId: string, stageId: string, event: React.FormEvent) => {
    event.preventDefault();
    const formValues = forms[stageId] ?? EMPTY_FORM;
    if (!formValues.name.trim()) {
      toast.error("Informe ao menos o nome do lead.");
      return;
    }

    const newLead = createLead({
      name: formValues.name.trim(),
      company: formValues.company.trim() || undefined,
      value: formValues.value.trim() || undefined,
      notes: formValues.notes.trim() || undefined,
    });

    setFunnels((prev) =>
      prev.map((funnel) => {
        if (funnel.id !== funnelId) return funnel;
        return {
          ...funnel,
          stages: funnel.stages.map((stage) =>
            stage.id === stageId
              ? { ...stage, leads: [...stage.leads, newLead] }
              : stage,
          ),
        };
      }),
    );

    setForms((prev) => ({
      ...prev,
      [stageId]: { ...EMPTY_FORM },
    }));
    toast.success("Lead adicionado ao funil.");
  };

  const handleMoveLead = (
    funnelId: string,
    fromStageId: string,
    toStageId: string,
    leadId: string,
  ) => {
    if (fromStageId === toStageId) return;
    setFunnels((prev) =>
      prev.map((funnel) => {
        if (funnel.id !== funnelId) return funnel;

        const sourceStage = funnel.stages.find((stage) => stage.id === fromStageId);
        const targetStage = funnel.stages.find((stage) => stage.id === toStageId);
        if (!sourceStage || !targetStage) return funnel;

        const lead = sourceStage.leads.find((item) => item.id === leadId);
        if (!lead) return funnel;

        return {
          ...funnel,
          stages: funnel.stages.map((stage) => {
            if (stage.id === fromStageId) {
              return {
                ...stage,
                leads: stage.leads.filter((item) => item.id !== leadId),
              };
            }
            if (stage.id === toStageId) {
              return {
                ...stage,
                leads: [...stage.leads, lead],
              };
            }
            return stage;
          }),
        };
      }),
    );
    toast.success("Lead movido com sucesso.");
  };

  const handleRemoveLead = (
    funnelId: string,
    stageId: string,
    leadId: string,
  ) => {
    setFunnels((prev) =>
      prev.map((funnel) => {
        if (funnel.id !== funnelId) return funnel;
        return {
          ...funnel,
          stages: funnel.stages.map((stage) =>
            stage.id === stageId
              ? {
                  ...stage,
                  leads: stage.leads.filter((lead) => lead.id !== leadId),
                }
              : stage,
          ),
        };
      }),
    );
    toast.success("Lead removido.");
  };

  if (!selectedFunnel) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Funil de vendas</h1>
        <p className="text-sm text-gray-600">
          Organize seus leads por etapa e acompanhe a evolução das oportunidades em tempo real.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {funnels.map((funnel) => {
          const isActive = funnel.id === selectedFunnel.id;
          return (
            <div
              key={funnel.id}
              className={cn(
                "flex items-center gap-1 rounded-full border px-3 py-1 text-sm",
                isActive
                  ? "border-[#2F6F68] bg-[#2F6F68]/10 text-[#2F6F68]"
                  : "border-gray-200 bg-white text-gray-700",
              )}
            >
              <button
                type="button"
                className="font-medium focus-visible:outline-none"
                onClick={() => handleSelectFunnel(funnel.id)}
              >
                {funnel.name}
              </button>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none"
                    aria-label={`Ações do ${funnel.name}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className="min-w-[180px] rounded-md border bg-white p-1 shadow-lg">
                  <DropdownMenu.Label className="px-2 py-1 text-xs font-semibold text-gray-500">
                    Gerenciar funil
                  </DropdownMenu.Label>
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                    onSelect={() => handleRenameFunnel(funnel.id)}
                  >
                    <Pencil className="h-4 w-4" />
                    Renomear
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-red-600 hover:bg-red-50"
                    onSelect={() => handleRemoveFunnel(funnel.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover funil
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          );
        })}
        <Button
          type="button"
          size="sm"
          onClick={handleAddFunnel}
          disabled={funnels.length >= MAX_FUNNELS}
          className="bg-[#2F6F68] hover:bg-[#255852]"
        >
          <Plus className="h-4 w-4" />
          Novo funil
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{selectedFunnel.name}</h2>
          <p className="text-sm text-gray-600">
            {selectedFunnel.stages.length} estágio(s) · {selectedFunnel.stages.reduce((total, stage) => total + stage.leads.length, 0)} lead(s)
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleAddStage(selectedFunnel.id)}
          disabled={selectedFunnel.stages.length >= MAX_STAGES}
        >
          <Plus className="h-4 w-4" />
          Adicionar estágio
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6">
        {selectedFunnel.stages.map((stage) => {
          const stageForm = forms[stage.id] ?? EMPTY_FORM;
          return (
            <Card key={stage.id} className="min-w-[280px] flex-1 bg-white">
              <CardHeader className="flex flex-row items-start justify-between gap-2 border-b pb-4">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">
                    {stage.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    {stage.leads.length} lead(s)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-900"
                    onClick={() => handleRenameStage(selectedFunnel.id, stage.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-red-600"
                    onClick={() => handleRemoveStage(selectedFunnel.id, stage.id)}
                    disabled={selectedFunnel.stages.length <= MIN_STAGES || stage.leads.length > 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {stage.leads.length === 0 ? (
                    <div className="rounded-md border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
                      Nenhum lead nesta etapa.
                    </div>
                  ) : (
                    stage.leads.map((lead) => (
                      <div
                        key={lead.id}
                        className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                            {lead.company ? (
                              <p className="text-xs text-gray-600">{lead.company}</p>
                            ) : null}
                          </div>
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button
                                type="button"
                                className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none"
                                aria-label={`Ações para ${lead.name}`}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content className="min-w-[200px] rounded-md border bg-white p-1 shadow-lg">
                              <DropdownMenu.Label className="px-2 py-1 text-xs font-semibold text-gray-500">
                                Mover lead
                              </DropdownMenu.Label>
                              {selectedFunnel.stages
                                .filter((candidate) => candidate.id !== stage.id)
                                .map((candidate) => (
                                  <DropdownMenu.Item
                                    key={candidate.id}
                                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                    onSelect={() =>
                                      handleMoveLead(
                                        selectedFunnel.id,
                                        stage.id,
                                        candidate.id,
                                        lead.id,
                                      )
                                    }
                                  >
                                    <MoveHorizontal className="h-4 w-4" />
                                    {candidate.name}
                                  </DropdownMenu.Item>
                                ))}
                              <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
                              <DropdownMenu.Item
                                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-red-600 hover:bg-red-50"
                                onSelect={() =>
                                  handleRemoveLead(
                                    selectedFunnel.id,
                                    stage.id,
                                    lead.id,
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                                Remover lead
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Root>
                        </div>
                        {lead.value ? (
                          <p className="mt-2 text-xs font-medium text-[#2F6F68]">
                            {lead.value}
                          </p>
                        ) : null}
                        {lead.notes ? (
                          <p className="mt-1 text-xs text-gray-600">{lead.notes}</p>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>

                <form
                  className="space-y-2 rounded-lg bg-gray-50 p-3"
                  onSubmit={(event) => handleAddLead(selectedFunnel.id, stage.id, event)}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Adicionar lead
                  </p>
                  <Input
                    placeholder="Nome do lead"
                    value={stageForm.name}
                    onChange={(event) =>
                      handleFormChange(stage.id, "name", event.target.value)
                    }
                  />
                  <Input
                    placeholder="Empresa (opcional)"
                    value={stageForm.company}
                    onChange={(event) =>
                      handleFormChange(stage.id, "company", event.target.value)
                    }
                  />
                  <Input
                    placeholder="Valor potencial (opcional)"
                    value={stageForm.value}
                    onChange={(event) =>
                      handleFormChange(stage.id, "value", event.target.value)
                    }
                  />
                  <Input
                    placeholder="Observações (opcional)"
                    value={stageForm.notes}
                    onChange={(event) =>
                      handleFormChange(stage.id, "notes", event.target.value)
                    }
                  />
                  <Button type="submit" size="sm" className="w-full bg-[#2F6F68] hover:bg-[#255852]">
                    <Plus className="h-4 w-4" />
                    Inserir lead
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
