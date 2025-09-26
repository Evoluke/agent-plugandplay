'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { supabasebrowser } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Image from 'next/image'
import { toast } from 'sonner'
import * as Dialog from '@radix-ui/react-dialog'
import {
  DragEndEvent,
  DragStartEvent,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'

type Pipeline = {
  id: string
  name: string
}

type Stage = {
  id: string
  pipeline_id: string
  name: string
  position: number
}

type Card = {
  id: string
  stage_id: string
  title: string
  description: string | null
  value: number | null
  position: number
}

type StageWithCards = Stage & {
  cards: Card[]
}

export default function FunilDeVendasPage() {
  const [loading, setLoading] = useState(true)
  const [boardLoading, setBoardLoading] = useState(false)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null)
  const [stages, setStages] = useState<StageWithCards[]>([])
  const [activeCardId, setActiveCardId] = useState<string | null>(null)

  const [pipelineModalOpen, setPipelineModalOpen] = useState(false)
  const [pipelineModalMode, setPipelineModalMode] = useState<'create' | 'edit'>('create')
  const [pipelineFormName, setPipelineFormName] = useState('')
  const [pipelineSubmitting, setPipelineSubmitting] = useState(false)
  const [pipelineToEdit, setPipelineToEdit] = useState<Pipeline | null>(null)
  const [pipelineToDelete, setPipelineToDelete] = useState<Pipeline | null>(null)
  const [pipelineDeleting, setPipelineDeleting] = useState(false)

  const [stageModalOpen, setStageModalOpen] = useState(false)
  const [stageModalMode, setStageModalMode] = useState<'create' | 'edit'>('create')
  const [stageFormName, setStageFormName] = useState('')
  const [stageSubmitting, setStageSubmitting] = useState(false)
  const [stageContext, setStageContext] = useState<{ stage?: StageWithCards; pipelineId?: string } | null>(null)
  const [stageToDelete, setStageToDelete] = useState<StageWithCards | null>(null)
  const [stageDeleting, setStageDeleting] = useState(false)

  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [cardModalMode, setCardModalMode] = useState<'create' | 'edit'>('create')
  const [cardFormTitle, setCardFormTitle] = useState('')
  const [cardFormDescription, setCardFormDescription] = useState('')
  const [cardFormValue, setCardFormValue] = useState('')
  const [cardSubmitting, setCardSubmitting] = useState(false)
  const [cardContext, setCardContext] = useState<{ stageId: string; card?: Card } | null>(null)
  const [cardToDelete, setCardToDelete] = useState<{ stageId: string; card: Card } | null>(null)
  const [cardDeleting, setCardDeleting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeCard = useMemo(() => {
    if (!activeCardId) return null
    for (const stage of stages) {
      const found = stage.cards.find((card) => card.id === activeCardId)
      if (found) {
        return found
      }
    }
    return null
  }, [activeCardId, stages])

  const fetchPipelines = useCallback(
    async (company: string) => {
      const { data, error } = await supabasebrowser
        .from('pipeline')
        .select('id,name')
        .eq('company_id', company)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Erro ao carregar funis', error)
        toast.error('Não foi possível carregar os funis de vendas.')
        return [] as Pipeline[]
      }

      setPipelines(data ?? [])

      return data ?? []
    },
    [],
  )

  const fetchStages = useCallback(
    async (pipelineId: string) => {
      setBoardLoading(true)
      const { data, error } = await supabasebrowser
        .from('stage')
        .select('id,name,position,pipeline_id,cards:card(id,title,description,value,position,stage_id)')
        .eq('pipeline_id', pipelineId)
        .order('position', { ascending: true })

      if (error) {
        console.error('Erro ao carregar estágios', error)
        toast.error('Não foi possível carregar os estágios do funil.')
        setStages([])
        setBoardLoading(false)
        return
      }

      const normalized: StageWithCards[] = (data ?? []).map((stage) => ({
        id: stage.id,
        name: stage.name,
        pipeline_id: stage.pipeline_id,
        position: stage.position,
        cards: (stage.cards ?? [])
          .map((card) => ({
            id: card.id,
            stage_id: card.stage_id,
            title: card.title,
            description: card.description,
            value: card.value != null ? Number(card.value) : null,
            position: card.position,
          }))
          .sort((a, b) => a.position - b.position),
      }))

      normalized.sort((a, b) => a.position - b.position)
      setStages(normalized)
      setBoardLoading(false)
    },
    [],
  )

  const persistStagePositions = useCallback(async (orderedStages: StageWithCards[]) => {
    const updates = orderedStages.map((stage, index) =>
      supabasebrowser.from('stage').update({ position: index }).eq('id', stage.id),
    )

    const results = await Promise.all(updates)
    const failed = results.find((result) => result.error)
    if (failed?.error) {
      console.error('Erro ao atualizar posições dos estágios', failed.error)
      toast.error('Não foi possível atualizar a ordem dos estágios.')
    }
  }, [])

  const persistCardPositionsInternal = useCallback(
    async (stageIds: string[], stageState?: StageWithCards[]) => {
      const reference = stageState ?? stages
      const uniqueStageIds = Array.from(new Set(stageIds))
      const updates = uniqueStageIds.flatMap((stageId) => {
        const stage = reference.find((item) => item.id === stageId)
        if (!stage) return []
        return stage.cards.map((card, index) =>
          supabasebrowser
            .from('card')
            .update({ stage_id: card.stage_id, position: index })
            .eq('id', card.id),
        )
      })

      if (!updates.length) return

      const results = await Promise.all(updates)
      const failed = results.find((result) => result.error)
      if (failed?.error) {
        console.error('Erro ao atualizar posições dos cards', failed.error)
        toast.error('Não foi possível atualizar a ordem dos cards.')
        if (selectedPipelineId) {
          await fetchStages(selectedPipelineId)
        }
      }
    },
    [fetchStages, selectedPipelineId, stages],
  )

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      const { data: userData, error: userError } = await supabasebrowser.auth.getUser()
      if (userError || !userData?.user) {
        toast.error('Não foi possível identificar o usuário autenticado.')
        setLoading(false)
        return
      }

      const { data: companyData, error: companyError } = await supabasebrowser
        .from('company')
        .select('id')
        .eq('user_id', userData.user.id)
        .single()

      if (companyError || !companyData?.id) {
        console.error('Erro ao buscar empresa', companyError)
        toast.error('Não foi possível carregar os dados da empresa.')
        setLoading(false)
        return
      }

      if (!isMounted) return

      setCompanyId(companyData.id)

      const companyPipelines = await fetchPipelines(companyData.id)

      if (!isMounted) return

      if (companyPipelines.length > 0) {
        setSelectedPipelineId((current) => {
          if (current && companyPipelines.some((pipeline) => pipeline.id === current)) {
            return current
          }
          return companyPipelines[0]?.id ?? null
        })
      }

      setLoading(false)
    }

    void bootstrap()

    return () => {
      isMounted = false
    }
  }, [fetchPipelines])

  useEffect(() => {
    if (selectedPipelineId) {
      void fetchStages(selectedPipelineId)
    } else {
      setStages([])
    }
  }, [selectedPipelineId, fetchStages])

  const handleOpenCreatePipeline = () => {
    setPipelineModalMode('create')
    setPipelineFormName('')
    setPipelineToEdit(null)
    setPipelineModalOpen(true)
  }

  const handleOpenEditPipeline = () => {
    if (!selectedPipelineId) return
    const pipeline = pipelines.find((item) => item.id === selectedPipelineId)
    if (!pipeline) return
    setPipelineModalMode('edit')
    setPipelineFormName(pipeline.name)
    setPipelineToEdit(pipeline)
    setPipelineModalOpen(true)
  }

  const handleSubmitPipeline = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = pipelineFormName.trim()
    if (!trimmedName) {
      toast.error('Informe um nome para o funil.')
      return
    }
    if (!companyId) {
      toast.error('Empresa não encontrada.')
      return
    }

    setPipelineSubmitting(true)

    if (pipelineModalMode === 'create') {
      const { data, error } = await supabasebrowser
        .from('pipeline')
        .insert({ name: trimmedName, company_id: companyId })
        .select('id,name')
        .single()

      setPipelineSubmitting(false)

      if (error || !data) {
        console.error('Erro ao criar funil', error)
        toast.error('Não foi possível criar o funil.')
        return
      }

      setPipelines((prev) => [...prev, data])
      setSelectedPipelineId(data.id)
      setPipelineModalOpen(false)
      toast.success('Funil criado com sucesso!')
    } else if (pipelineModalMode === 'edit' && pipelineToEdit) {
      const { error } = await supabasebrowser
        .from('pipeline')
        .update({ name: trimmedName })
        .eq('id', pipelineToEdit.id)

      setPipelineSubmitting(false)

      if (error) {
        console.error('Erro ao atualizar funil', error)
        toast.error('Não foi possível atualizar o funil.')
        return
      }

      setPipelines((prev) =>
        prev.map((pipeline) =>
          pipeline.id === pipelineToEdit.id ? { ...pipeline, name: trimmedName } : pipeline,
        ),
      )
      setPipelineModalOpen(false)
      toast.success('Funil atualizado com sucesso!')
    }
  }

  const handleDeletePipeline = async () => {
    if (!pipelineToDelete) return

    setPipelineDeleting(true)
    const { error } = await supabasebrowser
      .from('pipeline')
      .delete()
      .eq('id', pipelineToDelete.id)

    setPipelineDeleting(false)

    if (error) {
      console.error('Erro ao remover funil', error)
      toast.error('Não foi possível remover o funil.')
      return
    }

    setPipelines((prev) => {
      const updated = prev.filter((pipeline) => pipeline.id !== pipelineToDelete.id)
      setSelectedPipelineId((current) => {
        if (current === pipelineToDelete.id) {
          return updated[0]?.id ?? null
        }
        return current
      })
      if (!updated.length) {
        setStages([])
      }
      return updated
    })

    if (selectedPipelineId === pipelineToDelete.id) {
      setStages([])
    }

    setPipelineToDelete(null)
    toast.success('Funil removido com sucesso!')
  }

  const handleOpenCreateStage = () => {
    if (!selectedPipelineId) {
      toast.error('Selecione um funil para adicionar estágios.')
      return
    }
    setStageModalMode('create')
    setStageFormName('')
    setStageContext({ pipelineId: selectedPipelineId })
    setStageModalOpen(true)
  }

  const handleOpenEditStage = (stage: StageWithCards) => {
    setStageModalMode('edit')
    setStageFormName(stage.name)
    setStageContext({ stage })
    setStageModalOpen(true)
  }

  const handleSubmitStage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = stageFormName.trim()
    if (!trimmedName) {
      toast.error('Informe um nome para o estágio.')
      return
    }

    if (stageModalMode === 'create' && stageContext?.pipelineId) {
      setStageSubmitting(true)
      const position = stages.length
      const { data, error } = await supabasebrowser
        .from('stage')
        .insert({
          name: trimmedName,
          pipeline_id: stageContext.pipelineId,
          position,
        })
        .select('id,name,position,pipeline_id')
        .single()

      setStageSubmitting(false)

      if (error || !data) {
        console.error('Erro ao criar estágio', error)
        toast.error('Não foi possível criar o estágio.')
        return
      }

      setStages((prev) => [...prev, { ...data, cards: [] }])
      setStageModalOpen(false)
      toast.success('Estágio criado com sucesso!')
    } else if (stageModalMode === 'edit' && stageContext?.stage) {
      setStageSubmitting(true)
      const { error } = await supabasebrowser
        .from('stage')
        .update({ name: trimmedName })
        .eq('id', stageContext.stage.id)

      setStageSubmitting(false)

      if (error) {
        console.error('Erro ao atualizar estágio', error)
        toast.error('Não foi possível atualizar o estágio.')
        return
      }

      setStages((prev) =>
        prev.map((stage) =>
          stage.id === stageContext.stage?.id ? { ...stage, name: trimmedName } : stage,
        ),
      )
      setStageModalOpen(false)
      toast.success('Estágio atualizado com sucesso!')
    }
  }

  const handleDeleteStage = async () => {
    if (!stageToDelete) return

    setStageDeleting(true)
    const { error } = await supabasebrowser
      .from('stage')
      .delete()
      .eq('id', stageToDelete.id)

    setStageDeleting(false)

    if (error) {
      console.error('Erro ao remover estágio', error)
      toast.error('Não foi possível remover o estágio.')
      return
    }

    setStages((prev) => {
      const remaining = prev
        .filter((stage) => stage.id !== stageToDelete.id)
        .map((stage, index) => ({ ...stage, position: index }))
      void persistStagePositions(remaining)
      return remaining
    })

    setStageToDelete(null)
    toast.success('Estágio removido com sucesso!')
  }

  const handleOpenCreateCard = (stage: StageWithCards) => {
    setCardModalMode('create')
    setCardFormTitle('')
    setCardFormDescription('')
    setCardFormValue('')
    setCardContext({ stageId: stage.id })
    setCardModalOpen(true)
  }

  const handleOpenEditCard = (stageId: string, card: Card) => {
    setCardModalMode('edit')
    setCardContext({ stageId, card })
    setCardFormTitle(card.title)
    setCardFormDescription(card.description ?? '')
    setCardFormValue(card.value != null ? card.value.toString() : '')
    setCardModalOpen(true)
  }

  const handleSubmitCard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedTitle = cardFormTitle.trim()
    if (!trimmedTitle) {
      toast.error('Informe um título para o card.')
      return
    }
    if (!cardContext) return

    const parsedValue = cardFormValue ? Number(cardFormValue.replace(',', '.')) : null

    if (Number.isNaN(parsedValue)) {
      toast.error('Valor inválido.')
      return
    }

    if (cardModalMode === 'create') {
      setCardSubmitting(true)
      const stage = stages.find((item) => item.id === cardContext.stageId)
      const position = stage ? stage.cards.length : 0
      const { data, error } = await supabasebrowser
        .from('card')
        .insert({
          title: trimmedTitle,
          description: cardFormDescription.trim() || null,
          value: parsedValue,
          stage_id: cardContext.stageId,
          position,
        })
        .select('id,title,description,value,position,stage_id')
        .single()

      setCardSubmitting(false)

      if (error || !data) {
        console.error('Erro ao criar card', error)
        toast.error('Não foi possível criar o card.')
        return
      }

      setStages((prev) =>
        prev.map((stageItem) => {
          if (stageItem.id !== cardContext.stageId) return stageItem
          const updatedCards = [
            ...stageItem.cards,
            {
              id: data.id,
              title: data.title,
              description: data.description,
              value: data.value != null ? Number(data.value) : null,
              position: data.position,
              stage_id: data.stage_id,
            },
          ].map((card, index) => ({ ...card, position: index }))
          return { ...stageItem, cards: updatedCards }
        }),
      )
      setCardModalOpen(false)
      toast.success('Card criado com sucesso!')
    } else if (cardModalMode === 'edit' && cardContext.card) {
      setCardSubmitting(true)
      const { error } = await supabasebrowser
        .from('card')
        .update({
          title: trimmedTitle,
          description: cardFormDescription.trim() || null,
          value: parsedValue,
        })
        .eq('id', cardContext.card.id)

      setCardSubmitting(false)

      if (error) {
        console.error('Erro ao atualizar card', error)
        toast.error('Não foi possível atualizar o card.')
        return
      }

      setStages((prev) =>
        prev.map((stageItem) => {
          if (stageItem.id !== cardContext.stageId) return stageItem
          const updatedCards = stageItem.cards.map((card) =>
            card.id === cardContext.card?.id
              ? {
                  ...card,
                  title: trimmedTitle,
                  description: cardFormDescription.trim() || null,
                  value: parsedValue,
                }
              : card,
          )
          return { ...stageItem, cards: updatedCards }
        }),
      )
      setCardModalOpen(false)
      toast.success('Card atualizado com sucesso!')
    }
  }

  const handleDeleteCard = async () => {
    if (!cardToDelete) return

    setCardDeleting(true)
    const { error } = await supabasebrowser
      .from('card')
      .delete()
      .eq('id', cardToDelete.card.id)

    setCardDeleting(false)

    if (error) {
      console.error('Erro ao remover card', error)
      toast.error('Não foi possível remover o card.')
      return
    }

    setStages((prev) => {
      const updated = prev.map((stage) => {
        if (stage.id !== cardToDelete.stageId) return stage
        const cards = stage.cards
          .filter((card) => card.id !== cardToDelete.card.id)
          .map((card, index) => ({ ...card, position: index }))
        return { ...stage, cards }
      })
      void persistCardPositionsInternal([cardToDelete.stageId], updated)
      return updated
    })

    setCardToDelete(null)
    toast.success('Card removido com sucesso!')
  }

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveCardId(String(active.id))
  }

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveCardId(null)
    if (!over) return

    const activeCardId = String(active.id)
    const sourceStageId = active.data.current?.stageId as string | undefined

    let destinationStageId: string | undefined
    let destinationIndex = 0

    if (over.data?.current?.type === 'card') {
      destinationStageId = over.data.current.stageId as string | undefined
      const overCardId = String(over.id)
      const targetStage = stages.find((stage) => stage.cards.some((card) => card.id === overCardId))
      if (!targetStage) return
      destinationIndex = targetStage.cards.findIndex((card) => card.id === overCardId)
    } else if (over.data?.current?.type === 'stage') {
      destinationStageId = over.data.current.stageId as string | undefined
      const stage = stages.find((item) => item.id === destinationStageId)
      if (!stage) return
      destinationIndex = stage.cards.length
    } else {
      return
    }

    if (!sourceStageId || !destinationStageId) return

    const sourceStageIndex = stages.findIndex((stage) => stage.id === sourceStageId)
    const destinationStageIndex = stages.findIndex((stage) => stage.id === destinationStageId)
    if (sourceStageIndex === -1 || destinationStageIndex === -1) return

    const updatedStages = stages.map((stage) => ({ ...stage, cards: [...stage.cards] }))

    const sourceCards = updatedStages[sourceStageIndex].cards
    const movingIndex = sourceCards.findIndex((card) => card.id === activeCardId)
    if (movingIndex === -1) return

    const [movingCard] = sourceCards.splice(movingIndex, 1)

    if (sourceStageId === destinationStageId) {
      sourceCards.splice(destinationIndex, 0, { ...movingCard })
      updatedStages[sourceStageIndex].cards = sourceCards.map((card, index) => ({
        ...card,
        position: index,
      }))
    } else {
      const destinationCards = updatedStages[destinationStageIndex].cards
      destinationCards.splice(destinationIndex, 0, {
        ...movingCard,
        stage_id: destinationStageId,
      })
      updatedStages[sourceStageIndex].cards = sourceCards.map((card, index) => ({
        ...card,
        position: index,
      }))
      updatedStages[destinationStageIndex].cards = destinationCards.map((card, index) => ({
        ...card,
        stage_id: destinationStageId,
        position: index,
      }))
    }

    setStages(updatedStages)

    await persistCardPositionsInternal([sourceStageId, destinationStageId], updatedStages)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-[#2F6F68]" />
        </div>
      )
    }

    if (!pipelines.length) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <Image
            src="/mascot.png"
            alt="Mascote representando organização do funil"
            width={128}
            height={128}
            className="h-32 w-32"
            priority
          />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Configure seu primeiro funil de vendas</h2>
            <p className="max-w-md text-sm text-gray-600">
              Organize oportunidades por estágio e acompanhe negociações com um quadro estilo kanban. Crie um funil para começar.
            </p>
          </div>
          <Button onClick={handleOpenCreatePipeline} className="bg-[#2F6F68] hover:bg-[#255852]">
            <Plus size={16} /> Criar funil
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Funil de vendas</h1>
            <p className="text-sm text-gray-600">
              Gerencie etapas do funil, arraste oportunidades entre estágios e mantenha seu processo comercial organizado.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleOpenCreatePipeline}>
              <Plus size={16} /> Novo funil
            </Button>
            <Button variant="outline" onClick={handleOpenEditPipeline} disabled={!selectedPipelineId}>
              <Pencil size={16} /> Renomear
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!selectedPipelineId) return
                const pipeline = pipelines.find((item) => item.id === selectedPipelineId)
                if (!pipeline) return
                setPipelineToDelete(pipeline)
              }}
              disabled={!selectedPipelineId}
            >
              <Trash2 size={16} /> Excluir funil
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(240px,320px)_1fr]">
          <div className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Funil ativo</h2>
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
            <Button
              type="button"
              onClick={handleOpenCreateStage}
              className="w-full bg-[#2F6F68] hover:bg-[#255852]"
              disabled={!selectedPipelineId}
            >
              <Plus size={16} /> Adicionar estágio
            </Button>
          </div>

          <div className="overflow-x-auto">
            {boardLoading ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <Loader2 className="size-6 animate-spin text-[#2F6F68]" />
              </div>
            ) : (
              <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex min-h-[320px] gap-4 pb-4">
                  {stages.map((stage) => (
                    <StageColumn
                      key={stage.id}
                      stage={stage}
                      onEditStage={handleOpenEditStage}
                      onDeleteStage={(selectedStage) => setStageToDelete(selectedStage)}
                      onAddCard={handleOpenCreateCard}
                      onEditCard={handleOpenEditCard}
                      onDeleteCard={(stageId, card) => setCardToDelete({ stageId, card })}
                    />
                  ))}
                  <div className="flex min-w-[260px] items-center justify-center rounded-xl border-2 border-dashed border-[#97B7B4] bg-[#F8FBFB] p-4 text-center">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Adicione mais estágios</p>
                      <p className="text-xs text-gray-500">
                        Separe etapas do processo comercial para acompanhar a evolução das oportunidades.
                      </p>
                      <Button variant="secondary" onClick={handleOpenCreateStage}>
                        <Plus size={16} /> Novo estágio
                      </Button>
                    </div>
                  </div>
                </div>
                <DragOverlay>
                  {activeCard ? <CardPreview card={activeCard} /> : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {renderContent()}

      <Modal
        open={pipelineModalOpen}
        onOpenChange={(open) => {
          setPipelineModalOpen(open)
          if (!open) {
            setPipelineSubmitting(false)
          }
        }}
        title={pipelineModalMode === 'create' ? 'Criar funil de vendas' : 'Editar funil de vendas'}
      >
        <form onSubmit={handleSubmitPipeline} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nome do funil</label>
            <Input
              value={pipelineFormName}
              onChange={(event) => setPipelineFormName(event.target.value)}
              placeholder="Ex.: Funil principal"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Dialog.Close>
            <Button type="submit" disabled={pipelineSubmitting} className="bg-[#2F6F68] hover:bg-[#255852]">
              {pipelineSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {pipelineModalMode === 'create' ? 'Criar funil' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={stageModalOpen}
        onOpenChange={(open) => {
          setStageModalOpen(open)
          if (!open) {
            setStageSubmitting(false)
          }
        }}
        title={stageModalMode === 'create' ? 'Adicionar estágio' : 'Editar estágio'}
      >
        <form onSubmit={handleSubmitStage} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nome do estágio</label>
            <Input
              value={stageFormName}
              onChange={(event) => setStageFormName(event.target.value)}
              placeholder="Ex.: Prospecção"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Dialog.Close>
            <Button type="submit" disabled={stageSubmitting} className="bg-[#2F6F68] hover:bg-[#255852]">
              {stageSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {stageModalMode === 'create' ? 'Adicionar estágio' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={cardModalOpen}
        onOpenChange={(open) => {
          setCardModalOpen(open)
          if (!open) {
            setCardSubmitting(false)
          }
        }}
        title={cardModalMode === 'create' ? 'Novo card' : 'Editar card'}
      >
        <form onSubmit={handleSubmitCard} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Título</label>
            <Input
              value={cardFormTitle}
              onChange={(event) => setCardFormTitle(event.target.value)}
              placeholder="Ex.: Reunião com cliente"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <Textarea
              value={cardFormDescription}
              onChange={(event) => setCardFormDescription(event.target.value)}
              placeholder="Detalhes adicionais, próximos passos e responsáveis"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Valor (opcional)</label>
            <Input
              value={cardFormValue}
              onChange={(event) => setCardFormValue(event.target.value)}
              placeholder="Ex.: 1500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Dialog.Close>
            <Button type="submit" disabled={cardSubmitting} className="bg-[#2F6F68] hover:bg-[#255852]">
              {cardSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {cardModalMode === 'create' ? 'Adicionar card' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pipelineToDelete)}
        onOpenChange={(open) => {
          if (!open) setPipelineToDelete(null)
        }}
        title="Excluir funil"
        description="Essa ação removerá o funil, seus estágios e cards associados. Deseja continuar?"
        confirmLabel="Excluir funil"
        confirming={pipelineDeleting}
        onConfirm={handleDeletePipeline}
        tone="destructive"
      />

      <ConfirmDialog
        open={Boolean(stageToDelete)}
        onOpenChange={(open) => {
          if (!open) setStageToDelete(null)
        }}
        title="Excluir estágio"
        description="Todos os cards dentro deste estágio serão removidos. Tem certeza que deseja continuar?"
        confirmLabel="Excluir estágio"
        confirming={stageDeleting}
        onConfirm={handleDeleteStage}
        tone="destructive"
      />

      <ConfirmDialog
        open={Boolean(cardToDelete)}
        onOpenChange={(open) => {
          if (!open) setCardToDelete(null)
        }}
        title="Excluir card"
        description="Essa ação não pode ser desfeita. O card será removido do funil."
        confirmLabel="Excluir card"
        confirming={cardDeleting}
        onConfirm={handleDeleteCard}
        tone="destructive"
      />
    </div>
  )
}

type StageColumnProps = {
  stage: StageWithCards
  onEditStage: (stage: StageWithCards) => void
  onDeleteStage: (stage: StageWithCards) => void
  onAddCard: (stage: StageWithCards) => void
  onEditCard: (stageId: string, card: Card) => void
  onDeleteCard: (stageId: string, card: Card) => void
}

function StageColumn({
  stage,
  onEditStage,
  onDeleteStage,
  onAddCard,
  onEditCard,
  onDeleteCard,
}: StageColumnProps) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
    data: { type: 'stage', stageId: stage.id },
  })

  return (
    <div className="flex w-[280px] flex-col rounded-xl border bg-white p-4 shadow-sm">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{stage.name}</h3>
          <p className="text-xs text-gray-500">{stage.cards.length} cards</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEditStage(stage)}
            className="size-8 text-gray-500 hover:text-gray-800"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteStage(stage)}
            className="size-8 text-destructive hover:text-destructive"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </header>
      <SortableContext items={stage.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex min-h-[120px] flex-1 flex-col gap-3">
          {stage.cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onEdit={() => onEditCard(stage.id, card)}
              onDelete={() => onDeleteCard(stage.id, card)}
            />
          ))}
          {!stage.cards.length ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
              <p className="text-xs text-gray-500">Arraste cards para cá ou crie um novo.</p>
            </div>
          ) : null}
        </div>
      </SortableContext>
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 w-full justify-start gap-2 text-[#2F6F68] hover:bg-[#F1F5F5]"
        onClick={() => onAddCard(stage)}
      >
        <Plus size={16} /> Novo card
      </Button>
    </div>
  )
}

type SortableCardProps = {
  card: Card
  onEdit: () => void
  onDelete: () => void
}

function SortableCard({ card, onEdit, onDelete }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', stageId: card.stage_id },
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-[#2F6F68]/40',
        isDragging ? 'shadow-lg ring-2 ring-[#2F6F68]' : '',
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">{card.title}</p>
          {card.description ? (
            <p className="whitespace-pre-wrap text-xs text-gray-600">{card.description}</p>
          ) : null}
          {card.value != null ? (
            <p className="text-xs font-semibold text-[#2F6F68]">
              Valor:{' '}
              {card.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-1 opacity-0 transition group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-gray-500 hover:text-gray-800"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onEdit()
            }}
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}

function CardPreview({ card }: { card: Card }) {
  return (
    <div className="w-[260px] rounded-xl border border-[#97B7B4] bg-white p-3 shadow-lg">
      <p className="text-sm font-semibold text-gray-900">{card.title}</p>
      {card.description ? (
        <p className="mt-1 whitespace-pre-wrap text-xs text-gray-600">{card.description}</p>
      ) : null}
      {card.value != null ? (
        <p className="mt-2 text-xs font-semibold text-[#2F6F68]">
          {card.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      ) : null}
    </div>
  )
}

type ModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
}

function Modal({ open, onOpenChange, title, description, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none">
          <div className="space-y-4">
            <div className="space-y-2">
              <Dialog.Title className="text-lg font-semibold text-gray-900">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="text-sm text-gray-600">{description}</Dialog.Description>
              ) : null}
            </div>
            {children}
          </div>
          <Dialog.Close className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600">
            <X size={18} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  confirming?: boolean
  onConfirm: () => void
  tone?: 'default' | 'destructive'
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirming,
  onConfirm,
  tone = 'default',
}: ConfirmDialogProps) {
  const confirmVariant = tone === 'destructive' ? 'destructive' : 'default'

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none">
          <div className="space-y-4">
            <div className="space-y-2">
              <Dialog.Title className="text-lg font-semibold text-gray-900">{title}</Dialog.Title>
              <Dialog.Description className="text-sm text-gray-600">{description}</Dialog.Description>
            </div>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button
                type="button"
                variant={confirmVariant}
                onClick={onConfirm}
                disabled={confirming}
                className={cn(tone === 'destructive' ? '' : 'bg-[#2F6F68] text-white hover:bg-[#255852]')}
              >
                {confirming ? <Loader2 className="size-4 animate-spin" /> : null}
                {confirmLabel}
              </Button>
            </div>
          </div>
          <Dialog.Close className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600">
            <X size={18} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
