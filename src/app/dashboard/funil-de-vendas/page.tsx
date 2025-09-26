// src/app/dashboard/funil-de-vendas/page.tsx
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { supabasebrowser } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Trash2,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

type Company = {
  id: number
  company_name: string | null
}

type Pipeline = {
  id: string
  name: string
  description: string | null
  company_id: number
}

type Stage = {
  id: string
  name: string
  position: number
  pipeline_id: string
}

type DealCard = {
  id: string
  title: string
  company_name: string | null
  owner: string | null
  tag: string | null
  status: string | null
  mrr: number
  messages_count: number
  last_message_at: string | null
  next_action_at: string | null
  position: number
  stage_id: string
  pipeline_id: string
}

type PipelineStageForm = {
  id?: string
  name: string
  position: number
}

type PipelineFormState = {
  name: string
  description: string
  stages: PipelineStageForm[]
  removedStageIds: string[]
}

type CardFormState = {
  title: string
  companyName: string
  owner: string
  tag: string
  status: string
  mrr: string
  messagesCount: string
  lastMessageAt: string
  nextActionAt: string
}

const createEmptyStage = (position: number): PipelineStageForm => ({
  name: '',
  position,
})

const reindexStages = (stages: PipelineStageForm[]): PipelineStageForm[] =>
  stages.map((stage, index) => ({ ...stage, position: index }))

const createInitialPipelineForm = (): PipelineFormState => ({
  name: '',
  description: '',
  stages: [createEmptyStage(0)],
  removedStageIds: [],
})

const initialCardForm: CardFormState = {
  title: '',
  companyName: '',
  owner: '',
  tag: '',
  status: '',
  mrr: '',
  messagesCount: '',
  lastMessageAt: '',
  nextActionAt: '',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value)
}

function formatShortDate(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

function toInputDate(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function fromInputDate(value: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function getStageCards(cards: DealCard[], stageId: string) {
  return cards
    .filter((card) => card.stage_id === stageId)
    .sort((a, b) => a.position - b.position)
}

type DealCardItemProps = {
  card: DealCard
  onEdit: (card: DealCard) => void
  onDelete: (card: DealCard) => void
}

function DealCardItem({ card, onEdit, onDelete }: DealCardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const lastContact = formatShortDate(card.last_message_at)
  const nextAction = formatShortDate(card.next_action_at)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl border bg-white p-4 shadow-sm transition-shadow',
        isDragging ? 'shadow-lg ring-2 ring-primary/30' : 'hover:shadow-md'
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-gray-900">{card.title}</h4>
          {card.company_name ? (
            <p className="text-xs text-gray-500">{card.company_name}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {card.tag ? (
            <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
              {card.tag}
            </span>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-500 hover:text-gray-800"
            onClick={(event) => {
              event.stopPropagation()
              onEdit(card)
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        {card.status ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {card.status}
          </span>
        ) : null}
        {card.mrr ? (
          <span className="rounded-full bg-purple-50 px-2 py-1 font-medium text-purple-600">
            {formatCurrency(card.mrr)} MRR
          </span>
        ) : null}
        {card.messages_count ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">
            <MessageSquare className="h-3.5 w-3.5" />
            {card.messages_count} mensagens
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-2 text-xs text-gray-500">
        {card.owner ? (
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-gray-400" />
            <span>{card.owner}</span>
          </div>
        ) : null}
        {lastContact ? (
          <div className="flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
            <span>Último contato: {lastContact}</span>
          </div>
        ) : null}
        {nextAction ? (
          <div className="flex items-center gap-2 text-indigo-600">
            <Clock className="h-3.5 w-3.5" />
            <span>Próxima ação: {nextAction}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400">
        <button
          type="button"
          className="font-medium text-destructive hover:underline"
          onClick={(event) => {
            event.stopPropagation()
            onDelete(card)
          }}
        >
          Remover
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          onClick={(event) => {
            event.stopPropagation()
            onEdit(card)
          }}
        >
          Abrir detalhes
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

type StageColumnProps = {
  stage: Stage
  cards: DealCard[]
  onAddCard: (stageId: string) => void
  onEditCard: (card: DealCard) => void
  onDeleteCard: (card: DealCard) => void
  isLoading: boolean
}

function StageColumn({
  stage,
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  isLoading,
}: StageColumnProps) {
  return (
    <div className="flex h-full w-[320px] flex-shrink-0 flex-col rounded-2xl bg-slate-50/80 p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Estágio</p>
          <h3 className="text-lg font-semibold text-gray-900">{stage.name}</h3>
          <p className="text-xs text-gray-500">{cards.length} oportunidades</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-gray-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando
            </div>
          ) : (
            cards.map((card) => (
              <DealCardItem
                key={card.id}
                card={card}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
              />
            ))
          )}
        </SortableContext>
      </div>

      <Button
        type="button"
        variant="ghost"
        className="mt-4 w-full justify-center border border-dashed border-slate-300 bg-white/60 text-sm text-gray-600 hover:border-primary hover:text-primary"
        onClick={() => onAddCard(stage.id)}
      >
        <Plus className="mr-2 h-4 w-4" /> Nova oportunidade
      </Button>
    </div>
  )
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
  const [cardForm, setCardForm] = useState<CardFormState>(initialCardForm)
  const [editingCard, setEditingCard] = useState<DealCard | null>(null)
  const [cardStageId, setCardStageId] = useState<string | null>(null)

  const openCreatePipelineDialog = useCallback(() => {
    setEditingPipeline(null)
    setPipelineForm(createInitialPipelineForm())
    setPipelineFormLoading(false)
    setPipelineDialogOpen(true)
  }, [])

  const openEditPipelineDialog = useCallback(
    async (pipeline: Pipeline) => {
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
    },
    []
  )

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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

  const loadPipelines = useCallback(
    async (companyId: number) => {
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
    },
    []
  )

  const loadBoard = useCallback(
    async (pipelineId: string) => {
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
    },
    []
  )

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

        setPipelineDialogOpen(false)
        setPipelineForm(createInitialPipelineForm())
        setEditingPipeline(null)

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
    [company, editingPipeline, pipelineForm, loadBoard, loadPipelines, selectedPipelineId]
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
      setCardForm(initialCardForm)
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

        setCardDialogOpen(false)
        setEditingCard(null)
        setCardForm(initialCardForm)
        if (selectedPipelineId) {
          void loadBoard(selectedPipelineId)
        }
      } catch (error) {
        console.error(error)
        toast.error('Não foi possível salvar a oportunidade.')
      }
    },
    [cardForm, cardStageId, cards, editingCard, loadBoard, selectedPipelineId]
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
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over) return

      const activeId = String(active.id)
      const overId = String(over.id)

      if (activeId === overId) return

      const activeCard = cards.find((card) => card.id === activeId)
      if (!activeCard) return

      let targetStageId = overId
      let overCardId: string | null = null

      const overStage = stages.find((stage) => stage.id === overId)
      if (!overStage) {
        const overCard = cards.find((card) => card.id === overId)
        if (!overCard) return
        targetStageId = overCard.stage_id
        overCardId = overCard.id
      }

      const stageLists = new Map<string, DealCard[]>()
      stages.forEach((stage) => {
        stageLists.set(stage.id, [])
      })

      cards.forEach((card) => {
        if (card.id === activeId) return
        const list = stageLists.get(card.stage_id)
        if (list) {
          list.push(card)
          list.sort((a, b) => a.position - b.position)
          stageLists.set(card.stage_id, list)
        }
      })

      const destinationList = stageLists.get(targetStageId)
      if (!destinationList) return

      const insertIndexBase = overCardId
        ? destinationList.findIndex((card) => card.id === overCardId)
        : destinationList.length
      const insertIndex = insertIndexBase === -1 ? destinationList.length : insertIndexBase

      destinationList.splice(insertIndex, 0, {
        ...activeCard,
        stage_id: targetStageId,
      })
      stageLists.set(targetStageId, destinationList)

      const updatedCards: DealCard[] = []
      stageLists.forEach((list) => {
        list.forEach((card, index) => {
          const updatedCard = {
            ...card,
            stage_id: card.id === activeId ? targetStageId : card.stage_id,
            position: index,
          }
          updatedCards.push(updatedCard)
        })
      })

      setCards(updatedCards)

      try {
        const impactedStages = new Set([activeCard.stage_id, targetStageId])
        await Promise.all(
          updatedCards
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
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
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
            </DndContext>
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

      <Dialog.Root open={pipelineDialogOpen} onOpenChange={setPipelineDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {editingPipeline ? 'Editar funil' : 'Novo funil'}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-gray-500">
              Configure detalhes do funil e organize todos os estágios antes de colocar o board em produção.
            </Dialog.Description>

            <form className="mt-4 space-y-4" onSubmit={handlePipelineSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nome do funil</label>
                <Input
                  value={pipelineForm.name}
                  onChange={(event) =>
                    setPipelineForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Ex.: Aquisição, Expansão, Ativação"
                  required
                  disabled={pipelineFormLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  className="h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={pipelineForm.description}
                  onChange={(event) =>
                    setPipelineForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Explique o objetivo deste funil para o time."
                  disabled={pipelineFormLoading}
                />
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Estágios do funil</label>
                  <p className="text-xs text-gray-500">Gerencie as etapas que representam o avanço das oportunidades.</p>
                </div>
                {pipelineFormLoading ? (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 px-3 py-4 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Carregando estágios...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pipelineForm.stages.map((stage, index) => (
                      <div
                        key={stage.id ?? `${index}-${stage.name}`}
                        className="flex items-center gap-2"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-xs font-medium text-gray-500">
                          {index + 1}
                        </span>
                        <Input
                          value={stage.name}
                          onChange={(event) => updatePipelineStageName(index, event.target.value)}
                          placeholder={`Estágio ${index + 1}`}
                          disabled={pipelineFormLoading}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-destructive hover:text-destructive"
                          onClick={() => removePipelineStage(index)}
                          disabled={pipelineFormLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remover estágio</span>
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-center border-dashed"
                      onClick={addPipelineStage}
                      disabled={pipelineFormLoading}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Adicionar estágio
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setPipelineDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pipelineFormLoading}>
                  {pipelineFormLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
                    </span>
                  ) : (
                    'Salvar funil'
                  )}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {editingCard ? 'Editar oportunidade' : 'Nova oportunidade'}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-gray-500">
              Mantenha as informações atualizadas para priorizar o follow-up.
            </Dialog.Description>

            <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleCardSubmit}>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Contato / Empresa</label>
                <Input
                  value={cardForm.title}
                  onChange={(event) =>
                    setCardForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Ex.: Ana Souza - InovaTech"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Empresa</label>
                <Input
                  value={cardForm.companyName}
                  onChange={(event) =>
                    setCardForm((prev) => ({ ...prev, companyName: event.target.value }))
                  }
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Responsável</label>
                <Input
                  value={cardForm.owner}
                  onChange={(event) =>
                    setCardForm((prev) => ({ ...prev, owner: event.target.value }))
                  }
                  placeholder="Quem está cuidando"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Input
                  value={cardForm.status}
                  onChange={(event) =>
                    setCardForm((prev) => ({ ...prev, status: event.target.value }))
                  }
                  placeholder="Ex.: Qualificado, Em risco"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tag</label>
                <Input
                  value={cardForm.tag}
                  onChange={(event) =>
                    setCardForm((prev) => ({ ...prev, tag: event.target.value }))
                  }
                  placeholder="Ex.: Trial, Prioridade"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">MRR estimado (R$)</label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={cardForm.mrr}
                  onChange={(event) =>
                    setCardForm((prev) => ({ ...prev, mrr: event.target.value }))
                  }
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mensagens</label>
                <Input
                  type="number"
                  min={0}
                  value={cardForm.messagesCount}
                  onChange={(event) =>
                    setCardForm((prev) => ({ ...prev, messagesCount: event.target.value }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Último contato</label>
                <Input
                  type="datetime-local"
                  value={cardForm.lastMessageAt}
                  onChange={(event) =>
                    setCardForm((prev) => ({ ...prev, lastMessageAt: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Próxima ação</label>
                <Input
                  type="datetime-local"
                  value={cardForm.nextActionAt}
                  onChange={(event) =>
                    setCardForm((prev) => ({ ...prev, nextActionAt: event.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setCardDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )

}
