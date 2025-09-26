"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  DragEndEvent,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabasebrowser } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  PencilLine,
  Trash2,
  Columns,
  X,
} from "lucide-react";

type PipelineCard = {
  id: string;
  title: string;
  description: string | null;
  value: number | null;
  position: number;
  stage_id: string;
  pipeline_id: string;
};

type PipelineStage = {
  id: string;
  name: string;
  position: number;
  cards: PipelineCard[];
};

type Pipeline = {
  id: string;
  name: string;
  description: string | null;
  stages: PipelineStage[];
};

type SupabaseCardRow = {
  id: string;
  title: string;
  description: string | null;
  value: number | string | null;
  position: number;
  stage_id: string;
  pipeline_id: string;
};

type SupabaseStageRow = {
  id: string;
  name: string;
  position: number;
  cards: SupabaseCardRow[] | null;
};

type SupabasePipelineRow = {
  id: string;
  name: string;
  description: string | null;
  stages: SupabaseStageRow[] | null;
};

type PipelineFormMode = "create" | "edit";
type StageFormMode = "create" | "edit";
type CardFormMode = "create" | "edit";

function StageContainer({
  stage,
  children,
}: {
  stage: PipelineStage;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.id}`,
    data: { stageId: stage.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 min-w-[18rem] flex-col rounded-lg border border-[#E2E8F0] bg-white shadow-sm transition ${
        isOver ? "ring-2 ring-[#2F6F68]" : ""
      }`}
    >
      {children}
    </div>
  );
}

function SortablePipelineCard({
  card,
  onEdit,
  onDelete,
}: {
  card: PipelineCard;
  onEdit: (card: PipelineCard) => void;
  onDelete: (card: PipelineCard) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: card.id,
      data: { stageId: card.stage_id },
    });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-md border border-[#E2E8F0] bg-white p-3 shadow-sm transition hover:border-[#97B7B4]"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-[#2F2F2F]">{card.title}</h4>
          {card.description ? (
            <p className="mt-1 text-xs text-[#475569]">{card.description}</p>
          ) : null}
        </div>
        <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(card)}
            className="rounded p-1 text-[#2F6F68] hover:bg-[#E6F2F1]"
            aria-label="Editar card"
          >
            <PencilLine className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(card)}
            className="rounded p-1 text-[#E11D48] hover:bg-[#FEE2E2]"
            aria-label="Excluir card"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {card.value !== null ? (
        <p className="mt-3 text-xs font-medium text-[#2F6F68]">
          Valor estimado: {card.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
      ) : null}
    </div>
  );
}

export default function SalesPipelinePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const [pipelineModalOpen, setPipelineModalOpen] = useState(false);
  const [pipelineModalMode, setPipelineModalMode] = useState<PipelineFormMode>("create");
  const [pipelineName, setPipelineName] = useState("");
  const [pipelineDescription, setPipelineDescription] = useState("");
  const [editingPipelineId, setEditingPipelineId] = useState<string | null>(null);

  const [confirmDeletePipelineOpen, setConfirmDeletePipelineOpen] = useState(false);

  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [stageModalMode, setStageModalMode] = useState<StageFormMode>("create");
  const [stageName, setStageName] = useState("");
  const [editingStageId, setEditingStageId] = useState<string | null>(null);

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardModalMode, setCardModalMode] = useState<CardFormMode>("create");
  const [cardTitle, setCardTitle] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  const [cardValue, setCardValue] = useState<string>("");
  const [editingCard, setEditingCard] = useState<PipelineCard | null>(null);
  const [cardStageId, setCardStageId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const selectedPipeline = useMemo(
    () => pipelines.find((pipeline) => pipeline.id === selectedPipelineId) ?? null,
    [pipelines, selectedPipelineId],
  );

  useEffect(() => {
    let ignore = false;
    supabasebrowser.auth.getUser().then(({ data, error }) => {
      if (ignore) return;
      if (error || !data?.user) {
        toast.error("Não foi possível carregar as informações do usuário.");
        setIsLoading(false);
        return;
      }
      setUserId(data.user.id);
    });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    let ignore = false;
    supabasebrowser
      .from("company")
      .select("id")
      .eq("user_id", userId)
      .single()
      .then(({ data, error }) => {
        if (ignore) return;
        if (error || !data) {
          toast.error("Não foi possível localizar a empresa associada ao usuário.");
          setIsLoading(false);
          return;
        }
        setCompanyId(data.id as number);
      });
    return () => {
      ignore = true;
    };
  }, [userId]);

  const loadPipelines = useCallback(async () => {
    if (!companyId) return;
    setIsLoading(true);
    const { data, error } = await supabasebrowser
      .from("pipeline")
      .select(
        `id, name, description, stages:stage(id, name, position, cards:card(id, title, description, value, position, stage_id, pipeline_id))`,
      )
      .eq("company_id", companyId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao carregar funis", error.message);
      toast.error("Não foi possível carregar os funis de vendas.");
      setIsLoading(false);
      return;
    }

    const rawPipelines = (data ?? []) as SupabasePipelineRow[];
    const normalized: Pipeline[] = rawPipelines.map((pipeline) => ({
      id: pipeline.id,
      name: pipeline.name,
      description: pipeline.description,
      stages: (pipeline.stages ?? [])
        .map((stage) => ({
          id: stage.id,
          name: stage.name,
          position: stage.position,
          cards: (stage.cards ?? [])
            .map((card) => {
              const parsedValue = typeof card.value === "number" ? card.value : Number(card.value);
              return {
                id: card.id,
                title: card.title,
                description: card.description,
                value: card.value === null || Number.isNaN(parsedValue) ? null : parsedValue,
                position: card.position,
                stage_id: card.stage_id,
                pipeline_id: card.pipeline_id,
              };
            })
            .sort((a, b) => a.position - b.position),
        }))
        .sort((a, b) => a.position - b.position),
    }));

    setPipelines(normalized);

    setSelectedPipelineId((current) => {
      if (!normalized.length) {
        return null;
      }
      if (!current) {
        return normalized[0].id;
      }
      const exists = normalized.some((pipeline) => pipeline.id === current);
      return exists ? current : normalized[0].id;
    });

    setIsLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    void loadPipelines();
  }, [companyId, loadPipelines]);

  const resetCardForm = () => {
    setCardTitle("");
    setCardDescription("");
    setCardValue("");
    setEditingCard(null);
    setCardStageId(null);
  };

  const handlePipelineSubmit = async () => {
    if (!companyId) return;
    const trimmedName = pipelineName.trim();
    if (!trimmedName) {
      toast.error("Informe um nome para o funil.");
      return;
    }

    const payload: { name: string; description?: string | null } = {
      name: trimmedName,
      description: pipelineDescription.trim() ? pipelineDescription.trim() : null,
    };

    if (pipelineModalMode === "create") {
      const { error } = await supabasebrowser
        .from("pipeline")
        .insert([{ ...payload, company_id: companyId }]);
      if (error) {
        toast.error("Não foi possível criar o funil.");
        return;
      }
      toast.success("Funil criado com sucesso.");
    } else if (editingPipelineId) {
      const { error } = await supabasebrowser
        .from("pipeline")
        .update(payload)
        .eq("id", editingPipelineId);
      if (error) {
        toast.error("Não foi possível atualizar o funil.");
        return;
      }
      toast.success("Funil atualizado.");
    }

    setPipelineModalOpen(false);
    setPipelineName("");
    setPipelineDescription("");
    setEditingPipelineId(null);
    await loadPipelines();
  };

  const handleDeletePipeline = async () => {
    if (!selectedPipelineId) return;
    setIsSyncing(true);
    const { error } = await supabasebrowser
      .from("pipeline")
      .delete()
      .eq("id", selectedPipelineId);
    setIsSyncing(false);
    if (error) {
      toast.error("Não foi possível excluir o funil.");
      return;
    }
    toast.success("Funil removido.");
    setConfirmDeletePipelineOpen(false);
    await loadPipelines();
  };

  const handleStageSubmit = async () => {
    const currentPipelineId = selectedPipelineId;
    if (!currentPipelineId) return;
    const trimmedName = stageName.trim();
    if (!trimmedName) {
      toast.error("Informe um nome para o estágio.");
      return;
    }

    if (stageModalMode === "create") {
      const currentPipeline = pipelines.find((pipeline) => pipeline.id === currentPipelineId);
      const nextPosition = currentPipeline ? currentPipeline.stages.length : 0;
      const { error } = await supabasebrowser
        .from("stage")
        .insert([{ name: trimmedName, pipeline_id: currentPipelineId, position: nextPosition }]);
      if (error) {
        toast.error("Não foi possível criar o estágio.");
        return;
      }
      toast.success("Estágio criado.");
    } else if (editingStageId) {
      const { error } = await supabasebrowser
        .from("stage")
        .update({ name: trimmedName })
        .eq("id", editingStageId);
      if (error) {
        toast.error("Não foi possível renomear o estágio.");
        return;
      }
      toast.success("Estágio atualizado.");
    }

    setStageModalOpen(false);
    setStageName("");
    setEditingStageId(null);
    await loadPipelines();
  };

  const handleDeleteStage = async (stageId: string) => {
    const { error } = await supabasebrowser.from("stage").delete().eq("id", stageId);
    if (error) {
      toast.error("Não foi possível remover o estágio.");
      return;
    }
    toast.success("Estágio removido.");
    await loadPipelines();
  };

  const handleOpenStageEdit = (stage: PipelineStage) => {
    setStageModalMode("edit");
    setStageName(stage.name);
    setEditingStageId(stage.id);
    setStageModalOpen(true);
  };

  const handleOpenStageCreate = () => {
    setStageModalMode("create");
    setStageName("");
    setEditingStageId(null);
    setStageModalOpen(true);
  };

  const handleOpenPipelineCreate = () => {
    setPipelineModalMode("create");
    setPipelineName("");
    setPipelineDescription("");
    setEditingPipelineId(null);
    setPipelineModalOpen(true);
  };

  const handleOpenPipelineEdit = () => {
    if (!selectedPipeline) return;
    setPipelineModalMode("edit");
    setPipelineName(selectedPipeline.name);
    setPipelineDescription(selectedPipeline.description ?? "");
    setEditingPipelineId(selectedPipeline.id);
    setPipelineModalOpen(true);
  };

  const handleOpenCardCreate = (stageId: string) => {
    setCardModalMode("create");
    setCardStageId(stageId);
    resetCardForm();
    setCardModalOpen(true);
  };

  const handleOpenCardEdit = (card: PipelineCard) => {
    setCardModalMode("edit");
    setCardStageId(card.stage_id);
    setCardTitle(card.title);
    setCardDescription(card.description ?? "");
    setCardValue(card.value !== null && !Number.isNaN(card.value) ? String(card.value) : "");
    setEditingCard(card);
    setCardModalOpen(true);
  };

  const handleDeleteCard = async (card: PipelineCard) => {
    const { error } = await supabasebrowser.from("card").delete().eq("id", card.id);
    if (error) {
      toast.error("Não foi possível remover o card.");
      return;
    }
    toast.success("Card removido.");
    await loadPipelines();
  };

  const handleCardSubmit = async () => {
    if (!selectedPipelineId || !cardStageId) return;
    const trimmedTitle = cardTitle.trim();
    if (!trimmedTitle) {
      toast.error("Informe um título para o card.");
      return;
    }
    const numericValue = cardValue ? Number(cardValue) : null;
    if (cardValue && Number.isNaN(Number(cardValue))) {
      toast.error("Informe um valor numérico válido.");
      return;
    }

    if (cardModalMode === "create") {
      const targetStage = selectedPipeline?.stages.find((stage) => stage.id === cardStageId);
      const nextPosition = targetStage ? targetStage.cards.length : 0;
      const { error } = await supabasebrowser.from("card").insert([
        {
          title: trimmedTitle,
          description: cardDescription.trim() ? cardDescription.trim() : null,
          value: numericValue,
          pipeline_id: selectedPipelineId,
          stage_id: cardStageId,
          position: nextPosition,
        },
      ]);
      if (error) {
        toast.error("Não foi possível criar o card.");
        return;
      }
      toast.success("Card criado.");
    } else if (editingCard) {
      const { error } = await supabasebrowser
        .from("card")
        .update({
          title: trimmedTitle,
          description: cardDescription.trim() ? cardDescription.trim() : null,
          value: numericValue,
          stage_id: cardStageId,
        })
        .eq("id", editingCard.id);
      if (error) {
        toast.error("Não foi possível atualizar o card.");
        return;
      }
      toast.success("Card atualizado.");
    }

    setCardModalOpen(false);
    resetCardForm();
    await loadPipelines();
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!selectedPipeline || !over) return;
    const activeStageId = active.data.current?.stageId as string | undefined;
    const overStageId = over.data.current?.stageId as string | undefined;
    if (!activeStageId || !overStageId) return;

    if (active.id === over.id && activeStageId === overStageId) return;

    let updatedPipeline: Pipeline | null = null;

    setPipelines((prev) =>
      prev.map((pipeline) => {
        if (pipeline.id !== selectedPipeline.id) return pipeline;

        const stages = pipeline.stages.map((stage) => ({
          ...stage,
          cards: stage.cards.map((card) => ({ ...card })),
        }));

        const sourceStage = stages.find((stage) => stage.id === activeStageId);
        const destinationStage = stages.find((stage) => stage.id === overStageId);

        if (!sourceStage || !destinationStage) return pipeline;

        if (sourceStage.id === destinationStage.id) {
          const oldIndex = sourceStage.cards.findIndex((card) => card.id === active.id);
          if (oldIndex === -1) return pipeline;
          let newIndex = sourceStage.cards.findIndex((card) => card.id === over.id);
          const isOverStage = typeof over.id === "string" && over.id.startsWith("stage-");
          if (isOverStage || newIndex === -1) {
            newIndex = sourceStage.cards.length - 1;
          }
          sourceStage.cards = arrayMove(sourceStage.cards, oldIndex, newIndex).map((card, index) => ({
            ...card,
            position: index,
          }));
        } else {
          const movingCard = sourceStage.cards.find((card) => card.id === active.id);
          if (!movingCard) return pipeline;
          sourceStage.cards = sourceStage.cards
            .filter((card) => card.id !== movingCard.id)
            .map((card, index) => ({ ...card, position: index }));

          const destinationCards = [...destinationStage.cards];
          const isOverStage = typeof over.id === "string" && over.id.startsWith("stage-");
          let insertIndex = destinationCards.findIndex((card) => card.id === over.id);
          if (isOverStage || insertIndex === -1) {
            insertIndex = destinationCards.length;
          }

          destinationCards.splice(insertIndex, 0, {
            ...movingCard,
            stage_id: destinationStage.id,
          });

          destinationStage.cards = destinationCards.map((card, index) => ({
            ...card,
            position: index,
          }));
        }

        updatedPipeline = {
          ...pipeline,
          stages,
        };

        return updatedPipeline;
      }),
    );

    if (!updatedPipeline) return;

    const affectedStageIds = new Set<string>([activeStageId, overStageId]);
    const updates: { id: string; stage_id: string; position: number; pipeline_id: string }[] = [];

    updatedPipeline.stages
      .filter((stage) => affectedStageIds.has(stage.id))
      .forEach((stage) => {
        stage.cards.forEach((card) => {
          updates.push({
            id: card.id,
            stage_id: stage.id,
            position: card.position,
            pipeline_id: card.pipeline_id,
          });
        });
      });

    setIsSyncing(true);
    const { error } = await supabasebrowser.from("card").upsert(updates, { onConflict: "id" });
    setIsSyncing(false);
    if (error) {
      console.error("Erro ao atualizar posições", error.message);
      toast.error("Não foi possível sincronizar a nova posição dos cards.");
      await loadPipelines();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2F2F2F]">Funil de vendas</h1>
          <p className="mt-1 text-sm text-[#475569]">
            Organize oportunidades, crie estágios personalizados e arraste os cards para atualizar o status de cada lead.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <Button onClick={handleOpenPipelineCreate} className="bg-[#2F6F68] text-white hover:bg-[#255852]">
            <Plus className="mr-2 h-4 w-4" /> Novo funil
          </Button>
          {selectedPipeline ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleOpenPipelineEdit}>
                <PencilLine className="mr-2 h-4 w-4" /> Renomear funil
              </Button>
              <Button variant="destructive" onClick={() => setConfirmDeletePipelineOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Excluir funil
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Columns className="h-5 w-5 text-[#2F6F68]" />
          <span className="text-sm font-medium text-[#2F2F2F]">Selecione o funil:</span>
        </div>
        <div className="w-full max-w-xs">
          <Select
            value={selectedPipelineId ?? ""}
            onValueChange={(value) => setSelectedPipelineId(value || null)}
            disabled={!pipelines.length}
          >
            <SelectTrigger>
              <SelectValue placeholder="Nenhum funil disponível" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map((pipeline) => (
                <SelectItem key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isSyncing ? (
          <div className="flex items-center gap-2 text-sm text-[#2F6F68]">
            <Loader2 className="h-4 w-4 animate-spin" /> Sincronizando alterações...
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-[#475569]">
            <Loader2 className="h-5 w-5 animate-spin" /> Carregando funis...
          </div>
        </div>
      ) : !pipelines.length ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-[#97B7B4] bg-white/70 p-10 text-center">
          <Columns className="h-10 w-10 text-[#97B7B4]" />
          <h2 className="mt-4 text-lg font-semibold text-[#2F2F2F]">Comece criando seu primeiro funil</h2>
          <p className="mt-2 max-w-md text-sm text-[#475569]">
            Estruture seu processo comercial em etapas claras e mantenha o time alinhado com o andamento das oportunidades.
          </p>
          <Button onClick={handleOpenPipelineCreate} className="mt-6 bg-[#2F6F68] text-white hover:bg-[#255852]">
            Criar funil de vendas
          </Button>
        </div>
      ) : !selectedPipeline ? (
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#475569]">
          Selecione um funil para visualizar os estágios e cards.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[#2F2F2F]">Estágios</h2>
            <Button variant="outline" onClick={handleOpenStageCreate}>
              <Plus className="mr-2 h-4 w-4" /> Novo estágio
            </Button>
          </div>
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex w-full gap-4 overflow-x-auto pb-4">
              {selectedPipeline.stages.map((stage) => (
                <StageContainer key={stage.id} stage={stage}>
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] p-4">
                    <div>
                      <h3 className="text-sm font-semibold text-[#2F2F2F]">{stage.name}</h3>
                      <p className="text-xs text-[#64748B]">{stage.cards.length} cards</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenStageEdit(stage)}
                        className="rounded p-1 text-[#2F6F68] hover:bg-[#E6F2F1]"
                        aria-label="Editar estágio"
                      >
                        <PencilLine className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStage(stage.id)}
                        className="rounded p-1 text-[#E11D48] hover:bg-[#FEE2E2]"
                        aria-label="Excluir estágio"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3 p-4">
                    <SortableContext items={stage.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
                      {stage.cards.map((card) => (
                        <SortablePipelineCard
                          key={card.id}
                          card={card}
                          onEdit={handleOpenCardEdit}
                          onDelete={handleDeleteCard}
                        />
                      ))}
                    </SortableContext>
                    <Button
                      variant="outline"
                      className="h-auto w-full justify-center border-dashed border-[#97B7B4] text-[#2F6F68]"
                      onClick={() => handleOpenCardCreate(stage.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Novo card
                    </Button>
                  </div>
                </StageContainer>
              ))}
              <div className="flex min-w-[18rem] items-center justify-center rounded-lg border border-dashed border-[#97B7B4] bg-white/70 p-4">
                <Button variant="ghost" onClick={handleOpenStageCreate} className="text-[#2F6F68] hover:bg-[#E6F2F1]">
                  <Plus className="mr-2 h-4 w-4" /> Adicionar estágio
                </Button>
              </div>
            </div>
          </DndContext>
        </div>
      )}

      <Dialog.Root open={pipelineModalOpen} onOpenChange={setPipelineModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-[#2F2F2F]">
                {pipelineModalMode === "create" ? "Novo funil" : "Editar funil"}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button aria-label="Fechar" className="rounded p-1 text-[#475569] hover:bg-[#E2E8F0]">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2F2F2F]" htmlFor="pipeline-name">
                  Nome do funil
                </label>
                <Input
                  id="pipeline-name"
                  value={pipelineName}
                  onChange={(event) => setPipelineName(event.target.value)}
                  placeholder="Ex: Funil de pré-vendas"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2F2F2F]" htmlFor="pipeline-description">
                  Descrição (opcional)
                </label>
                <Textarea
                  id="pipeline-description"
                  value={pipelineDescription}
                  onChange={(event) => setPipelineDescription(event.target.value)}
                  placeholder="Resuma o objetivo deste funil."
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline">Cancelar</Button>
              </Dialog.Close>
              <Button className="bg-[#2F6F68] text-white hover:bg-[#255852]" onClick={handlePipelineSubmit}>
                {pipelineModalMode === "create" ? "Criar funil" : "Salvar alterações"}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={stageModalOpen} onOpenChange={setStageModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-[#2F2F2F]">
                {stageModalMode === "create" ? "Novo estágio" : "Editar estágio"}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button aria-label="Fechar" className="rounded p-1 text-[#475569] hover:bg-[#E2E8F0]">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium text-[#2F2F2F]" htmlFor="stage-name">
                Nome do estágio
              </label>
              <Input
                id="stage-name"
                value={stageName}
                onChange={(event) => setStageName(event.target.value)}
                placeholder="Ex: Qualificação"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline">Cancelar</Button>
              </Dialog.Close>
              <Button className="bg-[#2F6F68] text-white hover:bg-[#255852]" onClick={handleStageSubmit}>
                {stageModalMode === "create" ? "Criar estágio" : "Salvar alterações"}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={cardModalOpen} onOpenChange={(open) => {
        setCardModalOpen(open);
        if (!open) {
          resetCardForm();
        }
      }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-[#2F2F2F]">
                {cardModalMode === "create" ? "Novo card" : "Editar card"}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button aria-label="Fechar" className="rounded p-1 text-[#475569] hover:bg-[#E2E8F0]">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2F2F2F]" htmlFor="card-title">
                  Título
                </label>
                <Input
                  id="card-title"
                  value={cardTitle}
                  onChange={(event) => setCardTitle(event.target.value)}
                  placeholder="Ex: Contato com João Silva"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2F2F2F]" htmlFor="card-description">
                  Descrição (opcional)
                </label>
                <Textarea
                  id="card-description"
                  value={cardDescription}
                  onChange={(event) => setCardDescription(event.target.value)}
                  placeholder="Inclua notas relevantes sobre a oportunidade."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2F2F2F]" htmlFor="card-value">
                  Valor estimado (opcional)
                </label>
                <Input
                  id="card-value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={cardValue}
                  onChange={(event) => setCardValue(event.target.value)}
                  placeholder="Ex: 1500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline">Cancelar</Button>
              </Dialog.Close>
              <Button className="bg-[#2F6F68] text-white hover:bg-[#255852]" onClick={handleCardSubmit}>
                {cardModalMode === "create" ? "Criar card" : "Salvar alterações"}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={confirmDeletePipelineOpen} onOpenChange={setConfirmDeletePipelineOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-[#2F2F2F]">Excluir funil</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-[#475569]">
              Esta ação removerá o funil e todos os cards associados. Deseja continuar?
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline">Cancelar</Button>
              </Dialog.Close>
              <Button variant="destructive" onClick={handleDeletePipeline} disabled={isSyncing}>
                {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirmar exclusão
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

