"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Pencil, Trash2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDroppable } from "@dnd-kit/core";

interface Card {
  id: string;
  title: string;
  company_name: string | null;
  value: number | null;
  status: string | null;
  priority: string | null;
  position: number;
  updated_at?: string;
  created_at?: string;
}

interface Stage {
  id: string;
  name: string;
  position: number;
  created_at?: string;
  cards: Card[];
}

interface Pipeline {
  id: string;
  name: string;
  created_at?: string;
  stages: Stage[];
}

interface CardFormValues {
  title: string;
  company_name: string;
  value: string;
  status: string;
  priority: string;
}

const defaultCardForm: CardFormValues = {
  title: "",
  company_name: "",
  value: "",
  status: "",
  priority: "",
};

function formatCurrency(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function KanbanCard({
  card,
  onEdit,
  onDelete,
  stageId,
}: {
  card: Card;
  stageId: string;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { stageId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-lg shadow-sm p-4 space-y-3 cursor-grab"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between">
        <div className="font-semibold text-sm leading-tight text-gray-900">{card.title}</div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(card)}
            className="text-gray-500 hover:text-gray-900"
            aria-label="Editar cartão"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(card.id)}
            className="text-gray-500 hover:text-red-600"
            aria-label="Excluir cartão"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Empresa</span>
          <span>{card.company_name || "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Valor</span>
          <span className="font-semibold text-gray-900">{formatCurrency(card.value)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Status</span>
          <span>{card.status || "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Prioridade</span>
          <span>{card.priority || "—"}</span>
        </div>
      </div>
    </div>
  );
}

function StageColumn({
  stage,
  onDeleteStage,
  onRenameStage,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
}: {
  stage: Stage;
  onDeleteStage: (stageId: string) => Promise<void>;
  onRenameStage: (stageId: string, name: string) => Promise<void>;
  onCreateCard: (stageId: string, data: CardFormValues) => Promise<void>;
  onUpdateCard: (cardId: string, data: CardFormValues) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
}) {
  const { setNodeRef } = useDroppable({ id: stage.id, data: { stageId: stage.id } });
  const [isRenaming, setIsRenaming] = useState(false);
  const [stageName, setStageName] = useState(stage.name);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [createForm, setCreateForm] = useState<CardFormValues>(defaultCardForm);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CardFormValues>(defaultCardForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStageName(stage.name);
  }, [stage.name]);

  const handleRename = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stageName.trim()) return;
    try {
      setSaving(true);
      await onRenameStage(stage.id, stageName.trim());
      setIsRenaming(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!createForm.title.trim()) return;
    try {
      setSaving(true);
      await onCreateCard(stage.id, createForm);
      setCreateForm({ ...defaultCardForm });
      setIsCreatingCard(false);
    } finally {
      setSaving(false);
    }
  };

  const startEditingCard = (card: Card) => {
    setEditingCardId(card.id);
    setEditForm({
      title: card.title,
      company_name: card.company_name ?? "",
      value: card.value != null ? String(card.value) : "",
      status: card.status ?? "",
      priority: card.priority ?? "",
    });
  };

  const handleUpdateCard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCardId || !editForm.title.trim()) return;
    try {
      setSaving(true);
      await onUpdateCard(editingCardId, editForm);
      setEditingCardId(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#F3F4F6] rounded-lg p-4 flex flex-col gap-4 min-w-[280px]">
      <div className="flex items-center justify-between gap-2">
        {isRenaming ? (
          <form onSubmit={handleRename} className="flex items-center gap-2 w-full">
            <Input
              value={stageName}
              onChange={(event) => setStageName(event.target.value)}
              className="h-9"
              autoFocus
            />
            <Button type="submit" size="sm" disabled={saving}>
              Salvar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsRenaming(false);
                setStageName(stage.name);
              }}
            >
              Cancelar
            </Button>
          </form>
        ) : (
          <>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{stage.name}</h3>
              <p className="text-xs text-gray-500">{stage.cards.length} oportunidades</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRenaming(true)}
                className="text-gray-500 hover:text-gray-900"
                aria-label="Renomear estágio"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  void onDeleteStage(stage.id);
                }}
                className="text-gray-500 hover:text-red-600"
                aria-label="Excluir estágio"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      <SortableContext items={stage.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-col gap-3 min-h-[100px]">
          {stage.cards.map((card) => (
            <div key={card.id} className="relative">
              {editingCardId === card.id ? (
                <form onSubmit={handleUpdateCard} className="bg-white border rounded-lg shadow-sm p-4 space-y-3">
                  <Input
                    value={editForm.title}
                    onChange={(event) => setEditForm((form) => ({ ...form, title: event.target.value }))}
                    placeholder="Título"
                    className="h-9"
                  />
                  <Input
                    value={editForm.company_name}
                    onChange={(event) =>
                      setEditForm((form) => ({ ...form, company_name: event.target.value }))
                    }
                    placeholder="Empresa"
                    className="h-9"
                  />
                  <Input
                    value={editForm.value}
                    onChange={(event) => setEditForm((form) => ({ ...form, value: event.target.value }))}
                    placeholder="Valor"
                    className="h-9"
                  />
                  <Input
                    value={editForm.status}
                    onChange={(event) => setEditForm((form) => ({ ...form, status: event.target.value }))}
                    placeholder="Status"
                    className="h-9"
                  />
                  <Input
                    value={editForm.priority}
                    onChange={(event) => setEditForm((form) => ({ ...form, priority: event.target.value }))}
                    placeholder="Prioridade"
                    className="h-9"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button type="submit" size="sm" disabled={saving}>
                      Salvar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCardId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <KanbanCard
                  card={card}
                  stageId={stage.id}
                  onEdit={startEditingCard}
                  onDelete={(cardId) => {
                    void onDeleteCard(cardId);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </SortableContext>

      {isCreatingCard ? (
        <form onSubmit={handleCreateCard} className="bg-white border rounded-lg shadow-sm p-4 space-y-3">
          <Input
            value={createForm.title}
            onChange={(event) => setCreateForm((form) => ({ ...form, title: event.target.value }))}
            placeholder="Título"
            className="h-9"
            autoFocus
          />
          <Input
            value={createForm.company_name}
            onChange={(event) => setCreateForm((form) => ({ ...form, company_name: event.target.value }))}
            placeholder="Empresa"
            className="h-9"
          />
          <Input
            value={createForm.value}
            onChange={(event) => setCreateForm((form) => ({ ...form, value: event.target.value }))}
            placeholder="Valor"
            className="h-9"
          />
          <Input
            value={createForm.status}
            onChange={(event) => setCreateForm((form) => ({ ...form, status: event.target.value }))}
            placeholder="Status"
            className="h-9"
          />
          <Input
            value={createForm.priority}
            onChange={(event) => setCreateForm((form) => ({ ...form, priority: event.target.value }))}
            placeholder="Prioridade"
            className="h-9"
          />
          <div className="flex items-center justify-end gap-2">
            <Button type="submit" size="sm" disabled={saving}>
              Criar cartão
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCreatingCard(false);
                setCreateForm({ ...defaultCardForm });
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed text-gray-600"
          onClick={() => setIsCreatingCard(true)}
        >
          <Plus size={16} className="mr-2" /> Nova oportunidade
        </Button>
      )}
    </div>
  );
}

export default function FunilDeVendasPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
  );

  const selectedPipeline = useMemo(
    () => pipelines.find((pipeline) => pipeline.id === selectedPipelineId) ?? null,
    [pipelines, selectedPipelineId],
  );

  const loadPipelines = useCallback(async (): Promise<Pipeline[]> => {
    let normalized: Pipeline[] = [];
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/pipelines");
      if (!response.ok) {
        throw new Error("Falha ao carregar os funis");
      }
      const payload = (await response.json()) as { pipelines: Pipeline[] };
      normalized = payload.pipelines.map((pipeline) => ({
        ...pipeline,
        stages: (pipeline.stages ?? [])
          .map((stage) => ({
            ...stage,
            cards: (stage.cards ?? []).slice().sort((a, b) => a.position - b.position),
          }))
          .sort((a, b) => a.position - b.position),
      }));

      setPipelines(normalized);
      if (normalized.length > 0) {
        setSelectedPipelineId((current) => current ?? normalized[0].id);
      } else {
        setSelectedPipelineId(null);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Não foi possível carregar o funil de vendas");
    } finally {
      setLoading(false);
    }
    return normalized;
  }, []);

  useEffect(() => {
    void loadPipelines();
  }, [loadPipelines]);

  const refreshAndPreserve = useCallback(async () => {
    const currentId = selectedPipelineId;
    const updated = await loadPipelines();
    if (currentId && updated.some((pipeline) => pipeline.id === currentId)) {
      setSelectedPipelineId(currentId);
    }
  }, [loadPipelines, selectedPipelineId]);

  const handleCreatePipeline = async () => {
    const name = window.prompt("Qual o nome do novo funil?");
    if (!name || !name.trim()) return;

    const response = await fetch("/api/pipelines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (!response.ok) {
      window.alert("Não foi possível criar o funil");
      return;
    }

    await loadPipelines();
  };

  const handleRenamePipeline = async (pipeline: Pipeline) => {
    const name = window.prompt("Novo nome do funil", pipeline.name);
    if (!name || !name.trim()) return;

    const response = await fetch(`/api/pipelines/${pipeline.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (!response.ok) {
      window.alert("Não foi possível atualizar o funil");
      return;
    }

    await refreshAndPreserve();
  };

  const handleDeletePipeline = async (pipeline: Pipeline) => {
    if (!window.confirm("Deseja remover este funil?")) return;

    const response = await fetch(`/api/pipelines/${pipeline.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      window.alert("Não foi possível remover o funil");
      return;
    }

    await loadPipelines();
  };

  const handleCreateStage = async () => {
    if (!selectedPipeline) return;
    const name = window.prompt("Nome do estágio");
    if (!name || !name.trim()) return;

    const response = await fetch(`/api/pipelines/${selectedPipeline.id}/stages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (!response.ok) {
      window.alert("Não foi possível criar o estágio");
      return;
    }

    await refreshAndPreserve();
  };

  const handleDeleteStage = async (stageId: string) => {
    if (!window.confirm("Deseja remover este estágio?")) return;

    const response = await fetch(`/api/stages/${stageId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      window.alert("Não foi possível remover o estágio");
      return;
    }

    await refreshAndPreserve();
  };

  const handleRenameStage = async (stageId: string, name: string) => {
    const response = await fetch(`/api/stages/${stageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      window.alert("Não foi possível atualizar o estágio");
      return;
    }

    await refreshAndPreserve();
  };

  const handleCreateCard = async (stageId: string, data: CardFormValues) => {
    const response = await fetch(`/api/stages/${stageId}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title.trim(),
        company_name: data.company_name.trim() || null,
        value: data.value.trim() ? Number(data.value) : null,
        status: data.status.trim() || null,
        priority: data.priority.trim() || null,
      }),
    });

    if (!response.ok) {
      window.alert("Não foi possível criar o cartão");
      return;
    }

    await refreshAndPreserve();
  };

  const handleUpdateCard = async (cardId: string, data: CardFormValues) => {
    const response = await fetch(`/api/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title.trim(),
        company_name: data.company_name.trim() || null,
        value: data.value.trim() ? Number(data.value) : null,
        status: data.status.trim() || null,
        priority: data.priority.trim() || null,
      }),
    });

    if (!response.ok) {
      window.alert("Não foi possível atualizar o cartão");
      return;
    }

    await refreshAndPreserve();
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm("Deseja remover esta oportunidade?")) return;

    const response = await fetch(`/api/cards/${cardId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      window.alert("Não foi possível remover o cartão");
      return;
    }

    await refreshAndPreserve();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!selectedPipeline) return;
    const { active, over } = event;
    if (!over) return;

    const activeCardId = String(active.id);
    const sourceStageId = active.data.current?.stageId as string | undefined;

    let destinationStageId: string | undefined;
    if (over.data.current?.stageId) {
      destinationStageId = over.data.current.stageId as string;
    } else {
      const destinationStage = selectedPipeline.stages.find((stage) =>
        stage.cards.some((card) => card.id === over.id)
      );
      destinationStageId = destinationStage?.id;
    }

    if (!sourceStageId || !destinationStageId) return;
    if (sourceStageId === destinationStageId && active.id === over.id) return;

    let stageOrdersPayload: { stageId: string; cardIds: string[] }[] | null = null;

    setPipelines((current) => {
      const draft = current.map((pipeline) => ({
        ...pipeline,
        stages: pipeline.stages.map((stage) => ({
          ...stage,
          cards: stage.cards.map((card) => ({ ...card })),
        })),
      }));
      const pipeline = draft.find((item) => item.id === selectedPipeline.id);
      if (!pipeline) return current;

      const sourceStage = pipeline.stages.find((stage) => stage.id === sourceStageId);
      const destinationStage = pipeline.stages.find((stage) => stage.id === destinationStageId);
      if (!sourceStage || !destinationStage) return current;

      const cardIndex = sourceStage.cards.findIndex((card) => card.id === activeCardId);
      if (cardIndex === -1) return current;
      const [movedCard] = sourceStage.cards.splice(cardIndex, 1);

      if (destinationStageId === sourceStageId) {
        const overIndex = destinationStage.cards.findIndex((card) => card.id === over.id);
        const targetIndex = overIndex >= 0 ? overIndex : destinationStage.cards.length;
        destinationStage.cards.splice(targetIndex, 0, movedCard);
      } else {
        const overIndex = destinationStage.cards.findIndex((card) => card.id === over.id);
        const targetIndex = overIndex >= 0 ? overIndex : destinationStage.cards.length;
        destinationStage.cards.splice(targetIndex, 0, { ...movedCard });
      }

      stageOrdersPayload = pipeline.stages.map((stage) => ({
        stageId: stage.id,
        cardIds: stage.cards.map((card) => card.id),
      }));

      return draft;
    });

    if (!stageOrdersPayload) return;

    const response = await fetch(`/api/cards/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pipelineId: selectedPipeline.id,
        stageOrders: stageOrdersPayload,
      }),
    });

    if (!response.ok) {
      console.error("Não foi possível salvar a nova ordem dos cartões");
      await refreshAndPreserve();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <RefreshCcw className="animate-spin h-6 w-6 text-gray-500" />
        <p>Carregando funil de vendas...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <p className="text-gray-700">{errorMessage}</p>
        <Button onClick={() => loadPipelines()}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Funil de vendas</h1>
          <p className="text-sm text-gray-600 max-w-2xl">
            Organize suas oportunidades em um quadro Kanban, acompanhe cada etapa do processo comercial e
            distribua atividades entre a equipe com facilidade.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCreatePipeline}>
            <Plus size={16} className="mr-2" /> Novo funil
          </Button>
          {selectedPipeline ? (
            <>
              <Button variant="outline" onClick={() => handleRenamePipeline(selectedPipeline)}>
                Renomear funil
              </Button>
              <Button variant="outline" onClick={() => handleDeletePipeline(selectedPipeline)}>
                Excluir funil
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {pipelines.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="sm:w-64">
              <Select
                value={selectedPipelineId ?? undefined}
                onValueChange={(value) => setSelectedPipelineId(value)}
              >
                <SelectTrigger>
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
            <Button variant="outline" onClick={handleCreateStage} disabled={!selectedPipeline}>
              <Plus size={16} className="mr-2" /> Novo estágio
            </Button>
          </div>

          {selectedPipeline ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={(event) => {
                void handleDragEnd(event);
              }}
            >
              <div className="flex gap-4 overflow-x-auto pb-4">
                {selectedPipeline.stages.length > 0 ? (
                  selectedPipeline.stages.map((stage) => (
                    <StageColumn
                      key={stage.id}
                      stage={stage}
                      onDeleteStage={handleDeleteStage}
                      onRenameStage={handleRenameStage}
                      onCreateCard={handleCreateCard}
                      onUpdateCard={handleUpdateCard}
                      onDeleteCard={handleDeleteCard}
                    />
                  ))
                ) : (
                  <div className="text-sm text-gray-600 py-12 px-6 border border-dashed rounded-lg bg-white">
                    Adicione o primeiro estágio para começar a organizar o funil.
                  </div>
                )}
              </div>
            </DndContext>
          ) : (
            <div className="text-sm text-gray-600 py-12 px-6 border border-dashed rounded-lg bg-white">
              Crie ou selecione um funil para visualizar o quadro.
            </div>
          )}
        </div>
      ) : (
        <div className="border border-dashed rounded-xl bg-white p-10 text-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Comece criando seu primeiro funil</h2>
          <p className="text-sm text-gray-600">
            Monte as etapas do processo comercial, arraste e solte oportunidades e mantenha toda a equipe alinhada.
          </p>
          <Button onClick={handleCreatePipeline}>
            <Plus size={16} className="mr-2" /> Criar funil
          </Button>
        </div>
      )}
    </div>
  );
}
