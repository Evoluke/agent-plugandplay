'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabasebrowser } from '@/lib/supabaseClient'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  Filter,
  X,
  ChevronDown,
  Loader2,
  Columns3,
  Users,
  Building2,
  Tag,
} from 'lucide-react'

interface CardRecord {
  id: string
  stage_id: string
  title: string
  company_name: string | null
  owner: string | null
  status: string | null
  priority: string | null
  amount: number | null
  mrr: number | null
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

interface StageRecord {
  id: string
  pipeline_id: string
  name: string
  position: number
  color: string
  probability: number | null
  cards: CardRecord[]
}

interface PipelineRecord {
  id: string
  company_id: string
  name: string
  description: string | null
  stages: StageRecord[]
}

interface PipelineFormState {
  name: string
  description: string
}

interface StageFormState {
  name: string
  color: string
  probability: string
  position: number
}

interface CardFormState {
  id?: string
  stage_id: string
  title: string
  company_name: string
  owner: string
  status: string
  priority: string
  amount: string
  mrr: string
  notes: string
}

type StageWithCards = StageRecord

type PipelineWithStages = PipelineRecord

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

const statusColor = (status: string | null) => {
  if (!status) return 'bg-gray-100 text-gray-600'
  const normalized = status.toLowerCase()
  if (normalized.includes('risco') || normalized.includes('perigo')) {
    return 'bg-red-100 text-red-700'
  }
  if (normalized.includes('ativo') || normalized.includes('ganho')) {
    return 'bg-emerald-100 text-emerald-700'
  }
  if (normalized.includes('trial') || normalized.includes('teste')) {
    return 'bg-indigo-100 text-indigo-700'
  }
  return 'bg-slate-100 text-slate-700'
}

const priorityColor = (priority: string | null) => {
  if (!priority) return 'bg-gray-50 text-gray-500'
  const normalized = priority.toLowerCase()
  if (normalized.includes('alta')) {
    return 'bg-orange-100 text-orange-700'
  }
  if (normalized.includes('media') || normalized.includes('média')) {
    return 'bg-amber-100 text-amber-700'
  }
  if (normalized.includes('baixa')) {
    return 'bg-teal-100 text-teal-700'
  }
  return 'bg-slate-100 text-slate-600'
}

const initialPipelineForm: PipelineFormState = {
  name: '',
  description: '',
}

const initialStageForm = (position: number): StageFormState => ({
  name: '',
  color: '#2F6F68',
  probability: '',
  position,
})

const initialCardForm = (stageId: string): CardFormState => ({
  stage_id: stageId,
  title: '',
  company_name: '',
  owner: '',
  status: '',
  priority: '',
  amount: '',
  mrr: '',
  notes: '',
})

export default function FunilVendasPage() {
  const [pipelines, setPipelines] = useState<PipelineWithStages[]>([])
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null)
  const [companyId, setCompanyId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pipelineDialogOpen, setPipelineDialogOpen] = useState(false)
  const [pipelineForm, setPipelineForm] = useState<PipelineFormState>(initialPipelineForm)
  const [editingPipelineId, setEditingPipelineId] = useState<string | null>(null)
  const [stageDialogOpen, setStageDialogOpen] = useState(false)
  const [stageForm, setStageForm] = useState<StageFormState>(initialStageForm(0))
  const [editingStageId, setEditingStageId] = useState<string | null>(null)
  const [cardDialogOpen, setCardDialogOpen] = useState(false)
  const [cardForm, setCardForm] = useState<CardFormState>(initialCardForm(''))
  const [filters, setFilters] = useState({ owner: 'todos', status: 'todos', search: '' })
  const [deleteContext, setDeleteContext] = useState<{ type: 'pipeline' | 'stage' | 'card'; id: string; name: string } | null>(
    null,
  )

  const hasActiveFilters = filters.owner !== 'todos' || filters.status !== 'todos' || filters.search.trim() !== ''

  const selectedPipeline = useMemo(() => {
    return pipelines.find((pipeline) => pipeline.id === selectedPipelineId) ?? null
  }, [pipelines, selectedPipelineId])

  const ownerOptions = useMemo(() => {
    const owners = new Set<string>()
    selectedPipeline?.stages.forEach((stage) => {
      stage.cards.forEach((card) => {
        if (card.owner) owners.add(card.owner)
      })
    })
    return Array.from(owners)
  }, [selectedPipeline])

  const statusOptions = useMemo(() => {
    const statuses = new Set<string>()
    selectedPipeline?.stages.forEach((stage) => {
      stage.cards.forEach((card) => {
        if (card.status) statuses.add(card.status)
      })
    })
    return Array.from(statuses)
  }, [selectedPipeline])

  const filteredStages = useMemo(() => {
    if (!selectedPipeline) return []
    return selectedPipeline.stages
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((stage) => ({
        ...stage,
        cards: stage.cards
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))
          .filter((card) => {
            const matchesOwner = filters.owner === 'todos' || card.owner === filters.owner
            const matchesStatus = filters.status === 'todos' || card.status === filters.status
            const searchTerm = filters.search.trim().toLowerCase()
            const matchesSearch =
              searchTerm.length === 0 ||
              card.title.toLowerCase().includes(searchTerm) ||
              (card.company_name ?? '').toLowerCase().includes(searchTerm) ||
              (card.owner ?? '').toLowerCase().includes(searchTerm)
            return matchesOwner && matchesStatus && matchesSearch
          })
      }))
  }, [filters, selectedPipeline])

  useEffect(() => {
    void loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabasebrowser.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: company } = await supabasebrowser
        .from('company')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!company) {
        setLoading(false)
        return
      }

      setCompanyId(company.id)

      const { data: pipelineData, error } = await supabasebrowser
        .from('pipeline')
        .select(
          `id, name, description, company_id,
           stages:stage(id, pipeline_id, name, position, color, probability, cards:card(id, stage_id, title, company_name, owner, status, priority, amount, mrr, notes, sort_order, created_at, updated_at))`
        )
        .eq('company_id', company.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      const normalized = (pipelineData ?? []).map((pipeline) => ({
        ...pipeline,
        stages: (pipeline.stages ?? [])
          .map((stage: StageWithCards) => ({
            ...stage,
            cards: (stage.cards ?? [])
              .map((card) => ({
                ...card,
                amount: card.amount ?? null,
                mrr: card.mrr ?? null,
              }))
              .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at)),
          }))
          .sort((a: StageWithCards, b: StageWithCards) => a.position - b.position),
      })) as PipelineWithStages[]

      setPipelines(normalized)
      setSelectedPipelineId((current) => {
        if (normalized.length === 0) {
          return null
        }
        if (current && normalized.some((pipeline) => pipeline.id === current)) {
          return current
        }
        return normalized[0].id
      })
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível carregar o funil de vendas.')
    } finally {
      setLoading(false)
    }
  }

  const openCreatePipelineDialog = () => {
    setEditingPipelineId(null)
    setPipelineForm(initialPipelineForm)
    setPipelineDialogOpen(true)
  }

  const openEditPipelineDialog = () => {
    if (!selectedPipeline) return
    setEditingPipelineId(selectedPipeline.id)
    setPipelineForm({
      name: selectedPipeline.name,
      description: selectedPipeline.description ?? '',
    })
    setPipelineDialogOpen(true)
  }

  const handleSubmitPipeline = async () => {
    if (!companyId) return
    if (!pipelineForm.name.trim()) {
      toast.error('Informe um nome para o funil.')
      return
    }

    setSaving(true)
    try {
      if (editingPipelineId) {
        const { error } = await supabasebrowser
          .from('pipeline')
          .update({
            name: pipelineForm.name.trim(),
            description: pipelineForm.description.trim() || null,
          })
          .eq('id', editingPipelineId)
        if (error) throw error
        toast.success('Funil atualizado com sucesso!')
      } else {
        const { data, error } = await supabasebrowser
          .from('pipeline')
          .insert({
            name: pipelineForm.name.trim(),
            description: pipelineForm.description.trim() || null,
            company_id: companyId,
          })
          .select('id')
          .single()
        if (error) throw error
        toast.success('Funil criado com sucesso!')
        if (data?.id) setSelectedPipelineId(data.id)
      }
      setPipelineDialogOpen(false)
      await loadInitialData()
    } catch (err) {
      console.error(err)
      toast.error('Ocorreu um erro ao salvar o funil.')
    } finally {
      setSaving(false)
    }
  }

  const openCreateStageDialog = () => {
    if (!selectedPipeline) return
    setEditingStageId(null)
    const nextPosition =
      selectedPipeline.stages.length > 0
        ? Math.max(...selectedPipeline.stages.map((stage) => stage.position)) + 1
        : 0
    setStageForm(initialStageForm(nextPosition))
    setStageDialogOpen(true)
  }

  const openEditStageDialog = (stage: StageWithCards) => {
    setEditingStageId(stage.id)
    setStageForm({
      name: stage.name,
      color: stage.color,
      probability: stage.probability != null ? String(stage.probability) : '',
      position: stage.position,
    })
    setStageDialogOpen(true)
  }

  const handleSubmitStage = async () => {
    if (!selectedPipeline) return
    if (!stageForm.name.trim()) {
      toast.error('Informe um nome para a etapa.')
      return
    }

    setSaving(true)
    try {
      if (editingStageId) {
        const { error } = await supabasebrowser
          .from('stage')
          .update({
            name: stageForm.name.trim(),
            color: stageForm.color,
            probability: stageForm.probability.trim() !== "" ? Number(stageForm.probability) : null,
            position: stageForm.position,
          })
          .eq('id', editingStageId)
        if (error) throw error
        toast.success('Etapa atualizada com sucesso!')
      } else {
        const { error } = await supabasebrowser.from('stage').insert({
          name: stageForm.name.trim(),
          color: stageForm.color,
          probability: stageForm.probability.trim() !== "" ? Number(stageForm.probability) : null,
          position: stageForm.position,
          pipeline_id: selectedPipeline.id,
        })
        if (error) throw error
        toast.success('Etapa criada com sucesso!')
      }
      setStageDialogOpen(false)
      await loadInitialData()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar a etapa.')
    } finally {
      setSaving(false)
    }
  }

  const openCreateCardDialog = (stageId: string) => {
    setCardForm(initialCardForm(stageId))
    setCardDialogOpen(true)
  }

  const openEditCardDialog = (card: CardRecord) => {
    setCardForm({
      id: card.id,
      stage_id: card.stage_id,
      title: card.title,
      company_name: card.company_name ?? '',
      owner: card.owner ?? '',
      status: card.status ?? '',
      priority: card.priority ?? '',
      amount: card.amount != null ? String(card.amount) : '',
      mrr: card.mrr != null ? String(card.mrr) : '',
      notes: card.notes ?? '',
    })
    setCardDialogOpen(true)
  }

  const handleSubmitCard = async () => {
    if (!cardForm.title.trim()) {
      toast.error('Informe um título para a oportunidade.')
      return
    }
    if (!selectedPipeline) return

    setSaving(true)
    try {
      if (cardForm.id) {
        const { error } = await supabasebrowser
          .from('card')
          .update({
            stage_id: cardForm.stage_id,
            title: cardForm.title.trim(),
            company_name: cardForm.company_name.trim() || null,
            owner: cardForm.owner.trim() || null,
            status: cardForm.status.trim() || null,
            priority: cardForm.priority.trim() || null,
            amount: cardForm.amount.trim() !== "" ? Number(cardForm.amount) : null,
            mrr: cardForm.mrr.trim() !== "" ? Number(cardForm.mrr) : null,
            notes: cardForm.notes.trim() || null,
          })
          .eq('id', cardForm.id)
        if (error) throw error
        toast.success('Oportunidade atualizada!')
      } else {
        const stage = selectedPipeline.stages.find((item) => item.id === cardForm.stage_id)
        const nextOrder = stage ? stage.cards.length : 0
        const { error } = await supabasebrowser.from('card').insert({
          stage_id: cardForm.stage_id,
          title: cardForm.title.trim(),
          company_name: cardForm.company_name.trim() || null,
          owner: cardForm.owner.trim() || null,
          status: cardForm.status.trim() || null,
          priority: cardForm.priority.trim() || null,
          amount: cardForm.amount.trim() !== "" ? Number(cardForm.amount) : null,
          mrr: cardForm.mrr.trim() !== "" ? Number(cardForm.mrr) : null,
          notes: cardForm.notes.trim() || null,
          sort_order: nextOrder,
        })
        if (error) throw error
        toast.success('Oportunidade criada!')
      }
      setCardDialogOpen(false)
      await loadInitialData()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar a oportunidade.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (type: 'pipeline' | 'stage' | 'card', id: string, name: string) => {
    setDeleteContext({ type, id, name })
  }

  const handleDelete = async () => {
    if (!deleteContext) return
    setSaving(true)
    try {
      if (deleteContext.type === 'pipeline') {
        const { error } = await supabasebrowser.from('pipeline').delete().eq('id', deleteContext.id)
        if (error) throw error
        toast.success('Funil removido.')
      } else if (deleteContext.type === 'stage') {
        const { error } = await supabasebrowser.from('stage').delete().eq('id', deleteContext.id)
        if (error) throw error
        toast.success('Etapa removida.')
      } else {
        const { error } = await supabasebrowser.from('card').delete().eq('id', deleteContext.id)
        if (error) throw error
        toast.success('Oportunidade removida.')
      }
      setDeleteContext(null)
      await loadInitialData()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao excluir o registro.')
    } finally {
      setSaving(false)
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!selectedPipeline) return
    const { destination, source } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return
    if (hasActiveFilters) {
      toast.warning('Remova os filtros para reordenar as oportunidades.')
      return
    }

    const updates: { id: string; stage_id: string; sort_order: number }[] = []
    const processedStageIds = new Set<string>()

    setPipelines((prev) =>
      prev.map((pipeline) => {
        if (pipeline.id !== selectedPipeline.id) return pipeline
        const stages = pipeline.stages.map((stage) => ({
          ...stage,
          cards: stage.cards.map((card) => ({ ...card })),
        }))

        const sourceStageIndex = stages.findIndex((stage) => stage.id === source.droppableId)
        const destinationStageIndex = stages.findIndex((stage) => stage.id === destination.droppableId)
        if (sourceStageIndex === -1 || destinationStageIndex === -1) return pipeline

        const [movedCard] = stages[sourceStageIndex].cards.splice(source.index, 1)
        if (!movedCard) return pipeline

        movedCard.stage_id = stages[destinationStageIndex].id
        stages[destinationStageIndex].cards.splice(destination.index, 0, movedCard)

        const stageIdsToUpdate = [stages[sourceStageIndex], stages[destinationStageIndex]]
        stageIdsToUpdate.forEach((stage) => {
          if (!stage || processedStageIds.has(stage.id)) return
          stage.cards = stage.cards.map((card, index) => {
            const updated = { ...card, sort_order: index }
            updates.push({ id: updated.id, stage_id: updated.stage_id, sort_order: index })
            return updated
          })
          processedStageIds.add(stage.id)
        })

        return { ...pipeline, stages }
      }),
    )

    if (updates.length === 0) return

    try {
      const { error } = await supabasebrowser.from('card').upsert(updates)
      if (error) throw error
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível atualizar a posição das oportunidades.')
      await loadInitialData()
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando funil de vendas...
      </div>
    )
  }

  if (!selectedPipeline) {
    return (
      <div className="space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Funil de vendas</h1>
            <p className="mt-1 text-sm text-slate-600">
              Crie seu primeiro funil para começar a organizar as oportunidades em etapas do processo comercial.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreatePipelineDialog}
            className="inline-flex items-center gap-2 rounded-md bg-[#2F6F68] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#255853]"
          >
            <Plus className="h-4 w-4" /> Novo funil
          </button>
        </header>
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
          <Columns3 className="mx-auto h-8 w-8 text-[#2F6F68]" />
          <h2 className="mt-4 text-lg font-semibold text-slate-800">Nenhum funil cadastrado</h2>
          <p className="mt-2 text-sm text-slate-600">
            Estruture estágios como &quot;Novo lead&quot;, &quot;Qualificação&quot; e mova oportunidades com arrastar e soltar.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={openCreatePipelineDialog}
              className="inline-flex items-center gap-2 rounded-md border border-[#2F6F68] px-4 py-2 text-sm font-medium text-[#2F6F68] hover:bg-[#2F6F68]/10"
            >
              <Plus className="h-4 w-4" /> Criar funil agora
            </button>
          </div>
        </div>
        <PipelineDialog
          open={pipelineDialogOpen}
          onOpenChange={setPipelineDialogOpen}
          form={pipelineForm}
          setForm={setPipelineForm}
          onSubmit={handleSubmitPipeline}
          saving={saving}
          isEditing={Boolean(editingPipelineId)}
        />
        <StageDialog
          open={stageDialogOpen}
          onOpenChange={setStageDialogOpen}
          form={stageForm}
          setForm={setStageForm}
          onSubmit={handleSubmitStage}
          saving={saving}
          isEditing={Boolean(editingStageId)}
          disablePosition
        />
        <CardDialog
          open={cardDialogOpen}
          onOpenChange={setCardDialogOpen}
          form={cardForm}
          setForm={setCardForm}
          stages={selectedPipeline?.stages ?? []}
          onSubmit={handleSubmitCard}
          saving={saving}
        />
        <DeleteDialog context={deleteContext} onOpenChange={setDeleteContext} onConfirm={handleDelete} saving={saving} />
      </div>
    )
  }

  const totalCards = selectedPipeline.stages.reduce((count, stage) => count + stage.cards.length, 0)
  const totalMRR = selectedPipeline.stages.reduce((total, stage) => {
    return (
      total +
      stage.cards.reduce((sum, card) => {
        return sum + (card.mrr ?? 0)
      }, 0)
    )
  }, 0)

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Funil de vendas</h1>
            <p className="mt-1 text-sm text-slate-600">
              Organize oportunidades por estágio, acompanhe responsáveis e arraste cards entre colunas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openEditPipelineDialog}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" /> Editar funil
            </button>
            <button
              type="button"
              onClick={() => confirmDelete('pipeline', selectedPipeline.id, selectedPipeline.name)}
              className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Excluir funil
            </button>
            <button
              type="button"
              onClick={openCreatePipelineDialog}
              className="inline-flex items-center gap-2 rounded-md bg-[#2F6F68] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#255853]"
            >
              <Plus className="h-4 w-4" /> Novo funil
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Funil ativo</span>
            <div className="relative">
              <select
                value={selectedPipeline.id}
                onChange={(event) => setSelectedPipelineId(event.target.value)}
                className="appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 pr-8 text-sm font-medium text-slate-800 focus:border-[#2F6F68] focus:outline-none"
              >
                {pipelines.map((pipeline) => (
                  <option key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div className="h-6 w-px bg-slate-200" aria-hidden />
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1">
              <Columns3 className="h-4 w-4 text-[#2F6F68]" /> {selectedPipeline.stages.length} etapas
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-4 w-4 text-[#2F6F68]" /> {totalCards} oportunidades
            </span>
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-4 w-4 text-[#2F6F68]" /> {currencyFormatter.format(totalMRR)} MRR
            </span>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
              <Filter className="h-4 w-4 text-slate-400" />
              <span>Filtros</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filters.owner}
                onChange={(event) => setFilters((current) => ({ ...current, owner: event.target.value }))}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#2F6F68] focus:outline-none"
              >
                <option value="todos">Responsável</option>
                {ownerOptions.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
              <select
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#2F6F68] focus:outline-none"
              >
                <option value="todos">Status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <input
                type="search"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                placeholder="Buscar por cliente ou nota"
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#2F6F68] focus:outline-none"
              />
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => setFilters({ owner: 'todos', status: 'todos', search: '' })}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  <X className="h-3 w-3" /> Limpar filtros
                </button>
              )}
            </div>
          </div>
        </div>
        {hasActiveFilters && (
          <p className="text-xs text-slate-500">
            * Arrastar e soltar está desativado enquanto filtros estiverem aplicados.
          </p>
        )}
      </header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex min-h-[60vh] gap-4 overflow-x-auto pb-4">
          {filteredStages.map((stage) => (
            <Droppable
              key={stage.id}
              droppableId={stage.id}
              isDropDisabled={hasActiveFilters}
              direction="vertical"
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex w-80 flex-shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition ${
                    snapshot.isDraggingOver ? 'border-[#2F6F68] bg-emerald-50' : ''
                  }`}
                >
                  <div
                    className="flex items-start justify-between rounded-t-xl px-4 py-3"
                    style={{ backgroundColor: stage.color }}
                  >
                    <div>
                      <h2 className="text-sm font-semibold text-white">{stage.name}</h2>
                      <p className="text-xs text-white/80">
                        {stage.cards.length} oportunidades ·{' '}
                        {currencyFormatter.format(
                          stage.cards.reduce((total, card) => total + (card.mrr ?? 0), 0),
                        )}{' '}
                        MRR
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {stage.probability != null && (
                        <span className="rounded-full bg-white/20 px-2 py-1 text-[11px] font-semibold uppercase text-white">
                          {stage.probability}%
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => openEditStageDialog(stage)}
                        className="rounded-md bg-white/15 p-1 text-white transition hover:bg-white/25"
                        title="Editar etapa"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDelete('stage', stage.id, stage.name)}
                        className="rounded-md bg-white/15 p-1 text-white transition hover:bg-white/25"
                        title="Excluir etapa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
                    {stage.cards.length === 0 && (
                      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center text-xs text-slate-500">
                        Arraste oportunidades para cá ou cadastre uma nova.
                      </div>
                    )}
                    {stage.cards.map((card, index) => (
                      <Draggable
                        key={card.id}
                        draggableId={card.id}
                        index={index}
                        isDragDisabled={hasActiveFilters}
                      >
                        {(draggableProvided, snapshotDrag) => (
                          <article
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            {...draggableProvided.dragHandleProps}
                            className={`group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition ${
                              snapshotDrag.isDragging ? 'border-[#2F6F68] shadow-md' : 'hover:border-[#2F6F68]/60'
                            }`}
                          >
                            <header className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
                                {card.company_name && (
                                  <p className="text-xs text-slate-500">{card.company_name}</p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => openEditCardDialog(card)}
                                className="hidden rounded-md border border-slate-200 bg-white p-1 text-slate-500 shadow-sm transition group-hover:flex hover:border-[#2F6F68] hover:text-[#2F6F68]"
                                title="Editar oportunidade"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </header>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                              {card.status && (
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium ${statusColor(card.status)}`}>
                                  <Tag className="h-3 w-3" /> {card.status}
                                </span>
                              )}
                              {card.priority && (
                                <span className={`inline-flex items-center rounded-full px-2 py-1 font-medium ${priorityColor(card.priority)}`}>
                                  {card.priority}
                                </span>
                              )}
                              {card.owner && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">
                                  <Users className="h-3 w-3" /> {card.owner}
                                </span>
                              )}
                            </div>
                            <dl className="mt-4 space-y-2 text-xs text-slate-600">
                              {card.mrr != null && (
                                <div className="flex items-center justify-between">
                                  <dt className="font-medium">MRR</dt>
                                  <dd>{currencyFormatter.format(card.mrr)}</dd>
                                </div>
                              )}
                              {card.amount != null && (
                                <div className="flex items-center justify-between">
                                  <dt className="font-medium">Valor total</dt>
                                  <dd>{currencyFormatter.format(card.amount)}</dd>
                                </div>
                              )}
                              {card.notes && (
                                <div>
                                  <dt className="font-medium text-slate-500">Próximos passos</dt>
                                  <dd className="mt-1 whitespace-pre-wrap text-slate-600">{card.notes}</dd>
                                </div>
                              )}
                            </dl>
                            <footer className="mt-4 flex justify-end">
                              <button
                                type="button"
                                onClick={() => confirmDelete('card', card.id, card.title)}
                                className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 shadow-sm transition hover:bg-red-50"
                              >
                                Excluir
                              </button>
                            </footer>
                          </article>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                  <div className="border-t border-slate-200 bg-white px-3 py-3">
                    <button
                      type="button"
                      onClick={() => openCreateCardDialog(stage.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#2F6F68] px-3 py-2 text-xs font-medium text-[#2F6F68] transition hover:bg-[#2F6F68]/10"
                    >
                      <Plus className="h-3 w-3" /> Nova oportunidade
                    </button>
                  </div>
                </div>
              )}
            </Droppable>
          ))}
          <div className="flex h-full min-h-[20rem] w-80 flex-shrink-0 items-start justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6">
            <button
              type="button"
              onClick={openCreateStageDialog}
              className="flex h-full w-full flex-col items-center justify-center gap-3 text-center"
            >
              <Plus className="h-8 w-8 rounded-full bg-[#2F6F68] p-1 text-white" />
              <span className="text-sm font-semibold text-slate-700">Adicionar nova etapa</span>
              <span className="text-xs text-slate-500">
                Defina estágios como &quot;Qualificação&quot; ou &quot;Negociação&quot; para acompanhar o avanço das oportunidades.
              </span>
            </button>
          </div>
        </div>
      </DragDropContext>

      <PipelineDialog
        open={pipelineDialogOpen}
        onOpenChange={setPipelineDialogOpen}
        form={pipelineForm}
        setForm={setPipelineForm}
        onSubmit={handleSubmitPipeline}
        saving={saving}
        isEditing={Boolean(editingPipelineId)}
      />
      <StageDialog
        open={stageDialogOpen}
        onOpenChange={setStageDialogOpen}
        form={stageForm}
        setForm={setStageForm}
        onSubmit={handleSubmitStage}
        saving={saving}
        isEditing={Boolean(editingStageId)}
      />
      <CardDialog
        open={cardDialogOpen}
        onOpenChange={setCardDialogOpen}
        form={cardForm}
        setForm={setCardForm}
        stages={selectedPipeline.stages}
        onSubmit={handleSubmitCard}
        saving={saving}
      />
      <DeleteDialog context={deleteContext} onOpenChange={setDeleteContext} onConfirm={handleDelete} saving={saving} />
    </div>
  )
}

interface PipelineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: PipelineFormState
  setForm: (form: PipelineFormState) => void
  onSubmit: () => void
  saving: boolean
  isEditing: boolean
}

function PipelineDialog({ open, onOpenChange, form, setForm, onSubmit, saving, isEditing }: PipelineDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 space-y-5 rounded-xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-slate-900">
            {isEditing ? 'Editar funil de vendas' : 'Criar novo funil'}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-slate-600">
            Defina um nome fácil de reconhecer. Você poderá adicionar etapas e oportunidades depois.
          </Dialog.Description>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Nome do funil
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Ex.: Aquisição de novos clientes"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#2F6F68] focus:outline-none"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Descrição
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Explique como este funil é utilizado pela equipe comercial"
                rows={3}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#2F6F68] focus:outline-none"
              />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={onSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-[#2F6F68] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#255853] disabled:cursor-not-allowed disabled:bg-[#2F6F68]/60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} {isEditing ? 'Salvar alterações' : 'Criar funil'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

interface StageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: StageFormState
  setForm: (form: StageFormState) => void
  onSubmit: () => void
  saving: boolean
  isEditing: boolean
  disablePosition?: boolean
}

function StageDialog({ open, onOpenChange, form, setForm, onSubmit, saving, isEditing, disablePosition }: StageDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 space-y-5 rounded-xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-slate-900">
            {isEditing ? 'Editar etapa do funil' : 'Nova etapa'}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-slate-600">
            Escolha um nome descritivo e, se desejar, ajuste a cor exibida na coluna.
          </Dialog.Description>
          <div className="grid gap-4">
            <label className="block text-sm font-medium text-slate-700">
              Nome da etapa
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Ex.: Qualificação"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#2F6F68] focus:outline-none"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium text-slate-700">
                Cor da coluna
                <input
                  type="color"
                  value={form.color}
                  onChange={(event) => setForm({ ...form, color: event.target.value })}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 p-1"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Probabilidade (%)
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.probability}
                  onChange={(event) => setForm({ ...form, probability: event.target.value })}
                  placeholder="Opcional"
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#2F6F68] focus:outline-none"
                />
              </label>
            </div>
            {!disablePosition && (
              <label className="block text-sm font-medium text-slate-700">
                Ordem da etapa
                <input
                  type="number"
                  min={0}
                  value={form.position}
                  onChange={(event) => setForm({ ...form, position: Number(event.target.value) })}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#2F6F68] focus:outline-none"
                />
              </label>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={onSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-[#2F6F68] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#255853] disabled:cursor-not-allowed disabled:bg-[#2F6F68]/60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} {isEditing ? 'Salvar alterações' : 'Criar etapa'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

interface CardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: CardFormState
  setForm: (form: CardFormState) => void
  stages: StageRecord[]
  onSubmit: () => void
  saving: boolean
}

function CardDialog({ open, onOpenChange, form, setForm, stages, onSubmit, saving }: CardDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 space-y-5 rounded-xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-slate-900">
            {form.id ? 'Editar oportunidade' : 'Nova oportunidade'}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-slate-600">
            Utilize campos complementares para manter o contexto da negociação sempre atualizado.
          </Dialog.Description>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Etapa do funil
              <select
                value={form.stage_id}
                onChange={(event) => setForm({ ...form, stage_id: event.target.value })}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#2F6F68] focus:outline-none"
              >
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Título da oportunidade
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Ex.: Implementação Evoluke na empresa XPTO"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#2F6F68] focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Empresa / Contato
              <input
                type="text"
                value={form.company_name}
                onChange={(event) => setForm({ ...form, company_name: event.target.value })}
                placeholder="Nome da empresa ou do contato principal"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#2F6F68] focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Responsável
              <input
                type="text"
                value={form.owner}
                onChange={(event) => setForm({ ...form, owner: event.target.value })}
                placeholder="Quem está cuidando desta negociação"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#2F6F68] focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Status
              <input
                type="text"
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
                placeholder="Ex.: Ativo, Em risco, Trial"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#2F6F68] focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Prioridade
              <input
                type="text"
                value={form.priority}
                onChange={(event) => setForm({ ...form, priority: event.target.value })}
                placeholder="Alta, Média ou Baixa"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#2F6F68] focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Valor total (R$)
              <input
                type="number"
                min="0"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                placeholder="0"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#2F6F68] focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              MRR (R$)
              <input
                type="number"
                min="0"
                value={form.mrr}
                onChange={(event) => setForm({ ...form, mrr: event.target.value })}
                placeholder="0"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#2F6F68] focus:outline-none"
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Próximos passos
            <textarea
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="Resumo do que foi combinado ou próximos passos"
              rows={4}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#2F6F68] focus:outline-none"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={onSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-[#2F6F68] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#255853] disabled:cursor-not-allowed disabled:bg-[#2F6F68]/60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} {form.id ? 'Salvar alterações' : 'Criar oportunidade'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

interface DeleteDialogProps {
  context: { type: 'pipeline' | 'stage' | 'card'; id: string; name: string } | null
  onOpenChange: (context: DeleteDialogProps['context']) => void
  onConfirm: () => void
  saving: boolean
}

function DeleteDialog({ context, onOpenChange, onConfirm, saving }: DeleteDialogProps) {
  return (
    <Dialog.Root
      open={Boolean(context)}
      onOpenChange={(open) => {
        if (!open) onOpenChange(null)
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 space-y-5 rounded-xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-slate-900">Confirmar exclusão</Dialog.Title>
          <Dialog.Description className="text-sm text-slate-600">
            {context?.type === 'pipeline' &&
              `Tem certeza que deseja remover o funil "${context?.name}"? Todas as etapas e oportunidades serão apagadas.`}
            {context?.type === 'stage' &&
              `Ao remover a etapa "${context?.name}" todas as oportunidades relacionadas serão excluídas.`}
            {context?.type === 'card' &&
              `Esta oportunidade será removida do funil. Você poderá cadastrá-la novamente quando quiser.`}
          </Dialog.Description>
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Remover
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
