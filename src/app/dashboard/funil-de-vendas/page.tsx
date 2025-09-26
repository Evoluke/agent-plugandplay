"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { Card as UiCard } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Loader2, Edit2, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface Company {
  id: number;
  company_name: string | null;
}

interface PipelineCard {
  id: string;
  title: string;
  customer_name: string | null;
  value: number | null;
  description: string | null;
  position: number;
  stage_id: string;
  pipeline_id: string;
}

interface PipelineStage {
  id: string;
  name: string;
  position: number;
  cards: PipelineCard[];
}

interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
}

type SupabasePipelineResponse = {
  id: string;
  name: string;
  stages: SupabaseStageResponse[] | null;
};

type SupabaseStageResponse = {
  id: string;
  name: string;
  position: number;
  cards: SupabaseCardResponse[] | null;
};

type SupabaseCardResponse = {
  id: string;
  title: string;
  customer_name: string | null;
  value: number | null;
  description: string | null;
  position: number;
  stage_id: string;
  pipeline_id: string;
};

type PipelineModalState = {
  open: boolean;
  mode: "create" | "edit";
  pipeline?: Pipeline | null;
};

type StageModalState = {
  open: boolean;
  mode: "create" | "edit";
  stage?: PipelineStage | null;
};

type CardModalState = {
  open: boolean;
  mode: "create" | "edit";
  stageId?: string;
  card?: PipelineCard | null;
};

export default function SalesPipelinePage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [pipelineModal, setPipelineModal] = useState<PipelineModalState>({
    open: false,
    mode: "create",
  });
  const [stageModal, setStageModal] = useState<StageModalState>({
    open: false,
    mode: "create",
  });
  const [cardModal, setCardModal] = useState<CardModalState>({
    open: false,
    mode: "create",
  });
  const [formName, setFormName] = useState("");
  const [cardForm, setCardForm] = useState({
    title: "",
    customer_name: "",
    value: "",
    description: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [pipelineToDelete, setPipelineToDelete] = useState<Pipeline | null>(null);
  const [stageToDelete, setStageToDelete] = useState<PipelineStage | null>(null);
  const [cardToDelete, setCardToDelete] = useState<PipelineCard | null>(null);

  useEffect(() => {
    supabasebrowser.auth.getUser().then(async ({ data, error }) => {
      if (error || !data?.user) {
        toast.error("Não foi possível carregar seu perfil.");
        setIsLoading(false);
        return;
      }
      const { data: companyData, error: companyError } = await supabasebrowser
        .from("company")
        .select("id, company_name")
        .eq("user_id", data.user.id)
        .single();
      if (companyError || !companyData) {
        toast.error("Não foi possível carregar os dados da empresa.");
        setIsLoading(false);
        return;
      }
      setCompany(companyData as Company);
      setIsLoading(false);
    });
  }, []);

  const loadPipelines = useCallback(async () => {
    if (!company?.id) return;
    setIsFetching(true);
    const { data, error } = await supabasebrowser
      .from("pipeline")
      .select(
        `id, name, stages:stage(id, name, position, cards:card(id, title, customer_name, value, description, position, stage_id, pipeline_id))`
      )
      .eq("company_id", company.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      toast.error("Não foi possível carregar os funis de vendas.");
      setIsFetching(false);
      return;
    }

    const parsed: Pipeline[] = ((data ?? []) as SupabasePipelineResponse[]).map((pipeline) => ({
      id: pipeline.id,
      name: pipeline.name,
      stages: (pipeline.stages ?? [])
        .map((stage) => ({
          id: stage.id,
          name: stage.name,
          position: stage.position,
          cards: (stage.cards ?? [])
            .map((card) => ({
              id: card.id,
              title: card.title,
              customer_name: card.customer_name,
              value: card.value,
              description: card.description,
              position: card.position,
              stage_id: card.stage_id,
              pipeline_id: card.pipeline_id,
            }))
            .sort((a: PipelineCard, b: PipelineCard) => a.position - b.position),
        }))
        .sort((a: PipelineStage, b: PipelineStage) => a.position - b.position),
    }));

    setPipelines(parsed);
    setSelectedPipelineId((current) => {
      if (current && parsed.some((pipeline) => pipeline.id === current)) {
        return current;
      }
      return parsed[0]?.id ?? null;
    });
    setIsFetching(false);
  }, [company?.id]);

  useEffect(() => {
    if (!company?.id) return;
    void loadPipelines();
  }, [company?.id, loadPipelines]);

  const selectedPipeline = useMemo(
    () => pipelines.find((pipeline) => pipeline.id === selectedPipelineId) ?? null,
    [pipelines, selectedPipelineId]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const openCreatePipeline = () => {
    setFormName("");
    setPipelineModal({ open: true, mode: "create" });
  };

  const openEditPipeline = (pipeline: Pipeline) => {
    setFormName(pipeline.name);
    setPipelineModal({ open: true, mode: "edit", pipeline });
  };

  const handlePipelineSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!company?.id) return;
    const name = formName.trim();
    if (!name) {
      toast.error("Informe um nome para o funil.");
      return;
    }
    setIsSaving(true);
    if (pipelineModal.mode === "create") {
      const { error } = await supabasebrowser
        .from("pipeline")
        .insert({ name, company_id: company.id });
      if (error) {
        console.error(error);
        toast.error("Não foi possível criar o funil.");
      } else {
        toast.success("Funil criado com sucesso.");
        setPipelineModal({ open: false, mode: "create" });
        void loadPipelines();
      }
    } else if (pipelineModal.pipeline) {
      const { error } = await supabasebrowser
        .from("pipeline")
        .update({ name })
        .eq("id", pipelineModal.pipeline.id);
      if (error) {
        console.error(error);
        toast.error("Não foi possível atualizar o funil.");
      } else {
        toast.success("Funil atualizado com sucesso.");
        setPipelineModal({ open: false, mode: "create" });
        void loadPipelines();
      }
    }
    setIsSaving(false);
  };

  const openCreateStage = () => {
    setFormName("");
    setStageModal({ open: true, mode: "create" });
  };

  const openEditStage = (stage: PipelineStage) => {
    setFormName(stage.name);
    setStageModal({ open: true, mode: "edit", stage });
  };

  const handleStageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPipeline) return;
    const name = formName.trim();
    if (!name) {
      toast.error("Informe um nome para o estágio.");
      return;
    }
    setIsSaving(true);
    if (stageModal.mode === "create") {
      const position = selectedPipeline.stages.length;
      const { error } = await supabasebrowser
        .from("stage")
        .insert({ name, pipeline_id: selectedPipeline.id, position });
      if (error) {
        console.error(error);
        toast.error("Não foi possível criar o estágio.");
      } else {
        toast.success("Estágio criado com sucesso.");
        setStageModal({ open: false, mode: "create" });
        void loadPipelines();
      }
    } else if (stageModal.stage) {
      const { error } = await supabasebrowser
        .from("stage")
        .update({ name })
        .eq("id", stageModal.stage.id);
      if (error) {
        console.error(error);
        toast.error("Não foi possível atualizar o estágio.");
      } else {
        toast.success("Estágio atualizado com sucesso.");
        setStageModal({ open: false, mode: "create" });
        void loadPipelines();
      }
    }
    setIsSaving(false);
  };

  const openCreateCard = (stageId: string) => {
    setCardForm({ title: "", customer_name: "", value: "", description: "" });
    setCardModal({ open: true, mode: "create", stageId });
  };

  const openEditCard = (card: PipelineCard) => {
    setCardForm({
      title: card.title,
      customer_name: card.customer_name ?? "",
      value: card.value != null ? String(card.value) : "",
      description: card.description ?? "",
    });
    setCardModal({ open: true, mode: "edit", stageId: card.stage_id, card });
  };

  const handleCardSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPipeline || !company?.id) return;
    const title = cardForm.title.trim();
    if (!title) {
      toast.error("Informe um título para a oportunidade.");
      return;
    }
    const normalizedValue = cardForm.value
      .replace(/\s/g, "")
      .replace(/\.(?=\d{3}(?:\D|$))/g, "")
      .replace(",", ".");
    const value = normalizedValue ? Number(normalizedValue) : null;
    if (normalizedValue && Number.isNaN(value)) {
      toast.error("Informe um valor válido.");
      return;
    }
    setIsSaving(true);
    if (cardModal.mode === "create" && cardModal.stageId) {
      const stage = selectedPipeline.stages.find((item) => item.id === cardModal.stageId);
      const position = stage?.cards.length ?? 0;
      const { error } = await supabasebrowser.from("card").insert({
        title,
        customer_name: cardForm.customer_name || null,
        value,
        description: cardForm.description || null,
        pipeline_id: selectedPipeline.id,
        company_id: company.id,
        stage_id: cardModal.stageId,
        position,
      });
      if (error) {
        console.error(error);
        toast.error("Não foi possível criar a oportunidade.");
      } else {
        toast.success("Oportunidade criada com sucesso.");
        setCardModal({ open: false, mode: "create" });
        void loadPipelines();
      }
    } else if (cardModal.card) {
      const { error } = await supabasebrowser
        .from("card")
        .update({
          title,
          customer_name: cardForm.customer_name || null,
          value,
          description: cardForm.description || null,
        })
        .eq("id", cardModal.card.id);
      if (error) {
        console.error(error);
        toast.error("Não foi possível atualizar a oportunidade.");
      } else {
        toast.success("Oportunidade atualizada com sucesso.");
        setCardModal({ open: false, mode: "create" });
        void loadPipelines();
      }
    }
    setIsSaving(false);
  };

  const handlePipelineDelete = async () => {
    if (!pipelineToDelete) return;
    setIsSaving(true);
    const { error } = await supabasebrowser.from("pipeline").delete().eq("id", pipelineToDelete.id);
    if (error) {
      console.error(error);
      toast.error("Não foi possível remover o funil.");
    } else {
      toast.success("Funil removido com sucesso.");
      setPipelineToDelete(null);
      setSelectedPipelineId((current) => (current === pipelineToDelete.id ? null : current));
      void loadPipelines();
    }
    setIsSaving(false);
  };

  const handleStageDelete = async () => {
    if (!stageToDelete) return;
    setIsSaving(true);
    const { error } = await supabasebrowser.from("stage").delete().eq("id", stageToDelete.id);
    if (error) {
      console.error(error);
      toast.error("Não foi possível remover o estágio.");
    } else {
      toast.success("Estágio removido com sucesso.");
      setStageToDelete(null);
      void loadPipelines();
    }
    setIsSaving(false);
  };

  const handleCardDelete = async () => {
    if (!cardToDelete) return;
    setIsSaving(true);
    const { error } = await supabasebrowser.from("card").delete().eq("id", cardToDelete.id);
    if (error) {
      console.error(error);
      toast.error("Não foi possível remover a oportunidade.");
    } else {
      toast.success("Oportunidade removida com sucesso.");
      setCardToDelete(null);
      void loadPipelines();
    }
    setIsSaving(false);
  };

  const persistCardPositions = useCallback(
    async (stages: PipelineStage[]) => {
      const updates = stages.flatMap((stage) =>
        stage.cards.map((card, index) => ({ id: card.id, stage_id: stage.id, position: index }))
      );
      if (!updates.length) return;
      const { error } = await supabasebrowser
        .from("card")
        .upsert(updates, { onConflict: "id" });
      if (error) {
        console.error(error);
        toast.error("Não foi possível salvar a nova ordem das oportunidades.");
        void loadPipelines();
      }
    },
    [loadPipelines]
  );

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!selectedPipeline || !over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const sourceStageIndex = selectedPipeline.stages.findIndex((stage) =>
      stage.cards.some((card) => card.id === activeId)
    );
    if (sourceStageIndex === -1) return;
    const sourceStage = selectedPipeline.stages[sourceStageIndex];
    const activeCardIndex = sourceStage.cards.findIndex((card) => card.id === activeId);
    if (activeCardIndex === -1) return;
    const cardBeingMoved = sourceStage.cards[activeCardIndex];

    let targetStageIndex = selectedPipeline.stages.findIndex((stage) => stage.id === overId);
    let targetCardIndex: number | null = null;
    if (targetStageIndex === -1) {
      targetStageIndex = selectedPipeline.stages.findIndex((stage) =>
        stage.cards.some((card) => card.id === overId)
      );
      if (targetStageIndex === -1) return;
      const targetStage = selectedPipeline.stages[targetStageIndex];
      targetCardIndex = targetStage.cards.findIndex((card) => card.id === overId);
    } else {
      targetCardIndex = null;
    }

    const targetStage = selectedPipeline.stages[targetStageIndex];

    if (sourceStage.id === targetStage.id && targetCardIndex != null) {
      const reorderedCards = arrayMove(sourceStage.cards, activeCardIndex, targetCardIndex);
      const updatedStages = selectedPipeline.stages.map((stage) =>
        stage.id === sourceStage.id ? { ...stage, cards: reorderedCards } : stage
      );
      setPipelines((prev) =>
        prev.map((pipeline) =>
          pipeline.id === selectedPipeline.id ? { ...pipeline, stages: updatedStages } : pipeline
        )
      );
      await persistCardPositions(updatedStages);
      return;
    }

    const newSourceCards = [...sourceStage.cards];
    newSourceCards.splice(activeCardIndex, 1);
    const newTargetCards = [...targetStage.cards];
    const insertionIndex = targetCardIndex ?? newTargetCards.length;
    newTargetCards.splice(insertionIndex, 0, { ...cardBeingMoved, stage_id: targetStage.id });

    const updatedStages = selectedPipeline.stages.map((stage) => {
      if (stage.id === sourceStage.id) {
        return { ...stage, cards: newSourceCards };
      }
      if (stage.id === targetStage.id) {
        return { ...stage, cards: newTargetCards };
      }
      return stage;
    });

    setPipelines((prev) =>
      prev.map((pipeline) =>
        pipeline.id === selectedPipeline.id ? { ...pipeline, stages: updatedStages } : pipeline
      )
    );
    await persistCardPositions(updatedStages);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#2F6F68]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Funil de vendas</h1>
          <p className="text-sm text-muted-foreground">
            Organize seus processos comerciais com quadros Kanban e acompanhe cada oportunidade.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {pipelines.length > 0 ? (
            <Select value={selectedPipelineId ?? ""} onValueChange={setSelectedPipelineId}>
              <SelectTrigger className="w-full min-w-[220px] sm:w-60">
                <SelectValue placeholder="Selecione um funil" />
              </SelectTrigger>
              <SelectContent>
                {pipelines.map((pipeline) => (
                  <SelectItem key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <Button onClick={openCreatePipeline}>
            <Plus className="h-4 w-4" />
            Novo funil
          </Button>
        </div>
      </header>

      {isFetching ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#2F6F68]" />
        </div>
      ) : null}

      {!isFetching && !selectedPipeline ? (
        <UiCard className="p-8 text-center">
          <h2 className="text-xl font-semibold">Crie seu primeiro funil</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Estruture as etapas do seu processo comercial e comece a acompanhar leads com uma visão clara.
          </p>
          <Button className="mt-4" onClick={openCreatePipeline}>
            <Plus className="h-4 w-4" />
            Criar funil
          </Button>
        </UiCard>
      ) : null}

      {!isFetching && selectedPipeline ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{selectedPipeline.name}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedPipeline.stages.length} estágio(s) ativos neste funil.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => openEditPipeline(selectedPipeline)}>
                <Edit2 className="h-4 w-4" />
                Renomear
              </Button>
              <Button variant="outline" onClick={() => setPipelineToDelete(selectedPipeline)}>
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {selectedPipeline.stages.map((stage) => (
                <SortableContext
                  key={stage.id}
                  items={stage.cards.map((card) => card.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <StageColumn
                    stage={stage}
                    onAddCard={() => openCreateCard(stage.id)}
                    onEditStage={() => openEditStage(stage)}
                    onDeleteStage={() => setStageToDelete(stage)}
                  >
                    {stage.cards.map((card) => (
                      <KanbanCard
                        key={card.id}
                        card={card}
                        onEdit={() => openEditCard(card)}
                        onDelete={() => setCardToDelete(card)}
                      />
                    ))}
                  </StageColumn>
                </SortableContext>
              ))}
              <div className="flex h-full min-w-[280px] items-center justify-center rounded-lg border border-dashed bg-muted/30 p-4">
                <Button variant="ghost" onClick={openCreateStage}>
                  <Plus className="h-4 w-4" />
                  Novo estágio
                </Button>
              </div>
            </div>
          </DndContext>
        </div>
      ) : null}

      <PipelineDialog
        state={pipelineModal}
        onOpenChange={(open) =>
          setPipelineModal((prev) => {
            if (!open) setFormName("");
            return { ...prev, open, ...(open ? {} : { pipeline: null }) };
          })
        }
        formName={formName}
        onFormNameChange={setFormName}
        onSubmit={handlePipelineSubmit}
        isSaving={isSaving}
      />

      <StageDialog
        state={stageModal}
        onOpenChange={(open) =>
          setStageModal((prev) => {
            if (!open) setFormName("");
            return { ...prev, open, ...(open ? {} : { stage: null }) };
          })
        }
        formName={formName}
        onFormNameChange={setFormName}
        onSubmit={handleStageSubmit}
        isSaving={isSaving}
      />

      <CardDialog
        state={cardModal}
        onOpenChange={(open) =>
          setCardModal((prev) => {
            if (!open)
              setCardForm({ title: "", customer_name: "", value: "", description: "" });
            return { ...prev, open, ...(open ? {} : { card: null, stageId: undefined }) };
          })
        }
        form={cardForm}
        onFormChange={setCardForm}
        onSubmit={handleCardSubmit}
        isSaving={isSaving}
      />

      <ConfirmDialog
        open={Boolean(pipelineToDelete)}
        title="Remover funil"
        description="Esta ação é irreversível e removerá também os estágios e oportunidades deste funil. Deseja continuar?"
        confirmLabel="Remover"
        onOpenChange={(open) => {
          if (!open) setPipelineToDelete(null);
        }}
        onConfirm={handlePipelineDelete}
        loading={isSaving}
      />

      <ConfirmDialog
        open={Boolean(stageToDelete)}
        title="Remover estágio"
        description="Ao remover o estágio, todas as oportunidades associadas a ele serão excluídas. Deseja continuar?"
        confirmLabel="Remover"
        onOpenChange={(open) => {
          if (!open) setStageToDelete(null);
        }}
        onConfirm={handleStageDelete}
        loading={isSaving}
      />

      <ConfirmDialog
        open={Boolean(cardToDelete)}
        title="Remover oportunidade"
        description="Você tem certeza de que deseja excluir esta oportunidade do funil?"
        confirmLabel="Remover"
        onOpenChange={(open) => {
          if (!open) setCardToDelete(null);
        }}
        onConfirm={handleCardDelete}
        loading={isSaving}
      />
    </div>
  );
}

function StageColumn({
  stage,
  children,
  onAddCard,
  onEditStage,
  onDeleteStage,
}: {
  stage: PipelineStage;
  children: ReactNode;
  onAddCard: () => void;
  onEditStage: () => void;
  onDeleteStage: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full min-h-[320px] w-72 flex-shrink-0 flex-col rounded-lg border bg-white p-4 shadow-sm",
        isOver && "border-primary/60"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">{stage.name}</h3>
          <span className="text-xs text-muted-foreground">{stage.cards.length} oportunidade(s)</span>
        </div>
        <div className="flex gap-1">
          <IconButton onClick={onEditStage} ariaLabel="Editar estágio">
            <Edit2 className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton onClick={onDeleteStage} ariaLabel="Excluir estágio">
            <Trash2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>
      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
        {children}
      </div>
      <Button variant="ghost" className="mt-4 w-full" onClick={onAddCard}>
        <Plus className="h-4 w-4" />
        Nova oportunidade
      </Button>
    </div>
  );
}

function KanbanCard({
  card,
  onEdit,
  onDelete,
}: {
  card: PipelineCard;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-white p-3 text-left shadow-sm transition",
        isDragging && "ring-2 ring-primary/40"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{card.title}</h4>
          {card.customer_name ? (
            <p className="text-xs text-muted-foreground">{card.customer_name}</p>
          ) : null}
        </div>
        <div className="flex gap-1">
          <IconButton onClick={onEdit} ariaLabel="Editar oportunidade">
            <Edit2 className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton onClick={onDelete} ariaLabel="Excluir oportunidade">
            <Trash2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>
      {card.value != null ? (
        <p className="mt-2 text-xs font-medium text-[#2F6F68]">
          Valor estimado: {formatCurrency(card.value)}
        </p>
      ) : null}
      {card.description ? (
        <p className="mt-2 text-xs text-muted-foreground">{card.description}</p>
      ) : null}
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

function IconButton({
  children,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border bg-white text-muted-foreground shadow-sm transition hover:border-primary/50 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      {children}
    </button>
  );
}

function PipelineDialog({
  state,
  onOpenChange,
  formName,
  onFormNameChange,
  onSubmit,
  isSaving,
}: {
  state: PipelineModalState;
  onOpenChange: (open: boolean) => void;
  formName: string;
  onFormNameChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
}) {
  const title = state.mode === "create" ? "Criar funil" : "Editar funil";
  const description =
    state.mode === "create"
      ? "Defina um nome para organizar suas oportunidades."
      : "Atualize o nome exibido para este funil.";

  return (
    <Dialog.Root open={state.open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Fechar"
                className="rounded-md p-1 text-muted-foreground transition hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="pipeline-name">
                Nome do funil
              </label>
              <Input
                id="pipeline-name"
                value={formName}
                onChange={(event) => onFormNameChange(event.target.value)}
                placeholder="Ex.: Funil comercial principal"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {state.mode === "create" ? "Criar" : "Salvar"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function StageDialog({
  state,
  onOpenChange,
  formName,
  onFormNameChange,
  onSubmit,
  isSaving,
}: {
  state: StageModalState;
  onOpenChange: (open: boolean) => void;
  formName: string;
  onFormNameChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
}) {
  const title = state.mode === "create" ? "Adicionar estágio" : "Editar estágio";
  const description =
    state.mode === "create"
      ? "Defina o nome do novo estágio do funil."
      : "Atualize o nome exibido para este estágio.";

  return (
    <Dialog.Root open={state.open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Fechar"
                className="rounded-md p-1 text-muted-foreground transition hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="stage-name">
                Nome do estágio
              </label>
              <Input
                id="stage-name"
                value={formName}
                onChange={(event) => onFormNameChange(event.target.value)}
                placeholder="Ex.: Contato inicial"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {state.mode === "create" ? "Adicionar" : "Salvar"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CardDialog({
  state,
  onOpenChange,
  form,
  onFormChange,
  onSubmit,
  isSaving,
}: {
  state: CardModalState;
  onOpenChange: (open: boolean) => void;
  form: { title: string; customer_name: string; value: string; description: string };
  onFormChange: (value: { title: string; customer_name: string; value: string; description: string }) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
}) {
  const title = state.mode === "create" ? "Nova oportunidade" : "Editar oportunidade";
  const description =
    state.mode === "create"
      ? "Cadastre rapidamente uma nova oportunidade neste estágio."
      : "Atualize as informações desta oportunidade.";

  return (
    <Dialog.Root open={state.open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Fechar"
                className="rounded-md p-1 text-muted-foreground transition hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="card-title">
                  Título
                </label>
                <Input
                  id="card-title"
                  value={form.title}
                  onChange={(event) => onFormChange({ ...form, title: event.target.value })}
                  placeholder="Ex.: Proposta enviada"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="card-customer">
                  Cliente
                </label>
                <Input
                  id="card-customer"
                  value={form.customer_name}
                  onChange={(event) => onFormChange({ ...form, customer_name: event.target.value })}
                  placeholder="Nome da empresa ou contato"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="card-value">
                Valor estimado (R$)
              </label>
              <Input
                id="card-value"
                value={form.value}
                onChange={(event) => onFormChange({ ...form, value: event.target.value })}
                placeholder="Ex.: 15000"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="card-description">
                Observações
              </label>
              <Textarea
                id="card-description"
                value={form.description}
                onChange={(event) => onFormChange({ ...form, description: event.target.value })}
                placeholder="Inclua detalhes importantes para esta oportunidade."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {state.mode === "create" ? "Adicionar" : "Salvar"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onOpenChange,
  onConfirm,
  loading,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            {description}
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </Dialog.Close>
            <Button variant="destructive" onClick={onConfirm} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

