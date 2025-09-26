'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  ArrowUpRight,
  Edit2,
  Filter,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

type PipelineCard = {
  id: string
  stage_id: string
  title: string
  company_name: string | null
  owner: string | null
  plan: string | null
  status: string | null
  estimated_value: number | null
  messages_count: number
  last_interaction_at: string | null
  next_action_at: string | null
  note: string | null
  position: number
  created_at: string
  updated_at: string
}

type PipelineStage = {
  id: string
  name: string
  position: number
  created_at: string
  updated_at: string
  cards: PipelineCard[]
}

type Pipeline = {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  stages: PipelineStage[]
}

type PipelineFormState = {
  id: string | null
  name: string
  description: string
}

type StageFormState = {
  id: string | null
  name: string
}

type CardFormState = {
  id: string | null
  stageId: string | null
  title: string
  companyName: string
  owner: string
  plan: string
  status: string
  estimatedValue: string
  messagesCount: string
  note: string
}

const defaultPipelineForm: PipelineFormState = {
  id: null,
  name: '',
  description: '',
}

const defaultStageForm: StageFormState = {
  id: null,
  name: '',
}

const defaultCardForm: CardFormState = {
  id: null,
  stageId: null,
  title: '',
  companyName: '',
  owner: '',
  plan: '',
  status: 'Ativo',
  estimatedValue: '',
  messagesCount: '',
  note: '',
}

const statusBadges: Record<string, string> = {
  Ativo: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  Risco: 'bg-amber-50 text-amber-700 border border-amber-100',
  Perdido: 'bg-rose-50 text-rose-700 border border-rose-100',
}

function normalizeNumeric(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeInteger(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value)
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback
}

function parseNumberInput(value: string): number | null {
  if (!value) return null
  const parsed = Number(value.replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function parseIntegerInput(value: string): number {
  if (!value) return 0
  const parsed = Number(value.replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0
}

export default function SalesPipelinePage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pipelineDialogOpen, setPipelineDialogOpen] = useState(false)
  const [stageDialogOpen, setStageDialogOpen] = useState(false)
  const [cardDialogOpen, setCardDialogOpen] = useState(false)
  const [pipelineForm, setPipelineForm] = useState<PipelineFormState>(defaultPipelineForm)
  const [stageForm, setStageForm] = useState<StageFormState>(defaultStageForm)
  const [cardForm, setCardForm] = useState<CardFormState>(defaultCardForm)
  const [cardFormMode, setCardFormMode] = useState<'create' | 'edit'>('create')
  const previousBoardRef = useRef<Pipeline[] | null>(null)

  const selectedPipeline = useMemo(
    () => pipelines.find((pipeline) => pipeline.id === selectedPipelineId) ?? null,
    [pipelines, selectedPipelineId]
  )

  const loadPipelines = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pipelines', { cache: 'no-store' })
      if (!res.ok) {
        throw new Error('Não foi possível carregar os funis')
      }
      const rawData = (await res.json()) as Pipeline[]
      const normalized = rawData.map((pipeline) => ({
        ...pipeline,
        stages: (pipeline.stages ?? [])
          .map((stage) => ({
            ...stage,
            cards: (stage.cards ?? [])
              .map((card) => ({
                ...card,
                stage_id: card.stage_id ?? stage.id,
                estimated_value: normalizeNumeric(card.estimated_value),
                messages_count: normalizeInteger(card.messages_count),
              }))
              .sort((a, b) => a.position - b.position),
          }))
          .sort((a, b) => a.position - b.position),
      }))
      setPipelines(normalized)
      setSelectedPipelineId((current) => {
        if (normalized.length === 0) {
          return null
        }
        const isCurrentValid = current && normalized.some((pipeline) => pipeline.id === current)
        return isCurrentValid ? (current as string) : normalized[0].id
      })
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível carregar seus funis de vendas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPipelines()
  }, [loadPipelines])

  const resetPipelineForm = useCallback(() => {
    setPipelineForm(defaultPipelineForm)
  }, [])

  const resetStageForm = useCallback(() => {
    setStageForm(defaultStageForm)
  }, [])

  const resetCardForm = useCallback(() => {
    setCardForm(defaultCardForm)
    setCardFormMode('create')
  }, [])

  const handleOpenPipelineDialog = useCallback(
    (pipeline?: Pipeline) => {
      if (pipeline) {
        setPipelineForm({
          id: pipeline.id,
          name: pipeline.name,
          description: pipeline.description ?? '',
        })
      } else {
        resetPipelineForm()
      }
      setPipelineDialogOpen(true)
    },
    [resetPipelineForm]
  )

  const handleSubmitPipeline = useCallback(async () => {
    const payload = {
      name: pipelineForm.name.trim(),
      description: pipelineForm.description.trim(),
    }
    if (!payload.name) {
      toast.error('Informe um nome para o funil.')
      return
    }
    try {
      if (pipelineForm.id) {
        const res = await fetch(`/api/pipelines/${pipelineForm.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error()
        const updated = await res.json()
        setPipelines((prev) =>
          prev.map((pipeline) =>
            pipeline.id === updated.id
              ? { ...pipeline, name: updated.name, description: updated.description ?? null }
              : pipeline
          )
        )
        toast.success('Funil atualizado com sucesso!')
      } else {
        const res = await fetch('/api/pipelines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error()
        const created = await res.json()
        const normalized: Pipeline = {
          ...created,
          description: created.description ?? null,
          stages: [],
        }
        setPipelines((prev) => [...prev, normalized])
        setSelectedPipelineId(created.id)
        toast.success('Funil criado com sucesso!')
      }
      setPipelineDialogOpen(false)
      resetPipelineForm()
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível salvar o funil.')
    }
  }, [pipelineForm, resetPipelineForm])

  const handleDeletePipeline = useCallback(
    async (pipeline: Pipeline) => {
      const confirmation = window.confirm(
        `Deseja excluir o funil "${pipeline.name}"? Essa ação removerá todos os estágios e oportunidades relacionadas.`
      )
      if (!confirmation) return
      try {
        const res = await fetch(`/api/pipelines/${pipeline.id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error()
        setPipelines((prev) => {
          const filtered = prev.filter((item) => item.id !== pipeline.id)
          if (selectedPipelineId === pipeline.id) {
            setSelectedPipelineId(filtered.length ? filtered[0].id : null)
          }
          return filtered
        })
        toast.success('Funil excluído.')
      } catch (err) {
        console.error(err)
        toast.error('Não foi possível excluir o funil.')
      }
    },
    [selectedPipelineId]
  )

  const handleOpenStageDialog = useCallback(
    (stage?: PipelineStage) => {
      if (!selectedPipeline) {
        toast.error('Escolha um funil antes de adicionar estágios.')
        return
      }
      if (stage) {
        setStageForm({ id: stage.id, name: stage.name })
      } else {
        resetStageForm()
      }
      setStageDialogOpen(true)
    },
    [resetStageForm, selectedPipeline]
  )

  const handleSubmitStage = useCallback(async () => {
    if (!selectedPipeline) return
    const name = stageForm.name.trim()
    if (!name) {
      toast.error('Informe um nome para o estágio.')
      return
    }
    try {
      if (stageForm.id) {
        const res = await fetch(`/api/pipelines/${selectedPipeline.id}/stages/${stageForm.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        if (!res.ok) throw new Error()
        const updated = await res.json()
        setPipelines((prev) =>
          prev.map((pipeline) =>
            pipeline.id === selectedPipeline.id
              ? {
                  ...pipeline,
                  stages: pipeline.stages.map((stage) =>
                    stage.id === updated.id ? { ...stage, name: updated.name } : stage
                  ),
                }
              : pipeline
          )
        )
        toast.success('Estágio atualizado!')
      } else {
        const res = await fetch(`/api/pipelines/${selectedPipeline.id}/stages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        if (!res.ok) throw new Error()
        const created = await res.json()
        const newStage: PipelineStage = { ...created, cards: [] }
        setPipelines((prev) =>
          prev.map((pipeline) =>
            pipeline.id === selectedPipeline.id
              ? {
                  ...pipeline,
                  stages: [...pipeline.stages, newStage],
                }
              : pipeline
          )
        )
        toast.success('Estágio criado!')
      }
      setStageDialogOpen(false)
      resetStageForm()
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível salvar o estágio.')
    }
  }, [resetStageForm, selectedPipeline, stageForm])

  const handleDeleteStage = useCallback(
    async (stage: PipelineStage) => {
      if (!selectedPipeline) return
      const confirmation = window.confirm(
        `Deseja remover o estágio "${stage.name}" e todas as oportunidades associadas?`
      )
      if (!confirmation) return
      try {
        const res = await fetch(`/api/pipelines/${selectedPipeline.id}/stages/${stage.id}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error()
        setPipelines((prev) =>
          prev.map((pipeline) =>
            pipeline.id === selectedPipeline.id
              ? { ...pipeline, stages: pipeline.stages.filter((item) => item.id !== stage.id) }
              : pipeline
          )
        )
        toast.success('Estágio removido.')
      } catch (err) {
        console.error(err)
        toast.error('Não foi possível remover o estágio.')
      }
    },
    [selectedPipeline]
  )

  const handleOpenCardDialog = useCallback(
    (stage: PipelineStage, card?: PipelineCard) => {
      if (card) {
        setCardForm({
          id: card.id,
          stageId: stage.id,
          title: card.title,
          companyName: card.company_name ?? '',
          owner: card.owner ?? '',
          plan: card.plan ?? '',
          status: card.status ?? 'Ativo',
          estimatedValue: card.estimated_value != null ? String(card.estimated_value) : '',
          messagesCount: String(card.messages_count ?? 0),
          note: card.note ?? '',
        })
        setCardFormMode('edit')
      } else {
        setCardForm({ ...defaultCardForm, stageId: stage.id })
        setCardFormMode('create')
      }
      setCardDialogOpen(true)
    },
    []
  )

  const handleSubmitCard = useCallback(async () => {
    if (!selectedPipeline || !cardForm.stageId) {
      toast.error('Escolha um estágio válido para a oportunidade.')
      return
    }
    const payload = {
      stageId: cardForm.stageId,
      title: cardForm.title.trim(),
      companyName: cardForm.companyName.trim(),
      owner: cardForm.owner.trim(),
      plan: cardForm.plan.trim(),
      status: cardForm.status.trim(),
      estimatedValue: parseNumberInput(cardForm.estimatedValue),
      messagesCount: parseIntegerInput(cardForm.messagesCount),
      note: cardForm.note.trim(),
    }

    if (!payload.title) {
      toast.error('Informe um título para a oportunidade.')
      return
    }

    try {
      if (cardFormMode === 'edit' && cardForm.id) {
        const res = await fetch(
          `/api/pipelines/${selectedPipeline.id}/cards/${cardForm.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        )
        if (!res.ok) throw new Error()
        const updated = await res.json()
        setPipelines((prev) =>
          prev.map((pipeline) => {
            if (pipeline.id !== selectedPipeline.id) return pipeline
            return {
              ...pipeline,
              stages: pipeline.stages.map((stage) => ({
                ...stage,
                cards: stage.cards.map((card) =>
                  card.id === updated.id
                    ? {
                        ...card,
                        title: updated.title,
                        company_name: updated.company_name,
                        owner: updated.owner,
                        plan: updated.plan,
                        status: updated.status,
                        estimated_value: normalizeNumeric(updated.estimated_value),
                        messages_count: normalizeInteger(updated.messages_count),
                        note: updated.note,
                      }
                    : card
                ),
              })),
            }
          })
        )
        toast.success('Oportunidade atualizada!')
      } else {
        const res = await fetch(`/api/pipelines/${selectedPipeline.id}/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error()
        const created = await res.json()
        setPipelines((prev) =>
          prev.map((pipeline) =>
            pipeline.id === selectedPipeline.id
              ? {
                  ...pipeline,
                  stages: pipeline.stages.map((stage) =>
                    stage.id === created.stage_id
                      ? {
                          ...stage,
                          cards: [
                            ...stage.cards,
                            {
                              ...created,
                              stage_id: created.stage_id,
                              estimated_value: normalizeNumeric(created.estimated_value),
                              messages_count: normalizeInteger(created.messages_count),
                            },
                          ],
                        }
                      : stage
                  ),
                }
              : pipeline
          )
        )
        toast.success('Oportunidade criada!')
      }
      resetCardForm()
      setCardDialogOpen(false)
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível salvar a oportunidade.')
    }
  }, [cardForm, cardFormMode, resetCardForm, selectedPipeline])

  const handleDeleteCard = useCallback(
    async (stage: PipelineStage, card: PipelineCard) => {
      if (!selectedPipeline) return
      const confirmation = window.confirm(`Remover "${card.title}" do funil?`)
      if (!confirmation) return
      try {
        const res = await fetch(`/api/pipelines/${selectedPipeline.id}/cards/${card.id}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error()
        setPipelines((prev) =>
          prev.map((pipeline) =>
            pipeline.id === selectedPipeline.id
              ? {
                  ...pipeline,
                  stages: pipeline.stages.map((item) =>
                    item.id === stage.id
                      ? { ...item, cards: item.cards.filter((c) => c.id !== card.id) }
                      : item
                  ),
                }
              : pipeline
          )
        )
        toast.success('Oportunidade removida.')
      } catch (err) {
        console.error(err)
        toast.error('Não foi possível remover a oportunidade.')
      }
    },
    [selectedPipeline]
  )

  const cloneBoard = useCallback(
    (board: Pipeline[]): Pipeline[] =>
      board.map((pipeline) => ({
        ...pipeline,
        stages: pipeline.stages.map((stage) => ({
          ...stage,
          cards: stage.cards.map((card) => ({ ...card })),
        })),
      })),
    []
  )

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!selectedPipeline) return
      const { source, destination, draggableId } = result
      if (!destination) return
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return
      }

      setPipelines((prev) => {
        previousBoardRef.current = cloneBoard(prev)
        return prev.map((pipeline) => {
          if (pipeline.id !== selectedPipeline.id) return pipeline
          const stages = pipeline.stages.map((stage) => ({
            ...stage,
            cards: [...stage.cards],
          }))
          const sourceStage = stages.find((stage) => stage.id === source.droppableId)
          const destinationStage = stages.find((stage) => stage.id === destination.droppableId)
          if (!sourceStage || !destinationStage) {
            return pipeline
          }
          const cardIndex = sourceStage.cards.findIndex((card) => card.id === draggableId)
          if (cardIndex === -1) {
            return pipeline
          }
          const [moved] = sourceStage.cards.splice(cardIndex, 1)
          moved.stage_id = destinationStage.id
          const insertIndex = Math.max(0, Math.min(destination.index, destinationStage.cards.length))
          destinationStage.cards.splice(insertIndex, 0, moved)
          return { ...pipeline, stages }
        })
      })

      const payload = {
        cardId: draggableId,
        sourceStageId: source.droppableId,
        destinationStageId: destination.droppableId,
        destinationIndex: destination.index,
      }

      fetch(`/api/pipelines/${selectedPipeline.id}/cards`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Falha ao salvar reordenação')
          }
          previousBoardRef.current = null
        })
        .catch((err) => {
          console.error(err)
          toast.error('Não foi possível mover a oportunidade.')
          if (previousBoardRef.current) {
            setPipelines(cloneBoard(previousBoardRef.current))
            previousBoardRef.current = null
          }
        })
    },
    [cloneBoard, selectedPipeline]
  )

  const metrics = useMemo(() => {
    if (!selectedPipeline) {
      return {
        totalCards: 0,
        totalValue: 0,
        averageTicket: 0,
      }
    }
    const totals = selectedPipeline.stages.reduce(
      (acc, stage) => {
        const stageValue = stage.cards.reduce(
          (sum, card) => sum + (card.estimated_value ?? 0),
          0
        )
        return {
          totalCards: acc.totalCards + stage.cards.length,
          totalValue: acc.totalValue + stageValue,
        }
      },
      { totalCards: 0, totalValue: 0 }
    )
    return {
      ...totals,
      averageTicket:
        totals.totalCards > 0 ? Math.round(totals.totalValue / totals.totalCards) : 0,
    }
  }, [selectedPipeline])

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">CRM</p>
            <h1 className="text-2xl font-semibold">Funil de vendas</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => handleOpenPipelineDialog()}>
              <Plus className="h-4 w-4" /> Novo funil
            </Button>
            {selectedPipeline && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <MoreHorizontal className="h-4 w-4" /> Gerenciar funil
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="z-50 min-w-[180px] rounded-md border bg-white p-1 shadow">
                    <DropdownMenu.Item
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onSelect={() => handleOpenPipelineDialog(selectedPipeline)}
                    >
                      <Edit2 className="h-4 w-4" /> Editar funil
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm text-red-600 hover:bg-red-50"
                      onSelect={() => handleDeletePipeline(selectedPipeline)}
                    >
                      <Trash2 className="h-4 w-4" /> Excluir funil
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedPipelineId ?? ''}
            onValueChange={(value) => setSelectedPipelineId(value)}
            disabled={pipelines.length === 0}
          >
            <SelectTrigger className="w-[220px] bg-white">
              <SelectValue placeholder="Selecione o funil" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map((pipeline) => (
                <SelectItem key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select disabled>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Aquisição" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aqu">Aquisição</SelectItem>
            </SelectContent>
          </Select>

          <Select disabled>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Todos os donos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os donos</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="ml-auto flex items-center gap-2" disabled>
            <Filter className="h-4 w-4" /> Filtros avançados
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total de oportunidades</p>
          <div className="mt-2 flex items-end justify-between">
            <span className="text-3xl font-semibold">{metrics.totalCards}</span>
            <span className="text-xs text-emerald-600">+12% vs mês anterior</span>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Receita estimada</p>
          <div className="mt-2 flex items-end justify-between">
            <span className="text-3xl font-semibold">
              {currencyFormatter.format(metrics.totalValue)}
            </span>
            <span className="text-xs text-blue-600">Meta 45k</span>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Ticket médio</p>
          <div className="mt-2 flex items-end justify-between">
            <span className="text-3xl font-semibold">
              {currencyFormatter.format(metrics.averageTicket)}
            </span>
            <span className="text-xs text-gray-500">Últimos 30 dias</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="flex items-center gap-2 rounded-lg border bg-white px-4 py-3 text-gray-600 shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin" /> Carregando funil...
            </div>
          </div>
        ) : selectedPipeline ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {selectedPipeline.stages.map((stage) => {
                const stageValue = stage.cards.reduce(
                  (sum, card) => sum + (card.estimated_value ?? 0),
                  0
                )
                return (
                  <Droppable droppableId={stage.id} key={stage.id} type="card">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          'flex w-[320px] shrink-0 flex-col rounded-2xl border bg-white p-4 shadow-sm transition',
                          snapshot.isDraggingOver ? 'border-blue-200 ring-2 ring-blue-200' : 'border-gray-100'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-800">{stage.name}</h3>
                            <p className="text-xs text-gray-500">
                              {stage.cards.length} oportunidades · {currencyFormatter.format(stageValue)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-800"
                              onClick={() => handleOpenStageDialog(stage)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                              onClick={() => handleDeleteStage(stage)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 space-y-3">
                          {stage.cards.map((card, index) => (
                            <Draggable key={card.id} draggableId={card.id} index={index}>
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className={cn(
                                    'space-y-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition',
                                    dragSnapshot.isDragging && 'border-blue-300 shadow-lg'
                                  )}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{card.title}</p>
                                      <p className="text-xs text-gray-500">{card.company_name || 'Empresa não informada'}</p>
                                    </div>
                                    <span
                                      className={cn(
                                        'rounded-full px-2 py-1 text-[11px] font-medium',
                                        statusBadges[card.status ?? ''] || 'bg-gray-100 text-gray-600'
                                      )}
                                    >
                                      {card.status ?? 'Sem status'}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                    <div>
                                      <p className="font-semibold text-gray-500">Plano</p>
                                      <p>{card.plan || 'Não informado'}</p>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-500">Owner</p>
                                      <p>{card.owner || 'Não atribuído'}</p>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-500">Valor</p>
                                      <p>{currencyFormatter.format(card.estimated_value ?? 0)}</p>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-500">Mensagens</p>
                                      <p>{card.messages_count}</p>
                                    </div>
                                  </div>

                                  {card.note && (
                                    <p className="rounded-lg bg-gray-50 p-2 text-xs text-gray-600">
                                      {card.note}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 gap-1 px-2 text-xs text-blue-600"
                                      onClick={() => handleOpenCardDialog(stage, card)}
                                    >
                                      <Edit2 className="h-3.5 w-3.5" /> Editar
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 gap-1 px-2 text-xs text-red-600"
                                      onClick={() => handleDeleteCard(stage, card)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" /> Remover
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>

                        <Button
                          onClick={() => handleOpenCardDialog(stage)}
                          className="mt-3 h-9 justify-start gap-2 bg-gray-50 text-gray-700 hover:bg-gray-100"
                          variant="ghost"
                        >
                          <Plus className="h-4 w-4" /> Nova oportunidade
                        </Button>
                      </div>
                    )}
                  </Droppable>
                )
              })}

              <div className="flex h-fit w-[320px] shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/60 p-4 text-center text-sm text-gray-500">
                <p className="mb-2 font-medium">Adicionar estágio</p>
                <Button variant="outline" size="sm" onClick={() => handleOpenStageDialog()}>
                  <Plus className="h-4 w-4" /> Novo estágio
                </Button>
              </div>
            </div>
          </DragDropContext>
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-gray-200 bg-white/60 p-6 text-center">
            <p className="text-lg font-semibold text-gray-700">Crie seu primeiro funil de vendas</p>
            <p className="max-w-md text-sm text-gray-500">
              Estruture seus estágios, arraste oportunidades entre colunas e acompanhe suas metas comerciais em tempo real.
            </p>
            <Button onClick={() => handleOpenPipelineDialog()} className="gap-2">
              <Plus className="h-4 w-4" /> Criar funil
            </Button>
          </div>
        )}
      </div>

      <Dialog.Root open={pipelineDialogOpen} onOpenChange={setPipelineDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold">
              {pipelineForm.id ? 'Editar funil' : 'Novo funil'}
            </Dialog.Title>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="pipeline-name">
                  Nome do funil
                </label>
                <Input
                  id="pipeline-name"
                  placeholder="Ex.: Aquisição B2B"
                  value={pipelineForm.name}
                  onChange={(event) =>
                    setPipelineForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="pipeline-description">
                  Descrição (opcional)
                </label>
                <Textarea
                  id="pipeline-description"
                  rows={3}
                  placeholder="Contextualize como este funil será utilizado"
                  value={pipelineForm.description}
                  onChange={(event) =>
                    setPipelineForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPipelineDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitPipeline} className="gap-2">
                <ArrowUpRight className="h-4 w-4" /> Salvar
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={stageDialogOpen} onOpenChange={setStageDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold">
              {stageForm.id ? 'Editar estágio' : 'Novo estágio'}
            </Dialog.Title>
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="stage-name">
                Nome do estágio
              </label>
              <Input
                id="stage-name"
                placeholder="Ex.: Qualificação"
                value={stageForm.name}
                onChange={(event) => setStageForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStageDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitStage} className="gap-2">
                <ArrowUpRight className="h-4 w-4" /> Salvar
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={cardDialogOpen} onOpenChange={(open) => {
        setCardDialogOpen(open)
        if (!open) resetCardForm()
      }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold">
              {cardFormMode === 'edit' ? 'Editar oportunidade' : 'Nova oportunidade'}
            </Dialog.Title>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="card-title">
                  Título
                </label>
                <Input
                  id="card-title"
                  placeholder="Ex.: Proposta Ana Souza"
                  value={cardForm.title}
                  onChange={(event) => setCardForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="card-company">
                  Empresa
                </label>
                <Input
                  id="card-company"
                  placeholder="Nome da empresa"
                  value={cardForm.companyName}
                  onChange={(event) =>
                    setCardForm((prev) => ({ ...prev, companyName: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="card-owner">
                  Responsável
                </label>
                <Input
                  id="card-owner"
                  placeholder="Time ou pessoa"
                  value={cardForm.owner}
                  onChange={(event) => setCardForm((prev) => ({ ...prev, owner: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="card-plan">
                  Plano
                </label>
                <Input
                  id="card-plan"
                  placeholder="Ex.: Trial, Enterprise"
                  value={cardForm.plan}
                  onChange={(event) => setCardForm((prev) => ({ ...prev, plan: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select
                  value={cardForm.status}
                  onValueChange={(value) => setCardForm((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Risco">Risco</SelectItem>
                    <SelectItem value="Perdido">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="card-value">
                  Valor estimado (R$)
                </label>
                <Input
                  id="card-value"
                  placeholder="12000"
                  value={cardForm.estimatedValue}
                  onChange={(event) =>
                    setCardForm((prev) => ({ ...prev, estimatedValue: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="card-messages">
                  Nº de mensagens
                </label>
                <Input
                  id="card-messages"
                  placeholder="0"
                  value={cardForm.messagesCount}
                  onChange={(event) =>
                    setCardForm((prev) => ({ ...prev, messagesCount: event.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="card-note">
                  Observações
                </label>
                <Textarea
                  id="card-note"
                  rows={3}
                  placeholder="Próximos passos, objeções ou detalhes relevantes"
                  value={cardForm.note}
                  onChange={(event) => setCardForm((prev) => ({ ...prev, note: event.target.value }))}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCardDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitCard} className="gap-2">
                <ArrowUpRight className="h-4 w-4" /> Salvar oportunidade
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
