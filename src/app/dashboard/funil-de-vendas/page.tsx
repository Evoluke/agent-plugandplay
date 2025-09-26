'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { supabasebrowser } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/components/ui/utils';
import { toast } from 'sonner';
import {
  KanbanSquare,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  GripVertical,
  Mail,
  User,
  CircleDollarSign,
} from 'lucide-react';

interface UserProfile {
  id: string;
}

interface Company {
  id: number;
  company_name: string | null;
}

interface Pipeline {
  id: string;
  company_id: number;
  name: string;
  description: string | null;
  created_at: string;
}

interface Stage {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  created_at: string;
}

interface CardItem {
  id: string;
  pipeline_id: string;
  stage_id: string;
  title: string;
  description: string | null;
  value: number | null;
  contact_name: string | null;
  contact_email: string | null;
  order_index: number;
  created_at: string;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

type PipelineDialogMode = 'create' | 'edit';
type StageDialogMode = 'create' | 'edit';
type CardDialogMode = 'create' | 'edit';

export default function FunilDeVendasPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [cardsByStage, setCardsByStage] = useState<Record<string, CardItem[]>>({});
  const [loadingPipelines, setLoadingPipelines] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(false);

  const [pipelineDialogOpen, setPipelineDialogOpen] = useState(false);
  const [pipelineDialogMode, setPipelineDialogMode] = useState<PipelineDialogMode>('create');
  const [pipelineDraft, setPipelineDraft] = useState({ name: '', description: '' });
  const [savingPipeline, setSavingPipeline] = useState(false);
  const [pipelineToDelete, setPipelineToDelete] = useState<Pipeline | null>(null);
  const [confirmDeletePipelineOpen, setConfirmDeletePipelineOpen] = useState(false);

  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [stageDialogMode, setStageDialogMode] = useState<StageDialogMode>('create');
  const [stageDraft, setStageDraft] = useState({ id: '', name: '' });
  const [savingStage, setSavingStage] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<Stage | null>(null);
  const [confirmDeleteStageOpen, setConfirmDeleteStageOpen] = useState(false);

  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [cardDialogMode, setCardDialogMode] = useState<CardDialogMode>('create');
  const [cardDraft, setCardDraft] = useState({
    id: '',
    stageId: '',
    title: '',
    description: '',
    value: '',
    contactName: '',
    contactEmail: '',
  });
  const [savingCard, setSavingCard] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<CardItem | null>(null);
  const [confirmDeleteCardOpen, setConfirmDeleteCardOpen] = useState(false);

  useEffect(() => {
    supabasebrowser.auth
      .getUser()
      .then(({ data, error }) => {
        if (error || !data?.user) {
          toast.error('Não foi possível carregar o usuário autenticado.');
          return;
        }
        setUser(data.user);
      })
      .catch(() => {
        toast.error('Não foi possível carregar o usuário autenticado.');
      });
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    supabasebrowser
      .from('company')
      .select('id, company_name')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          toast.error('Não foi possível localizar sua empresa.');
          return;
        }
        setCompany(data);
      })
      .catch(() => {
        toast.error('Não foi possível localizar sua empresa.');
      });
  }, [user?.id]);

  useEffect(() => {
    if (!company?.id) return;
    setLoadingPipelines(true);

    supabasebrowser
      .from('pipeline')
      .select('id, company_id, name, description, created_at')
      .eq('company_id', company.id)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          toast.error('Não foi possível carregar os funis de vendas.');
          setPipelines([]);
          setSelectedPipelineId(null);
          return;
        }
        const pipelinesList = (data ?? []) as Pipeline[];
        setPipelines(pipelinesList);
        if (pipelinesList.length) {
          setSelectedPipelineId((current) => {
            if (current && pipelinesList.some((pipeline) => pipeline.id === current)) {
              return current;
            }
            return pipelinesList[0]?.id ?? null;
          });
        } else {
          setSelectedPipelineId(null);
        }
      })
      .finally(() => {
        setLoadingPipelines(false);
      });
  }, [company?.id]);

  useEffect(() => {
    if (!selectedPipelineId) {
      setStages([]);
      setCardsByStage({});
      return;
    }

    setLoadingBoard(true);
    const loadPipelineDetails = async () => {
      const [{ data: stageData, error: stageError }, { data: cardData, error: cardError }] = await Promise.all([
        supabasebrowser
          .from('stage')
          .select('id, pipeline_id, name, position, created_at')
          .eq('pipeline_id', selectedPipelineId)
          .order('position', { ascending: true }),
        supabasebrowser
          .from('card')
          .select(
            'id, pipeline_id, stage_id, title, description, value, contact_name, contact_email, order_index, created_at'
          )
          .eq('pipeline_id', selectedPipelineId)
          .order('order_index', { ascending: true }),
      ]);

      if (stageError) {
        toast.error('Não foi possível carregar os estágios do funil.');
      }
      if (cardError) {
        toast.error('Não foi possível carregar as oportunidades do funil.');
      }

      const stagesList = (stageData ?? []) as Stage[];
      const cardsList = (cardData ?? []) as CardItem[];

      const groupedCards = stagesList.reduce((acc, stage) => {
        acc[stage.id] = [];
        return acc;
      }, {} as Record<string, CardItem[]>);

      cardsList.forEach((card) => {
        if (!groupedCards[card.stage_id]) {
          groupedCards[card.stage_id] = [];
        }
        groupedCards[card.stage_id].push(card);
      });

      setStages(stagesList);
      setCardsByStage(groupedCards);
      setLoadingBoard(false);
    };

    loadPipelineDetails().catch(() => {
      toast.error('Erro inesperado ao carregar o funil selecionado.');
      setLoadingBoard(false);
    });
  }, [selectedPipelineId]);

  const selectedPipeline = useMemo(
    () => pipelines.find((pipeline) => pipeline.id === selectedPipelineId) ?? null,
    [pipelines, selectedPipelineId]
  );

  const openCreatePipeline = () => {
    setPipelineDialogMode('create');
    setPipelineDraft({ name: '', description: '' });
    setPipelineDialogOpen(true);
  };

  const openEditPipeline = () => {
    if (!selectedPipeline) return;
    setPipelineDialogMode('edit');
    setPipelineDraft({
      name: selectedPipeline.name,
      description: selectedPipeline.description ?? '',
    });
    setPipelineDialogOpen(true);
  };

  const handleSubmitPipeline = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!company?.id) return;

    const name = pipelineDraft.name.trim();
    const description = pipelineDraft.description.trim();

    if (!name) {
      toast.error('Informe um nome para o funil.');
      return;
    }

    setSavingPipeline(true);

    try {
      if (pipelineDialogMode === 'create') {
        const { data, error } = await supabasebrowser
          .from('pipeline')
          .insert({
            name,
            description: description || null,
            company_id: company.id,
          })
          .select()
          .single();

        if (error || !data) {
          throw error;
        }

        const newPipeline = data as Pipeline;
        setPipelines((prev) => [...prev, newPipeline]);
        setSelectedPipelineId(newPipeline.id);
        toast.success('Funil criado com sucesso.');
      } else if (selectedPipeline) {
        const { data, error } = await supabasebrowser
          .from('pipeline')
          .update({
            name,
            description: description || null,
          })
          .eq('id', selectedPipeline.id)
          .select()
          .single();

        if (error || !data) {
          throw error;
        }

        const updatedPipeline = data as Pipeline;
        setPipelines((prev) =>
          prev.map((pipeline) => (pipeline.id === updatedPipeline.id ? updatedPipeline : pipeline))
        );
        toast.success('Funil atualizado com sucesso.');
      }
      setPipelineDialogOpen(false);
    } catch (error) {
      console.error('[pipeline:submit]', error);
      toast.error('Não foi possível salvar o funil.');
    } finally {
      setSavingPipeline(false);
    }
  };

  const openDeletePipelineDialog = () => {
    if (!selectedPipeline) return;
    setPipelineToDelete(selectedPipeline);
    setConfirmDeletePipelineOpen(true);
  };

  const handleDeletePipeline = async () => {
    if (!pipelineToDelete) return;

    try {
      const { error } = await supabasebrowser
        .from('pipeline')
        .delete()
        .eq('id', pipelineToDelete.id);

      if (error) {
        throw error;
      }

      setPipelines((prev) => prev.filter((pipeline) => pipeline.id !== pipelineToDelete.id));
      setConfirmDeletePipelineOpen(false);
      setPipelineToDelete(null);

      setSelectedPipelineId((current) => {
        if (current === pipelineToDelete.id) {
          const remaining = pipelines.filter((pipeline) => pipeline.id !== pipelineToDelete.id);
          return remaining[0]?.id ?? null;
        }
        return current;
      });

      toast.success('Funil excluído com sucesso.');
    } catch (error) {
      console.error('[pipeline:delete]', error);
      toast.error('Não foi possível excluir o funil.');
    }
  };

  const openCreateStage = () => {
    setStageDialogMode('create');
    setStageDraft({ id: '', name: '' });
    setStageDialogOpen(true);
  };

  const openEditStage = (stage: Stage) => {
    setStageDialogMode('edit');
    setStageDraft({ id: stage.id, name: stage.name });
    setStageDialogOpen(true);
  };

  const handleSubmitStage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPipelineId) return;

    const name = stageDraft.name.trim();
    if (!name) {
      toast.error('Informe um nome para o estágio.');
      return;
    }

    setSavingStage(true);

    try {
      if (stageDialogMode === 'create') {
        const position = stages.length;
        const { data, error } = await supabasebrowser
          .from('stage')
          .insert({
            name,
            pipeline_id: selectedPipelineId,
            position,
          })
          .select()
          .single();

        if (error || !data) {
          throw error;
        }

        const newStage = data as Stage;
        setStages((prev) => [...prev, newStage]);
        setCardsByStage((prev) => ({ ...prev, [newStage.id]: [] }));
        toast.success('Estágio criado com sucesso.');
      } else if (stageDialogMode === 'edit') {
        const { data, error } = await supabasebrowser
          .from('stage')
          .update({ name })
          .eq('id', stageDraft.id)
          .select()
          .single();

        if (error || !data) {
          throw error;
        }

        const updatedStage = data as Stage;
        setStages((prev) =>
          prev.map((stage) => (stage.id === updatedStage.id ? updatedStage : stage))
        );
        toast.success('Estágio atualizado com sucesso.');
      }
      setStageDialogOpen(false);
    } catch (error) {
      console.error('[stage:submit]', error);
      toast.error('Não foi possível salvar o estágio.');
    } finally {
      setSavingStage(false);
    }
  };

  const openDeleteStageDialog = (stage: Stage) => {
    setStageToDelete(stage);
    setConfirmDeleteStageOpen(true);
  };

  const handleDeleteStage = async () => {
    if (!stageToDelete) return;

    try {
      const { error } = await supabasebrowser
        .from('stage')
        .delete()
        .eq('id', stageToDelete.id);

      if (error) {
        throw error;
      }

      const remainingStages = stages
        .filter((stage) => stage.id !== stageToDelete.id)
        .map((stage, index) => ({ ...stage, position: index }));

      setStages(remainingStages);
      setCardsByStage((prev) => {
        const updated = { ...prev };
        delete updated[stageToDelete.id];
        return updated;
      });

      await Promise.all(
        remainingStages.map((stage, index) =>
          supabasebrowser.from('stage').update({ position: index }).eq('id', stage.id)
        )
      );

      setConfirmDeleteStageOpen(false);
      setStageToDelete(null);
      toast.success('Estágio excluído com sucesso.');
    } catch (error) {
      console.error('[stage:delete]', error);
      toast.error('Não foi possível excluir o estágio.');
    }
  };

  const openCreateCard = (stageId: string) => {
    setCardDialogMode('create');
    setCardDraft({
      id: '',
      stageId,
      title: '',
      description: '',
      value: '',
      contactName: '',
      contactEmail: '',
    });
    setCardDialogOpen(true);
  };

  const openEditCard = (stageId: string, card: CardItem) => {
    setCardDialogMode('edit');
    setCardDraft({
      id: card.id,
      stageId,
      title: card.title,
      description: card.description ?? '',
      value: card.value !== null ? String(card.value) : '',
      contactName: card.contact_name ?? '',
      contactEmail: card.contact_email ?? '',
    });
    setCardDialogOpen(true);
  };

  const handleSubmitCard = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPipelineId || !cardDraft.stageId) return;

    const title = cardDraft.title.trim();
    const description = cardDraft.description.trim();
    const contactName = cardDraft.contactName.trim();
    const contactEmail = cardDraft.contactEmail.trim();
    const value = cardDraft.value ? Number(cardDraft.value) : null;

    if (!title) {
      toast.error('Informe um título para a oportunidade.');
      return;
    }

    setSavingCard(true);

    try {
      if (cardDialogMode === 'create') {
        const orderIndex = cardsByStage[cardDraft.stageId]?.length ?? 0;
        const { data, error } = await supabasebrowser
          .from('card')
          .insert({
            pipeline_id: selectedPipelineId,
            stage_id: cardDraft.stageId,
            title,
            description: description || null,
            value,
            contact_name: contactName || null,
            contact_email: contactEmail || null,
            order_index: orderIndex,
          })
          .select()
          .single();

        if (error || !data) {
          throw error;
        }

        const newCard = data as CardItem;
        setCardsByStage((prev) => ({
          ...prev,
          [cardDraft.stageId]: [...(prev[cardDraft.stageId] ?? []), newCard],
        }));
        toast.success('Oportunidade criada com sucesso.');
      } else {
        const { data, error } = await supabasebrowser
          .from('card')
          .update({
            title,
            description: description || null,
            value,
            contact_name: contactName || null,
            contact_email: contactEmail || null,
          })
          .eq('id', cardDraft.id)
          .select()
          .single();

        if (error || !data) {
          throw error;
        }

        const updatedCard = data as CardItem;
        setCardsByStage((prev) => ({
          ...prev,
          [cardDraft.stageId]: (prev[cardDraft.stageId] ?? []).map((card) =>
            card.id === updatedCard.id ? updatedCard : card
          ),
        }));
        toast.success('Oportunidade atualizada com sucesso.');
      }
      setCardDialogOpen(false);
    } catch (error) {
      console.error('[card:submit]', error);
      toast.error('Não foi possível salvar a oportunidade.');
    } finally {
      setSavingCard(false);
    }
  };

  const openDeleteCardDialog = (card: CardItem) => {
    setCardToDelete(card);
    setConfirmDeleteCardOpen(true);
  };

  const handleDeleteCard = async () => {
    if (!cardToDelete) return;

    try {
      const { error } = await supabasebrowser.from('card').delete().eq('id', cardToDelete.id);

      if (error) {
        throw error;
      }

      const remainingCards = (cardsByStage[cardToDelete.stage_id] ?? []).filter(
        (card) => card.id !== cardToDelete.id
      );
      const reordered = remainingCards.map((card, index) => ({ ...card, order_index: index }));

      setCardsByStage((prev) => ({
        ...prev,
        [cardToDelete.stage_id]: reordered,
      }));

      if (reordered.length) {
        await Promise.all(
          reordered.map((card) =>
            supabasebrowser.from('card').update({ order_index: card.order_index }).eq('id', card.id)
          )
        );
      }

      setConfirmDeleteCardOpen(false);
      setCardToDelete(null);
      toast.success('Oportunidade excluída com sucesso.');
    } catch (error) {
      console.error('[card:delete]', error);
      toast.error('Não foi possível excluir a oportunidade.');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;
    if (!destination) return;

    if (type === 'stage') {
      if (destination.index === source.index) return;
      const reorderedStages = Array.from(stages);
      const [movedStage] = reorderedStages.splice(source.index, 1);
      reorderedStages.splice(destination.index, 0, movedStage);

      const updated = reorderedStages.map((stage, index) => ({ ...stage, position: index }));
      setStages(updated);

      try {
        await Promise.all(
          updated.map((stage) =>
            supabasebrowser.from('stage').update({ position: stage.position }).eq('id', stage.id)
          )
        );
      } catch (error) {
        console.error('[stage:reorder]', error);
        toast.error('Não foi possível reordenar os estágios.');
      }
      return;
    }

    const sourceStageId = source.droppableId;
    const destinationStageId = destination.droppableId;

    if (sourceStageId === destinationStageId && destination.index === source.index) {
      return;
    }

    const sourceCards = Array.from(cardsByStage[sourceStageId] ?? []);
    const [movedCard] = sourceCards.splice(source.index, 1);
    if (!movedCard) return;

    if (sourceStageId === destinationStageId) {
      sourceCards.splice(destination.index, 0, movedCard);
      const updatedStageCards = sourceCards.map((card, index) => ({ ...card, order_index: index }));
      setCardsByStage((prev) => ({ ...prev, [sourceStageId]: updatedStageCards }));

      try {
        await Promise.all(
          updatedStageCards.map((card) =>
            supabasebrowser.from('card').update({ order_index: card.order_index }).eq('id', card.id)
          )
        );
      } catch (error) {
        console.error('[card:reorder]', error);
        toast.error('Não foi possível reordenar as oportunidades.');
      }
      return;
    }

    const destinationCards = Array.from(cardsByStage[destinationStageId] ?? []);
    const movedCardWithStage: CardItem = {
      ...movedCard,
      stage_id: destinationStageId,
    };
    destinationCards.splice(destination.index, 0, movedCardWithStage);

    const updatedSourceCards = sourceCards.map((card, index) => ({ ...card, order_index: index }));
    const updatedDestinationCards = destinationCards.map((card, index) => ({
      ...card,
      order_index: index,
      stage_id: destinationStageId,
    }));

    setCardsByStage((prev) => ({
      ...prev,
      [sourceStageId]: updatedSourceCards,
      [destinationStageId]: updatedDestinationCards,
    }));

    try {
      await Promise.all([
        ...updatedSourceCards.map((card) =>
          supabasebrowser.from('card').update({ order_index: card.order_index }).eq('id', card.id)
        ),
        ...updatedDestinationCards.map((card) =>
          supabasebrowser
            .from('card')
            .update({ stage_id: destinationStageId, order_index: card.order_index })
            .eq('id', card.id)
        ),
      ]);
    } catch (error) {
      console.error('[card:move]', error);
      toast.error('Não foi possível mover a oportunidade.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2F6F68]/10 text-[#2F6F68]">
            <KanbanSquare className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Funil de vendas</h1>
            <p className="text-sm text-gray-600">
              Organize oportunidades em um quadro kanban com estágios personalizados.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={openCreatePipeline}>
            <Plus className="h-4 w-4" /> Novo funil
          </Button>
          {selectedPipeline && (
            <>
              <Button variant="outline" onClick={openEditPipeline}>
                <Pencil className="h-4 w-4" /> Editar funil
              </Button>
              <Button variant="destructive" onClick={openDeletePipelineDialog}>
                <Trash2 className="h-4 w-4" /> Excluir funil
              </Button>
            </>
          )}
        </div>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Funil selecionado</span>
            {loadingPipelines ? (
              <div className="flex h-10 items-center text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando funis...
              </div>
            ) : pipelines.length ? (
              <Select
                value={selectedPipelineId ?? ''}
                onValueChange={(value) => setSelectedPipelineId(value)}
              >
                <SelectTrigger className="w-72 border-gray-200">
                  <SelectValue placeholder="Escolha um funil" />
                </SelectTrigger>
                <SelectContent>
                  {pipelines.map((pipeline) => (
                    <SelectItem key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-500">
                Nenhum funil cadastrado. Crie um novo para começar a organizar suas oportunidades.
              </p>
            )}
          </div>
          {selectedPipeline?.description && (
            <p className="max-w-xl text-sm text-gray-600">{selectedPipeline.description}</p>
          )}
        </div>
      </section>

      {loadingBoard ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-[#97B7B4] bg-[#F5F8F7]">
          <div className="flex flex-col items-center gap-2 text-[#2F6F68]">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm font-medium">Carregando quadro kanban...</span>
          </div>
        </div>
      ) : !selectedPipelineId ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#97B7B4] bg-[#F5F8F7] text-center">
          <h2 className="text-lg font-semibold text-gray-800">Crie um funil para começar</h2>
          <p className="max-w-md text-sm text-gray-600">
            Estruture seu processo comercial em etapas e acompanhe negociações de forma visual, arrastando e soltando cartões entre os estágios.
          </p>
          <Button onClick={openCreatePipeline}>
            <Plus className="mr-2 h-4 w-4" /> Criar funil de vendas
          </Button>
        </div>
      ) : (
        <section className="rounded-xl border border-[#E1EAE9] bg-[#F2F7F6] p-4">
          {stages.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[#97B7B4] bg-white/60 text-center">
              <h3 className="text-base font-medium text-gray-800">Nenhum estágio cadastrado</h3>
              <p className="max-w-md text-sm text-gray-600">
                Crie os estágios do seu funil para organizar oportunidades conforme avançam nas negociações.
              </p>
              <Button onClick={openCreateStage}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar estágio
              </Button>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="pipeline-board" type="stage" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex min-h-[280px] gap-4 overflow-x-auto pb-2"
                  >
                    {stages.map((stage, index) => (
                      <Draggable key={stage.id} draggableId={stage.id} index={index}>
                        {(stageProvided) => (
                          <div
                            ref={stageProvided.innerRef}
                            {...stageProvided.draggableProps}
                            className="flex w-[280px] flex-shrink-0 flex-col rounded-lg border border-[#D5E2E0] bg-white p-3 shadow-sm"
                          >
                            <div className="mb-3 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span
                                  {...stageProvided.dragHandleProps}
                                  className="text-gray-400 hover:text-gray-600"
                                  aria-label="Reordenar estágio"
                                >
                                  <GripVertical className="h-4 w-4" />
                                </span>
                                <h3 className="text-sm font-semibold text-gray-800">{stage.name}</h3>
                                <span className="rounded-full bg-[#EAF1F0] px-2 py-0.5 text-xs font-medium text-[#2F6F68]">
                                  {(cardsByStage[stage.id] ?? []).length}
                                </span>
                              </div>
                              <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                  <button
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                    type="button"
                                    aria-label="Ações do estágio"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                  <DropdownMenu.Content className="min-w-[160px] rounded-md border border-gray-200 bg-white p-1 text-sm shadow-md">
                                    <DropdownMenu.Item
                                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-gray-700 hover:bg-gray-100"
                                      onSelect={(event) => {
                                        event.preventDefault();
                                        openEditStage(stage);
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" /> Renomear estágio
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-destructive hover:bg-destructive/10"
                                      onSelect={(event) => {
                                        event.preventDefault();
                                        openDeleteStageDialog(stage);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" /> Excluir estágio
                                    </DropdownMenu.Item>
                                  </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                              </DropdownMenu.Root>
                            </div>
                            <Droppable droppableId={stage.id} type="card">
                              {(cardProvided, snapshot) => (
                                <div
                                  ref={cardProvided.innerRef}
                                  {...cardProvided.droppableProps}
                                  className={cn(
                                    'flex flex-1 flex-col gap-3 rounded-md bg-gray-50 p-1 transition-colors',
                                    snapshot.isDraggingOver ? 'bg-[#E0EFEC]' : 'bg-gray-50'
                                  )}
                                >
                                  {(cardsByStage[stage.id] ?? []).map((card, cardIndex) => (
                                    <Draggable key={card.id} draggableId={card.id} index={cardIndex}>
                                      {(cardProvidedDrag) => (
                                        <div
                                          ref={cardProvidedDrag.innerRef}
                                          {...cardProvidedDrag.draggableProps}
                                          {...cardProvidedDrag.dragHandleProps}
                                          className="group flex flex-col gap-2 rounded-lg border border-[#DDE7E5] bg-white p-3 shadow-sm hover:border-[#2F6F68]/40"
                                        >
                                          <div className="flex items-start justify-between gap-2">
                                            <div>
                                              <h4 className="text-sm font-semibold text-gray-800">{card.title}</h4>
                                              {card.description && (
                                                <p className="text-xs text-gray-600">{card.description}</p>
                                              )}
                                            </div>
                                            <DropdownMenu.Root>
                                              <DropdownMenu.Trigger asChild>
                                                <button
                                                  className="opacity-0 transition group-hover:opacity-100"
                                                  type="button"
                                                  aria-label="Ações da oportunidade"
                                                >
                                                  <MoreHorizontal className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                                </button>
                                              </DropdownMenu.Trigger>
                                              <DropdownMenu.Portal>
                                                <DropdownMenu.Content className="min-w-[160px] rounded-md border border-gray-200 bg-white p-1 text-sm shadow-md">
                                                  <DropdownMenu.Item
                                                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-gray-700 hover:bg-gray-100"
                                                    onSelect={(event) => {
                                                      event.preventDefault();
                                                      openEditCard(stage.id, card);
                                                    }}
                                                  >
                                                    <Pencil className="h-4 w-4" /> Editar oportunidade
                                                  </DropdownMenu.Item>
                                                  <DropdownMenu.Item
                                                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-destructive hover:bg-destructive/10"
                                                    onSelect={(event) => {
                                                      event.preventDefault();
                                                      openDeleteCardDialog(card);
                                                    }}
                                                  >
                                                    <Trash2 className="h-4 w-4" /> Excluir oportunidade
                                                  </DropdownMenu.Item>
                                                </DropdownMenu.Content>
                                              </DropdownMenu.Portal>
                                            </DropdownMenu.Root>
                                          </div>
                                          <div className="flex flex-col gap-2 text-xs text-gray-500">
                                            {card.value !== null && (
                                              <div className="flex items-center gap-1 text-[#2F6F68]">
                                                <CircleDollarSign className="h-3.5 w-3.5" />
                                                <span className="font-medium">
                                                  {currencyFormatter.format(Number(card.value))}
                                                </span>
                                              </div>
                                            )}
                                            {card.contact_name && (
                                              <div className="flex items-center gap-1">
                                                <User className="h-3.5 w-3.5" />
                                                <span>{card.contact_name}</span>
                                              </div>
                                            )}
                                            {card.contact_email && (
                                              <div className="flex items-center gap-1">
                                                <Mail className="h-3.5 w-3.5" />
                                                <span>{card.contact_email}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {cardProvided.placeholder}
                                </div>
                              )}
                            </Droppable>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-3 w-full justify-center text-[#2F6F68] hover:bg-[#E0EFEC]"
                              onClick={() => openCreateCard(stage.id)}
                            >
                              <Plus className="mr-2 h-4 w-4" /> Nova oportunidade
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <button
                      type="button"
                      onClick={openCreateStage}
                      className="flex h-full min-h-[260px] w-[260px] flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-[#97B7B4] bg-[#F7FAF9] text-sm font-medium text-[#2F6F68] hover:border-[#2F6F68] hover:text-[#255852]"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Adicionar estágio
                    </button>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </section>
      )}

      <Dialog.Root open={pipelineDialogOpen} onOpenChange={setPipelineDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {pipelineDialogMode === 'create' ? 'Criar funil de vendas' : 'Editar funil de vendas'}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-gray-600">
              Defina um nome e uma descrição para facilitar a identificação do processo comercial.
            </Dialog.Description>
            <form className="mt-4 space-y-4" onSubmit={handleSubmitPipeline}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="pipeline-name">
                  Nome do funil
                </label>
                <Input
                  id="pipeline-name"
                  value={pipelineDraft.name}
                  onChange={(event) => setPipelineDraft((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Ex.: Novo negócio"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="pipeline-description">
                  Descrição (opcional)
                </label>
                <Textarea
                  id="pipeline-description"
                  value={pipelineDraft.description}
                  onChange={(event) =>
                    setPipelineDraft((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Explique o objetivo ou o contexto deste funil"
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setPipelineDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={savingPipeline}>
                  {savingPipeline ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {pipelineDialogMode === 'create' ? 'Criar funil' : 'Salvar alterações'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={confirmDeletePipelineOpen} onOpenChange={setConfirmDeletePipelineOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Excluir funil de vendas
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-gray-600">
              Esta ação removerá o funil e todos os estágios e oportunidades associados. Deseja continuar?
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDeletePipelineOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeletePipeline}>
                Excluir funil
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={stageDialogOpen} onOpenChange={setStageDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {stageDialogMode === 'create' ? 'Adicionar estágio' : 'Renomear estágio'}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-gray-600">
              Nomeie o estágio conforme o momento da negociação (ex.: Contato inicial, Proposta enviada).
            </Dialog.Description>
            <form className="mt-4 space-y-4" onSubmit={handleSubmitStage}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="stage-name">
                  Nome do estágio
                </label>
                <Input
                  id="stage-name"
                  value={stageDraft.name}
                  onChange={(event) => setStageDraft((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Ex.: Em negociação"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setStageDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={savingStage}>
                  {savingStage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {stageDialogMode === 'create' ? 'Adicionar estágio' : 'Salvar alterações'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={confirmDeleteStageOpen} onOpenChange={setConfirmDeleteStageOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Excluir estágio
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-gray-600">
              Os cartões do estágio também serão removidos. Confirme se deseja prosseguir.
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDeleteStageOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteStage}>
                Excluir estágio
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {cardDialogMode === 'create' ? 'Nova oportunidade' : 'Editar oportunidade'}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-gray-600">
              Registre informações essenciais para acompanhar o avanço do contato neste estágio.
            </Dialog.Description>
            <form className="mt-4 space-y-4" onSubmit={handleSubmitCard}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="card-title">
                  Título
                </label>
                <Input
                  id="card-title"
                  value={cardDraft.title}
                  onChange={(event) => setCardDraft((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Ex.: Proposta para Empresa X"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="card-description">
                  Observações
                </label>
                <Textarea
                  id="card-description"
                  value={cardDraft.description}
                  onChange={(event) =>
                    setCardDraft((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Detalhes relevantes, próximos passos ou objeções levantadas"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="card-value">
                    Valor potencial (R$)
                  </label>
                  <Input
                    id="card-value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={cardDraft.value}
                    onChange={(event) => setCardDraft((prev) => ({ ...prev, value: event.target.value }))}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="card-contact-name">
                    Nome do contato
                  </label>
                  <Input
                    id="card-contact-name"
                    value={cardDraft.contactName}
                    onChange={(event) => setCardDraft((prev) => ({ ...prev, contactName: event.target.value }))}
                    placeholder="Pessoa responsável pela negociação"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="card-contact-email">
                    E-mail do contato
                  </label>
                  <Input
                    id="card-contact-email"
                    type="email"
                    value={cardDraft.contactEmail}
                    onChange={(event) => setCardDraft((prev) => ({ ...prev, contactEmail: event.target.value }))}
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setCardDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={savingCard}>
                  {savingCard ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {cardDialogMode === 'create' ? 'Adicionar oportunidade' : 'Salvar alterações'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={confirmDeleteCardOpen} onOpenChange={setConfirmDeleteCardOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Excluir oportunidade
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-gray-600">
              Esta ação não pode ser desfeita. Confirme se deseja remover a oportunidade do funil.
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDeleteCardOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteCard}>
                Excluir oportunidade
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

