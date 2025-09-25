"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2, X, KanbanSquare, Edit2 } from "lucide-react";

import { supabasebrowser } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card as UiCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Pipeline {
  id: string;
  name: string;
  company_id: number;
}

interface KanbanCard {
  id: string;
  stage_id: string;
  title: string;
  description: string | null;
  value: number | null;
  position: number;
}

interface Stage {
  id: string;
  title: string;
  position: number;
  cards: KanbanCard[];
}

interface StageSnapshot {
  stageId: string;
  cards: KanbanCard[];
}

export default function FunilDeVendasPage() {
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [boardLoading, setBoardLoading] = useState(false);
  const [creatingPipelineName, setCreatingPipelineName] = useState("");
  const [editingPipelineName, setEditingPipelineName] = useState("");
  const [creatingStageTitle, setCreatingStageTitle] = useState("");
  const [creatingStageLoading, setCreatingStageLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const fetchPipelines = useCallback(
    async (company: number) => {
      const { data, error } = await supabasebrowser
        .from("pipeline")
        .select("id,name,company_id")
        .eq("company_id", company)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      setPipelines(data ?? []);
      if (data && data.length > 0) {
        setSelectedPipelineId((current) => current ?? data[0].id);
      } else {
        setSelectedPipelineId(null);
      }
    },
    [],
  );

  const fetchStages = useCallback(async (pipelineId: string) => {
    const { data, error } = await supabasebrowser
      .from("stage")
      .select(
        `id,title,position, cards:card(id,title,description,value,position)`
      )
      .eq("pipeline_id", pipelineId)
      .order("position", { ascending: true });

    if (error) {
      console.error("Erro ao carregar estágios:", error);
      toast.error("Não foi possível carregar os estágios do funil.");
      return;
    }

    const formattedStages: Stage[] = (data ?? []).map((stage) => ({
      id: stage.id,
      title: stage.title,
      position: stage.position ?? 0,
      cards: (stage.cards ?? [])
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((card) => ({
          id: card.id,
          stage_id: stage.id,
          title: card.title,
          description: card.description,
          value: card.value != null ? Number(card.value) : null,
          position: card.position ?? 0,
        })),
    }));

    setStages(formattedStages);
  }, []);

  useEffect(() => {
    const fetchCompanyAndPipelines = async () => {
      setInitialLoading(true);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabasebrowser.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          toast.error("Não foi possível identificar o usuário autenticado.");
          setInitialLoading(false);
          return;
        }

        const { data: company, error: companyError } = await supabasebrowser
          .from("company")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (companyError || !company) {
          throw companyError ?? new Error("Empresa não encontrada");
        }

        setCompanyId(company.id);
        await fetchPipelines(company.id);
      } catch (error) {
        console.error("Erro ao carregar funis:", error);
        toast.error("Não foi possível carregar os funis de vendas.");
      } finally {
        setInitialLoading(false);
      }
    };

    void fetchCompanyAndPipelines();
  }, [fetchPipelines]);

  useEffect(() => {
    const pipeline = pipelines.find((item) => item.id === selectedPipelineId);
    if (pipeline) {
      setEditingPipelineName(pipeline.name);
    } else {
      setEditingPipelineName("");
    }
  }, [pipelines, selectedPipelineId]);

  useEffect(() => {
    if (!selectedPipelineId) {
      setStages([]);
      return;
    }

    setBoardLoading(true);
    void fetchStages(selectedPipelineId).finally(() => setBoardLoading(false));
  }, [fetchStages, selectedPipelineId]);

  const handleCreatePipeline = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!companyId || !creatingPipelineName.trim()) return;

    try {
      const { data, error } = await supabasebrowser
        .from("pipeline")
        .insert({
          company_id: companyId,
          name: creatingPipelineName.trim(),
        })
        .select("id,name,company_id")
        .single();

      if (error) throw error;

      setPipelines((prev) => [...prev, data]);
      setCreatingPipelineName("");
      setSelectedPipelineId(data.id);
      toast.success("Funil criado com sucesso.");
    } catch (error) {
      console.error("Erro ao criar funil:", error);
      toast.error("Não foi possível criar o funil.");
    }
  };

  const handleUpdatePipeline = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPipelineId || !editingPipelineName.trim()) return;

    try {
      const { error } = await supabasebrowser
        .from("pipeline")
        .update({ name: editingPipelineName.trim() })
        .eq("id", selectedPipelineId);

      if (error) throw error;

      setPipelines((prev) =>
        prev.map((pipeline) =>
          pipeline.id === selectedPipelineId
            ? { ...pipeline, name: editingPipelineName.trim() }
            : pipeline,
        ),
      );
      toast.success("Funil atualizado.");
    } catch (error) {
      console.error("Erro ao atualizar funil:", error);
      toast.error("Não foi possível renomear o funil.");
    }
  };

  const handleDeletePipeline = async () => {
    if (!selectedPipelineId) return;
    const pipelineName = pipelines.find((item) => item.id === selectedPipelineId)?.name;
    const confirmed = window.confirm(
      `Tem certeza de que deseja excluir o funil${pipelineName ? ` "${pipelineName}"` : ""}? Esta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    try {
      const { error } = await supabasebrowser.from("pipeline").delete().eq("id", selectedPipelineId);
      if (error) throw error;

      const updatedPipelines = pipelines.filter((pipeline) => pipeline.id !== selectedPipelineId);
      setPipelines(updatedPipelines);
      setStages([]);
      setSelectedPipelineId(updatedPipelines[0]?.id ?? null);
      toast.success("Funil removido.");
    } catch (error) {
      console.error("Erro ao excluir funil:", error);
      toast.error("Não foi possível remover o funil.");
    }
  };

  const handleCreateStage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPipelineId || !creatingStageTitle.trim()) return;

    setCreatingStageLoading(true);
    try {
      const { data, error } = await supabasebrowser
        .from("stage")
        .insert({
          pipeline_id: selectedPipelineId,
          title: creatingStageTitle.trim(),
          position: stages.length,
        })
        .select("id,title,position")
        .single();

      if (error) throw error;

      const newStage: Stage = {
        id: data.id,
        title: data.title,
        position: data.position ?? stages.length,
        cards: [],
      };

      setStages((prev) => [...prev, newStage]);
      setCreatingStageTitle("");
      toast.success("Estágio criado com sucesso.");
    } catch (error) {
      console.error("Erro ao criar estágio:", error);
      toast.error("Não foi possível criar o estágio.");
    } finally {
      setCreatingStageLoading(false);
    }
  };

  const handleRenameStage = async (stageId: string, title: string) => {
    if (!title.trim()) {
      toast.error("O nome do estágio não pode ficar vazio.");
      return;
    }

    try {
      const { error } = await supabasebrowser.from("stage").update({ title: title.trim() }).eq("id", stageId);
      if (error) throw error;

      setStages((prev) =>
        prev.map((stage) =>
          stage.id === stageId
            ? {
                ...stage,
                title: title.trim(),
              }
            : stage,
        ),
      );
      toast.success("Estágio atualizado.");
    } catch (error) {
      console.error("Erro ao renomear estágio:", error);
      toast.error("Não foi possível renomear o estágio.");
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    const stage = stages.find((item) => item.id === stageId);
    const confirmed = window.confirm(
      `Confirma a exclusão do estágio${stage ? ` "${stage.title}"` : ""}? Os cartões associados serão removidos.`,
    );
    if (!confirmed) return;

    try {
      const { error } = await supabasebrowser.from("stage").delete().eq("id", stageId);
      if (error) throw error;

      const updatedStages = stages
        .filter((item) => item.id !== stageId)
        .map((item, index) => ({ ...item, position: index }));
      setStages(updatedStages);

      await Promise.all(
        updatedStages.map(async (item, index) => {
          const { error: positionError } = await supabasebrowser
            .from("stage")
            .update({ position: index })
            .eq("id", item.id);
          if (positionError) throw positionError;
        }),
      );
      toast.success("Estágio excluído.");
    } catch (error) {
      console.error("Erro ao excluir estágio:", error);
      toast.error("Não foi possível remover o estágio.");
    }
  };

  const handleCreateCard = async (
    stageId: string,
    payload: { title: string; description: string; value: string },
  ): Promise<boolean> => {
    const title = payload.title.trim();
    if (!title) {
      toast.error("O cartão precisa de um título.");
      return false;
    }

    const value = payload.value ? Number(payload.value.replace(/,/g, ".")) : null;
    if (Number.isNaN(value as number) && payload.value) {
      toast.error("Valor inválido para o cartão.");
      return false;
    }

    try {
      const { data, error } = await supabasebrowser
        .from("card")
        .insert({
          stage_id: stageId,
          title,
          description: payload.description.trim() ? payload.description.trim() : null,
          value,
          position: stages.find((stage) => stage.id === stageId)?.cards.length ?? 0,
        })
        .select("id,title,description,value,position")
        .single();

      if (error) throw error;

      const normalizedCard: KanbanCard = {
        id: data.id,
        stage_id: stageId,
        title: data.title,
        description: data.description,
        value: data.value != null ? Number(data.value) : null,
        position: data.position ?? 0,
      };

      setStages((prev) =>
        prev.map((stage) =>
          stage.id === stageId
            ? {
                ...stage,
                cards: [...stage.cards, normalizedCard],
              }
            : stage,
        ),
      );
      toast.success("Cartão adicionado ao estágio.");
      return true;
    } catch (error) {
      console.error("Erro ao criar cartão:", error);
      toast.error("Não foi possível criar o cartão.");
      return false;
    }
  };

  const handleUpdateCard = async (
    stageId: string,
    cardId: string,
    payload: { title: string; description: string; value: string },
  ): Promise<boolean> => {
    const title = payload.title.trim();
    if (!title) {
      toast.error("O cartão precisa de um título.");
      return false;
    }

    const value = payload.value ? Number(payload.value.replace(/,/g, ".")) : null;
    if (Number.isNaN(value as number) && payload.value) {
      toast.error("Valor inválido para o cartão.");
      return false;
    }

    try {
      const { error } = await supabasebrowser
        .from("card")
        .update({
          title,
          description: payload.description.trim() ? payload.description.trim() : null,
          value,
        })
        .eq("id", cardId);

      if (error) throw error;

      setStages((prev) =>
        prev.map((stage) =>
          stage.id === stageId
            ? {
                ...stage,
                cards: stage.cards.map((card) =>
                  card.id === cardId
                    ? {
                        ...card,
                        title,
                        description: payload.description.trim() ? payload.description.trim() : null,
                        value: value != null ? value : null,
                      }
                    : card,
                ),
              }
            : stage,
        ),
      );
      toast.success("Cartão atualizado.");
      return true;
    } catch (error) {
      console.error("Erro ao atualizar cartão:", error);
      toast.error("Não foi possível atualizar o cartão.");
      return false;
    }
  };

  const handleDeleteCard = async (stageId: string, cardId: string): Promise<boolean> => {
    const confirmed = window.confirm("Deseja realmente remover este cartão do estágio?");
    if (!confirmed) return false;

    try {
      const { error } = await supabasebrowser.from("card").delete().eq("id", cardId);
      if (error) throw error;

      const updatedStages = stages.map((stage) => {
        if (stage.id !== stageId) return stage;
        const filtered = stage.cards.filter((card) => card.id !== cardId);
        return {
          ...stage,
          cards: filtered.map((card, index) => ({ ...card, position: index })),
        };
      });
      setStages(updatedStages);

      const stageSnapshot = updatedStages.find((stage) => stage.id === stageId);
      if (stageSnapshot) {
        await persistCardPositions([{ stageId, cards: stageSnapshot.cards }]);
      }

      toast.success("Cartão removido.");
      return true;
    } catch (error) {
      console.error("Erro ao remover cartão:", error);
      toast.error("Não foi possível remover o cartão.");
      if (selectedPipelineId) {
        void fetchStages(selectedPipelineId);
      }
      return false;
    }
  };

  const persistCardPositions = useCallback(async (snapshots: StageSnapshot[]) => {
    try {
      for (const snapshot of snapshots) {
        for (const [index, card] of snapshot.cards.entries()) {
          const { error } = await supabasebrowser
            .from("card")
            .update({ stage_id: snapshot.stageId, position: index })
            .eq("id", card.id);
          if (error) throw error;
        }
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeStageId = active.data.current?.stageId as string | undefined;
    const targetStageId = (over.data.current?.stageId as string | undefined) ?? (over.id as string | undefined);
    const activeType = active.data.current?.type;

    if (activeType !== "card" || !activeStageId || !targetStageId) return;

    if (activeStageId === targetStageId && active.id === over.id) return;

    const stageMap = new Map(stages.map((stage) => [stage.id, stage] as const));
    const sourceStage = stageMap.get(activeStageId);
    const destinationStage = stageMap.get(targetStageId);
    if (!sourceStage || !destinationStage) return;

    const sourceIndex = sourceStage.cards.findIndex((card) => card.id === active.id);
    if (sourceIndex === -1) return;

    let targetIndex: number;
    if (over.data.current?.type === "card" && over.data.current?.index != null) {
      targetIndex = over.data.current.index as number;
    } else {
      targetIndex = destinationStage.cards.length - (destinationStage.id === sourceStage.id ? 1 : 0);
      if (targetIndex < 0) targetIndex = 0;
    }

    const movingCard = sourceStage.cards[sourceIndex];

    const updatedStages = stages.map((stage) => {
      if (stage.id === sourceStage.id && stage.id === destinationStage.id) {
        const reordered = arrayMove(stage.cards, sourceIndex, targetIndex);
        return {
          ...stage,
          cards: reordered.map((card, index) => ({ ...card, position: index })),
        };
      }

      if (stage.id === sourceStage.id) {
        const remaining = [...stage.cards];
        remaining.splice(sourceIndex, 1);
        return {
          ...stage,
          cards: remaining.map((card, index) => ({ ...card, position: index })),
        };
      }

      if (stage.id === destinationStage.id) {
        const destinationCards = [...stage.cards];
        const insertionIndex = Math.min(targetIndex, destinationCards.length);
        destinationCards.splice(insertionIndex, 0, { ...movingCard, stage_id: stage.id });
        return {
          ...stage,
          cards: destinationCards.map((card, index) => ({ ...card, position: index })),
        };
      }

      return stage;
    });

    setStages(updatedStages);

    try {
      const snapshots: StageSnapshot[] = updatedStages
        .filter((stage) => stage.id === sourceStage.id || stage.id === destinationStage.id)
        .map((stage) => ({ stageId: stage.id, cards: stage.cards }));
      await persistCardPositions(snapshots);
    } catch (error) {
      console.error("Erro ao atualizar posições do cartão:", error);
      toast.error("Não foi possível salvar a nova posição do cartão.");
      if (selectedPipelineId) {
        void fetchStages(selectedPipelineId);
      }
    }
  };

  const emptyState = useMemo(() => {
    if (initialLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Carregando funis de vendas...</p>
        </div>
      );
    }

    if (pipelines.length === 0) {
      return (
        <div className="rounded-lg border border-dashed bg-white p-8 text-center text-sm text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">Nenhum funil cadastrado ainda</p>
          <p>Crie um novo funil para começar a organizar seu processo comercial em estágios.</p>
        </div>
      );
    }

    if (boardLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Carregando estágios do funil selecionado...</p>
        </div>
      );
    }

    if (stages.length === 0) {
      return (
        <div className="rounded-lg border border-dashed bg-white p-8 text-center text-sm text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">Adicione o primeiro estágio</p>
          <p>Os estágios representam as etapas pelas quais os leads avançam. Comece criando uma coluna.</p>
        </div>
      );
    }

    return null;
  }, [boardLoading, initialLoading, pipelines.length, stages.length]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <UiCard>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <KanbanSquare className="h-5 w-5" />
              Funil de vendas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="pipeline-select">
                  Funil ativo
                </label>
                <Select
                  value={selectedPipelineId ?? ""}
                  onValueChange={(value) => setSelectedPipelineId(value || null)}
                  disabled={pipelines.length === 0}
                >
                  <SelectTrigger id="pipeline-select" className="w-full">
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
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="destructive" disabled={!selectedPipelineId} onClick={handleDeletePipeline}>
                  <Trash2 className="h-4 w-4" />
                  Excluir funil
                </Button>
              </div>
            </div>

            <form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end" onSubmit={handleUpdatePipeline}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="pipeline-name">
                  Renomear funil
                </label>
                <Input
                  id="pipeline-name"
                  value={editingPipelineName}
                  onChange={(event) => setEditingPipelineName(event.target.value)}
                  placeholder="Nome do funil"
                  disabled={!selectedPipelineId}
                />
              </div>
              <Button type="submit" disabled={!selectedPipelineId || !editingPipelineName.trim()}>
                <Save className="h-4 w-4" />
                Salvar alterações
              </Button>
            </form>

            <form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end" onSubmit={handleCreatePipeline}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="new-pipeline-name">
                  Criar novo funil
                </label>
                <Input
                  id="new-pipeline-name"
                  value={creatingPipelineName}
                  onChange={(event) => setCreatingPipelineName(event.target.value)}
                  placeholder="Nome do novo funil"
                />
              </div>
              <Button type="submit" disabled={!creatingPipelineName.trim() || !companyId}>
                <Plus className="h-4 w-4" />
                Adicionar funil
              </Button>
            </form>

            <form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end" onSubmit={handleCreateStage}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="new-stage-title">
                  Novo estágio
                </label>
                <Input
                  id="new-stage-title"
                  value={creatingStageTitle}
                  onChange={(event) => setCreatingStageTitle(event.target.value)}
                  placeholder="Nome do estágio"
                  disabled={!selectedPipelineId || creatingStageLoading}
                />
              </div>
              <Button
                type="submit"
                disabled={!selectedPipelineId || !creatingStageTitle.trim() || creatingStageLoading}
              >
                {creatingStageLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Adicionar estágio
              </Button>
            </form>
          </CardContent>
        </UiCard>
      </div>

      {emptyState ? (
        emptyState
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stages.map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                onRename={handleRenameStage}
                onDelete={handleDeleteStage}
                onCreateCard={handleCreateCard}
                onUpdateCard={handleUpdateCard}
                onDeleteCard={handleDeleteCard}
              />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}

interface StageColumnProps {
  stage: Stage;
  onRename: (stageId: string, title: string) => Promise<void> | void;
  onDelete: (stageId: string) => Promise<void> | void;
  onCreateCard: (
    stageId: string,
    payload: { title: string; description: string; value: string },
  ) => Promise<boolean> | boolean;
  onUpdateCard: (
    stageId: string,
    cardId: string,
    payload: { title: string; description: string; value: string },
  ) => Promise<boolean> | boolean;
  onDeleteCard: (stageId: string, cardId: string) => Promise<boolean> | boolean;
}

function StageColumn({ stage, onRename, onDelete, onCreateCard, onUpdateCard, onDeleteCard }: StageColumnProps) {
  const [isEditingStage, setIsEditingStage] = useState(false);
  const [stageTitle, setStageTitle] = useState(stage.title);
  const [cardFormOpen, setCardFormOpen] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [cardValue, setCardValue] = useState("");
  const [cardDescription, setCardDescription] = useState("");

  useEffect(() => {
    setStageTitle(stage.title);
  }, [stage.title]);

  const { setNodeRef } = useDroppable({
    id: stage.id,
    data: {
      type: "stage",
      stageId: stage.id,
    },
  });

  const handleSubmitStage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onRename(stage.id, stageTitle);
    setIsEditingStage(false);
  };

  const handleCreateCard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await onCreateCard(stage.id, {
      title: cardTitle,
      value: cardValue,
      description: cardDescription,
    });
    if (success) {
      setCardTitle("");
      setCardValue("");
      setCardDescription("");
      setCardFormOpen(false);
    }
  };

  return (
    <UiCard className="flex h-full flex-col">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          {isEditingStage ? (
            <form className="flex flex-1 items-center gap-2" onSubmit={handleSubmitStage}>
              <Input value={stageTitle} onChange={(event) => setStageTitle(event.target.value)} autoFocus />
              <Button type="submit" size="sm">
                <Save className="h-4 w-4" />
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setIsEditingStage(false)}>
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="flex flex-1 items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">{stage.title}</p>
                <p className="text-xs text-muted-foreground">{stage.cards.length} cartões</p>
              </div>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => setIsEditingStage(true)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    void onDelete(stage.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={() => setCardFormOpen((prev) => !prev)}>
          <Plus className="h-4 w-4" />
          {cardFormOpen ? "Cancelar" : "Novo cartão"}
        </Button>
        {cardFormOpen && (
          <form className="space-y-2" onSubmit={handleCreateCard}>
            <Input
              value={cardTitle}
              onChange={(event) => setCardTitle(event.target.value)}
              placeholder="Título do cartão"
            />
            <Input
              value={cardValue}
              onChange={(event) => setCardValue(event.target.value)}
              placeholder="Valor (opcional)"
            />
            <Textarea
              value={cardDescription}
              onChange={(event) => setCardDescription(event.target.value)}
              placeholder="Descrição"
              rows={3}
            />
            <Button type="submit" size="sm" disabled={!cardTitle.trim()}>
              <Save className="h-4 w-4" />
              Adicionar cartão
            </Button>
          </form>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div ref={setNodeRef} className="space-y-2">
          <SortableContext items={stage.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
            {stage.cards.map((card, index) => (
              <SortablePipelineCard
                key={card.id}
                card={card}
                index={index}
                stageId={stage.id}
                onUpdate={onUpdateCard}
                onDelete={onDeleteCard}
              />
            ))}
          </SortableContext>
        </div>
      </CardContent>
    </UiCard>
  );
}

interface SortablePipelineCardProps {
  card: KanbanCard;
  index: number;
  stageId: string;
  onUpdate: (
    stageId: string,
    cardId: string,
    payload: { title: string; description: string; value: string },
  ) => Promise<boolean> | boolean;
  onDelete: (stageId: string, cardId: string) => Promise<boolean> | boolean;
}

function SortablePipelineCard({ card, index, stageId, onUpdate, onDelete }: SortablePipelineCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [value, setValue] = useState(card.value != null ? String(card.value) : "");

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description ?? "");
    setValue(card.value != null ? String(card.value) : "");
  }, [card]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: {
      type: "card",
      stageId,
      index,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await onUpdate(stageId, card.id, { title, description, value });
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border bg-white p-3 shadow-sm"
      {...attributes}
      {...listeners}
    >
      {isEditing ? (
        <form className="space-y-2" onSubmit={handleSubmit}>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} autoFocus />
          <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Valor" />
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
          <div className="flex justify-end gap-2">
            <Button type="submit" size="sm">
              <Save className="h-4 w-4" />
              Salvar
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <p className="font-medium text-foreground">{card.title}</p>
              {card.value != null && (
                <p className="text-sm text-muted-foreground">Valor estimado: R$ {card.value.toFixed(2)}</p>
              )}
              {card.description && <p className="text-sm text-muted-foreground">{card.description}</p>}
            </div>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  void onDelete(stageId, card.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
