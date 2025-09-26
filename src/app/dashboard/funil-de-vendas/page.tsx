'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { supabasebrowser } from '@/lib/supabaseClient'
import { Filter, Loader2, MoreHorizontal, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { CardDialog } from './components/card-dialog'
import { PipelineDialog } from './components/pipeline-dialog'
import { StageColumn } from './components/stage-column'
import {
  createEmptyStage,
  createInitialCardForm,
  createInitialPipelineForm,
  fromInputDate,
  reindexStages,
  toInputDate,
} from './helpers'
import {
  CardFormState,
  Company,
  DealCard,
  Pipeline,
  PipelineFormState,
  Stage,
} from './types'

function getStageCards(cards: DealCard[], stageId: string) {
  return cards
    .filter((card) => card.stage_id === stageId)
    .sort((a, b) => a.position - b.position)
}

export default function SalesPipelinePage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [cards, setCards] = useState<DealCard[]>([])
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [boardLoading, setBoardLoading] = useState(false)

  const [pipelineDialogOpen, setPipelineDialogOpen] = useState(false)
  const [pipelineForm, setPipelineForm] = useState<PipelineFormState>(createInitialPipelineForm())
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null)
  const [pipelineFormLoading, setPipelineFormLoading] = useState(false)

  const [cardDialogOpen, setCardDialogOpen] = useState(false)
  const [cardForm, setCardForm] = useState<CardFormState>(createInitialCardForm())
  const [editingCard, setEditingCard] = useState<DealCard | null>(null)
  const [cardStageId, setCardStageId] = useState<string | null>(null)

  const closePipelineDialog = useCallback(() => {
    setPipelineDialogOpen(false)
    setEditingPipeline(null)
    setPipelineForm(createInitialPipelineForm())
    setPipelineFormLoading(false)
  }, [])

  const closeCardDialog = useCallback(() => {
    setCardDialogOpen(false)
    setEditingCard(null)
    setCardStageId(null)
    setCardForm(createInitialCardForm())
  }, [])

  const openCreatePipelineDialog = useCallback(() => {
    setEditingPipeline(null)
    setPipelineForm(createInitialPipelineForm())
    setPipelineFormLoading(false)
    setPipelineDialogOpen(true)
  }, [])

  const openEditPipelineDialog = useCallback(async (pipeline: Pipeline) => {
    setEditingPipeline(pipeline)
    setPipelineForm({
      name: pipeline.name,
      description: pipeline.description ?? '',
      stages: [createEmptyStage(0)],
      removedStageIds: [],
    })
    setPipelineFormLoading(true)
    setPipelineDialogOpen(true)

    const { data, error } = await supabasebrowser
      .from('stage')
      .select('id, name, position')
      .eq('pipeline_id', pipeline.id)
      .order('position', { ascending: true })

    if (error) {
      console.error(error)
      toast.error('Não foi possível carregar os estágios do funil.')
      setPipelineForm({
        name: pipeline.name,
        description: pipeline.description ?? '',
        stages: [createEmptyStage(0)],
        removedStageIds: [],
      })
      setPipelineFormLoading(false)
      return
    }

    const stageForms = (data ?? []).map((stage, index) => ({
      id: stage.id,
      name: stage.name,
      position: index,
    }))

    setPipelineForm({
      name: pipeline.name,
      description: pipeline.description ?? '',
      stages: stageForms.length ? stageForms : [createEmptyStage(0)],
      removedStageIds: [],
    })
    setPipelineFormLoading(false)
  }, [])

  const addPipelineStage = useCallback(() => {
    setPipelineForm((prev) => ({
      ...prev,
      stages: reindexStages([...prev.stages, createEmptyStage(prev.stages.length)]),
    }))
  }, [])

  const updatePipelineStageName = useCallback((index: number, name: string) => {
    setPipelineForm((prev) => {
      const nextStages = prev.stages.map((stage, stageIndex) =>
        stageIndex === index ? { ...stage, name } : stage
      )
      return { ...prev, stages: nextStages }
    })
  }, [])

  const removePipelineStage = useCallback((index: number) => {
    setPipelineForm((prev) => {
      const stageToRemove = prev.stages[index]
      const nextStages = prev.stages.filter((_, stageIndex) => stageIndex !== index)
      const stagesList = reindexStages(nextStages.length ? nextStages : [createEmptyStage(0)])
      const removedStageIds = stageToRemove?.id
        ? prev.removedStageIds.includes(stageToRemove.id)
          ? prev.removedStageIds
          : [...prev.removedStageIds, stageToRemove.id]
        : prev.removedStageIds

      return {
        ...prev,
        stages: stagesList,
        removedStageIds,
      }
    })
  }, [])

  const handlePipelineFieldChange = useCallback(
    (field: 'name' | 'description', value: string) => {
      setPipelineForm((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const handleCardFieldChange = useCallback(
    <K extends keyof CardFormState>(field: K, value: CardFormState[K]) => {
      setCardForm((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const fetchCompany = useCallback(async () => {
    const [{ data: userData }, { data: session }] = await Promise.all([
      supabasebrowser.auth.getUser(),
      supabasebrowser.auth.getSession(),
    ])

    const userId = userData.user?.id ?? session?.session?.user.id
    if (!userId) return

    const { data: companyData, error } = await supabasebrowser
      .from('company')
      .select('id, company_name')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error(error)
      toast.error('Não foi possível carregar as informações da empresa.')
      return
    }

    setCompany(companyData)
  }, [])

  const loadPipelines = useCallback(async (companyId: number) => {
    const { data, error } = await supabasebrowser
      .from('pipeline')
      .select('id, name, description, company_id')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error(error)
      toast.error('Erro ao carregar os funis.')
      return
    }

    setPipelines(data ?? [])

    if (data?.length) {
      setSelectedPipelineId((current) => current ?? data[0].id)
    } else {
      setSelectedPipelineId(null)
      setStages([])
      setCards([])
    }
  }, [])

  const loadBoard = useCallback(async (pipelineId: string) => {
    setBoardLoading(true)
    const [{ data: stageData, error: stageError }, { data: cardData, error: cardError }] = await Promise.all([
      supabasebrowser
        .from('stage')
        .select('id, name, position, pipeline_id')
        .eq('pipeline_id', pipelineId)
        .order('position', { ascending: true }),
      supabasebrowser
        .from('card')
        .select(
          'id, title, company_name, owner, tag, status, mrr, messages_count, last_message_at, next_action_at, position, stage_id, pipeline_id'
        )
        .eq('pipeline_id', pipelineId)
        .order('position', { ascending: true }),
    ])

    if (stageError || cardError) {
      console.error(stageError || cardError)
      toast.error('Erro ao carregar as oportunidades do funil.')
      setBoardLoading(false)
      return
    }

    setStages(stageData ?? [])
    setCards(
      (cardData ?? []).map((card) => ({
        ...card,
        mrr: Number(card.mrr ?? 0),
        messages_count: Number(card.messages_count ?? 0),
      }))
    )
    setBoardLoading(false)
  }, [])

  useEffect(() => {
    fetchCompany().finally(() => setLoading(false))
  }, [fetchCompany])

  useEffect(() => {
    if (company?.id) {
      void loadPipelines(company.id)
    }
  }, [company, loadPipelines])

  useEffect(() => {
    if (selectedPipelineId) {
      void loadBoard(selectedPipelineId)
    }
  }, [selectedPipelineId, loadBoard])

  const cardsByStage = useMemo(() => {
    const map = new Map<string, DealCard[]>()
    stages.forEach((stage) => {
      map.set(stage.id, getStageCards(cards, stage.id))
    })
    return map
  }, [cards, stages])

  const handlePipelineSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!company?.id) {
        toast.error('Nenhuma empresa selecionada.')
        return
      }

      const name = pipelineForm.name.trim()
      if (!name) {
        toast.error('Informe um nome para o funil.')
        return
      }

      const trimmedStages = pipelineForm.stages.map((stage) => ({
        ...stage,
        name: stage.name.trim(),
      }))

      if (!trimmedStages.length) {
        toast.error('Adicione pelo menos um estágio ao funil.')
        return
      }

      if (trimmedStages.some((stage) => !stage.name)) {
        toast.error('Informe o nome de todos os estágios.')
        return
      }

      const normalizedStages = reindexStages(trimmedStages)

      try {
        setPipelineFormLoading(true)

        let pipelineId = editingPipeline?.id ?? null

        if (editingPipeline) {
          const { error } = await supabasebrowser
            .from('pipeline')
            .update({
              name,
              description: pipelineForm.description.trim() || null,
            })
            .eq('id', editingPipeline.id)

          if (error) throw error
        } else {
          const { data, error } = await supabasebrowser
            .from('pipeline')
            .insert({
              name,
              description: pipelineForm.description.trim() || null,
              company_id: company.id,
            })
            .select('id')
            .single()

          if (error) throw error
          pipelineId = data?.id ?? null
        }

        if (!pipelineId) {
          throw new Error('Não foi possível identificar o funil.')
        }

        if (editingPipeline && pipelineForm.removedStageIds.length) {
          const { error } = await supabasebrowser
            .from('stage')
            .delete()
            .in('id', pipelineForm.removedStageIds)
          if (error) throw error
        }

        const stagesToUpdate = normalizedStages.filter((stage) => stage.id)
        const stagesToInsert = normalizedStages.filter((stage) => !stage.id)

        for (const stage of stagesToUpdate) {
          const { error } = await supabasebrowser
            .from('stage')
            .update({
              name: stage.name,
              position: stage.position,
            })
            .eq('id', stage.id)
          if (error) throw error
        }

        if (stagesToInsert.length) {
          const { error } = await supabasebrowser.from('stage').insert(
            stagesToInsert.map((stage) => ({
              name: stage.name,
              position: stage.position,
              pipeline_id: pipelineId!,
            }))
          )
          if (error) throw error
        }

        toast.success(editingPipeline ? 'Funil atualizado com sucesso.' : 'Funil criado com sucesso.')

        closePipelineDialog()

        if (!editingPipeline) {
          setSelectedPipelineId(pipelineId)
        }

        void loadPipelines(company.id)
        if (selectedPipelineId === pipelineId) {
          void loadBoard(pipelineId)
        }
      } catch (error) {
        console.error(error)
        toast.error('Não foi possível salvar o funil.')
      } finally {
        setPipelineFormLoading(false)
      }
    },
    [
      closePipelineDialog,
      company,
      editingPipeline,
      pipelineForm,
      loadBoard,
      loadPipelines,
      selectedPipelineId,
    ]
  )

  const handleDeletePipeline = useCallback(
    async (pipelineId: string) => {
      if (!company?.id) return
      const pipeline = pipelines.find((item) => item.id === pipelineId)
      if (!pipeline) return

      if (!window.confirm(`Tem certeza que deseja excluir o funil "${pipeline.name}"?`)) {
        return
      }

      try {
        const { error } = await supabasebrowser.from('pipeline').delete().eq('id', pipelineId)
        if (error) throw error
        toast.success('Funil removido.')
        setSelectedPipelineId((current) => (current === pipelineId ? null : current))
        void loadPipelines(company.id)
      } catch (error) {
        console.error(error)
        toast.error('Erro ao remover o funil.')
      }
    },
    [company, pipelines, loadPipelines]
  )

  const openCardDialog = useCallback((stageId: string, card?: DealCard) => {
    setCardStageId(stageId)
    if (card) {
      setEditingCard(card)
      setCardForm({
        title: card.title,
        companyName: card.company_name ?? '',
        owner: card.owner ?? '',
        tag: card.tag ?? '',
        status: card.status ?? '',
        mrr: card.mrr ? String(card.mrr) : '',
        messagesCount: card.messages_count ? String(card.messages_count) : '',
        lastMessageAt: toInputDate(card.last_message_at),
        nextActionAt: toInputDate(card.next_action_at),
      })
    } else {
      setEditingCard(null)
      setCardForm(createInitialCardForm())
    }
    setCardDialogOpen(true)
  }, [])

  const handleCardSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!selectedPipelineId || !cardStageId) {
        toast.error('Selecione um estágio válido.')
        return
      }

      if (!cardForm.title.trim()) {
        toast.error('Informe um nome para a oportunidade.')
        return
      }

      const payload = {
        title: cardForm.title.trim(),
        company_name: cardForm.companyName.trim() || null,
        owner: cardForm.owner.trim() || null,
        tag: cardForm.tag.trim() || null,
        status: cardForm.status.trim() || null,
        mrr: Number(cardForm.mrr) || 0,
        messages_count: Number(cardForm.messagesCount) || 0,
        last_message_at: fromInputDate(cardForm.lastMessageAt),
        next_action_at: fromInputDate(cardForm.nextActionAt),
      }

      try {
        if (editingCard) {
          const { error } = await supabasebrowser
            .from('card')
            .update({
              ...payload,
              stage_id: cardStageId,
            })
            .eq('id', editingCard.id)
          if (error) throw error
          toast.success('Oportunidade atualizada.')
        } else {
          const stageCards = getStageCards(cards, cardStageId)
          const { error } = await supabasebrowser.from('card').insert({
            ...payload,
            pipeline_id: selectedPipelineId,
            stage_id: cardStageId,
            position: stageCards.length,
          })
          if (error) throw error
          toast.success('Oportunidade criada.')
        }

        closeCardDialog()
        if (selectedPipelineId) {
          void loadBoard(selectedPipelineId)
        }
      } catch (error) {
        console.error(error)
        toast.error('Não foi possível salvar a oportunidade.')
      }
    },
    [cardForm, cardStageId, cards, closeCardDialog, editingCard, loadBoard, selectedPipelineId]
  )

  const handleDeleteCard = useCallback(
    async (card: DealCard) => {
      if (!window.confirm(`Deseja remover a oportunidade "${card.title}"?`)) {
        return
      }

      try {
        const { error } = await supabasebrowser.from('card').delete().eq('id', card.id)
        if (error) throw error
        toast.success('Oportunidade removida.')
        if (selectedPipelineId) {
          void loadBoard(selectedPipelineId)
        }
      } catch (error) {
        console.error(error)
        toast.error('Erro ao remover a oportunidade.')
      }
    },
    [loadBoard, selectedPipelineId]
  )

  const handleDragEnd = useCallback(
    async ({ destination, source, draggableId }: DropResult) => {
      if (!destination) return

      const sameStage = destination.droppableId === source.droppableId
      const samePosition = destination.index === source.index
      if (sameStage && samePosition) return

      const activeCard = cards.find((card) => card.id === draggableId)
      if (!activeCard) return

      const stageLists = new Map<string, DealCard[]>()
      stages.forEach((stage) => {
        stageLists.set(stage.id, [])
      })

      cards.forEach((card) => {
        const list = stageLists.get(card.stage_id)
        if (list) {
          list.push(card)
          list.sort((a, b) => a.position - b.position)
        }
      })

      const sourceList = stageLists.get(source.droppableId)
      const destinationList = stageLists.get(destination.droppableId)
      if (!sourceList || !destinationList) return

      const [removed] = sourceList.splice(source.index, 1)
      if (!removed) return

      const updatedCard: DealCard = {
        ...removed,
        stage_id: destination.droppableId,
      }

      destinationList.splice(destination.index, 0, updatedCard)

      stageLists.set(source.droppableId, sourceList)
      stageLists.set(destination.droppableId, destinationList)

      const nextCards: DealCard[] = []
      stageLists.forEach((list, stageId) => {
        list.forEach((card, index) => {
          nextCards.push({
            ...card,
            stage_id: stageId,
            position: index,
          })
        })
      })

      setCards(nextCards)

      try {
        const impactedStages = new Set([source.droppableId, destination.droppableId])
        await Promise.all(
          nextCards
            .filter((card) => impactedStages.has(card.stage_id))
            .map((card) =>
              supabasebrowser
                .from('card')
                .update({ stage_id: card.stage_id, position: card.position })
                .eq('id', card.id)
            )
        )
      } catch (error) {
        console.error(error)
        toast.error('Não foi possível atualizar a posição da oportunidade.')
        if (selectedPipelineId) {
          void loadBoard(selectedPipelineId)
        }
      }
    },
    [cards, loadBoard, selectedPipelineId, stages]
  )

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">Funil de vendas</h1>
          <p className="text-sm text-gray-500">
            Organize oportunidades por estágio, acompanhe prioridades e mantenha seu time alinhado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button type="button" variant="outline" size="icon" className="h-10 w-10">
                <MoreHorizontal className="h-5 w-5" />
                <span className="sr-only">Ações do funil</span>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                className="z-50 w-52 rounded-md border border-slate-200 bg-white p-1 shadow-lg"
              >
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none transition hover:bg-slate-100 focus:bg-slate-100"
                  onSelect={() => {
                    openCreatePipelineDialog()
                  }}
                >
                  <Plus className="h-4 w-4" /> Novo funil
                </DropdownMenu.Item>
                {selectedPipelineId ? (
                  <>
                    <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />
                    <DropdownMenu.Item
                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none transition hover:bg-slate-100 focus:bg-slate-100"
                      onSelect={() => {
                        const current = pipelines.find((item) => item.id === selectedPipelineId)
                        if (current) {
                          void openEditPipelineDialog(current)
                        }
                      }}
                    >
                      Editar funil
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive outline-none transition hover:bg-destructive/10 focus:bg-destructive/10"
                      onSelect={() => {
                        if (selectedPipelineId) {
                          void handleDeletePipeline(selectedPipelineId)
                        }
                      }}
                    >
                      Excluir funil
                    </DropdownMenu.Item>
                  </>
                ) : null}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {pipelines.length ? (
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Selecionar funil
              </label>
              <Select
                value={selectedPipelineId ?? ''}
                onValueChange={(value) => setSelectedPipelineId(value)}
              >
                <SelectTrigger>
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
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            <Button variant="outline" className="flex items-center gap-2 border-dashed">
              <Filter className="h-4 w-4" /> Filtros rápidos
            </Button>
            <Button variant="ghost" className="text-gray-500 hover:text-gray-900">
              Última atividade
            </Button>
            <Button variant="ghost" className="text-gray-500 hover:text-gray-900">
              Proprietário
            </Button>
            <Button variant="ghost" className="text-gray-500 hover:text-gray-900">
              Intervalo de datas
            </Button>
          </div>

          <div className="-mx-2 overflow-x-auto pb-6">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex gap-4 px-2">
                {stages.map((stage) => (
                  <StageColumn
                    key={stage.id}
                    stage={stage}
                    cards={cardsByStage.get(stage.id) ?? []}
                    onAddCard={(stageId) => {
                      openCardDialog(stageId)
                    }}
                    onEditCard={(card) => openCardDialog(card.stage_id, card)}
                    onDeleteCard={handleDeleteCard}
                    isLoading={boardLoading}
                  />
                ))}
              </div>
            </DragDropContext>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Crie seu primeiro funil</h2>
          <p className="mt-2 text-sm text-gray-500">
            Estruture as etapas do seu processo comercial para acompanhar cada oportunidade com clareza.
          </p>
          <Button className="mt-6" onClick={openCreatePipelineDialog}>
            <Plus className="mr-2 h-4 w-4" /> Começar agora
          </Button>
        </div>
      )}

      <PipelineDialog
        open={pipelineDialogOpen}
        form={pipelineForm}
        loading={pipelineFormLoading}
        editingPipeline={editingPipeline}
        onClose={closePipelineDialog}
        onSubmit={handlePipelineSubmit}
        onUpdateStageName={updatePipelineStageName}
        onAddStage={addPipelineStage}
        onRemoveStage={removePipelineStage}
        onChangeField={handlePipelineFieldChange}
      />

      <CardDialog
        open={cardDialogOpen}
        editingCard={editingCard}
        form={cardForm}
        onClose={closeCardDialog}
        onSubmit={handleCardSubmit}
        onChangeField={handleCardFieldChange}
      />
    </div>
  )
}
