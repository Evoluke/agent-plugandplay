'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { Loader2, MoreHorizontal, Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { CardDialog } from './components/card-dialog'
import { PipelineDialog } from './components/pipeline-dialog'
import { StageColumn } from './components/stage-column'
import {
  createEmptyStage,
  createInitialCardForm,
  createInitialPipelineForm,
  normalizeStageColor,
  reindexStages,
} from './helpers'
import {
  CardFormState,
  Company,
  DealCard,
  Pipeline,
  PipelineFormState,
  Stage,
} from './types'
import {
  CARD_CONTACT_MAX_LENGTH,
  MAX_PIPELINES_PER_COMPANY,
  MAX_STAGES_PER_PIPELINE,
  PIPELINE_DESCRIPTION_MAX_LENGTH,
  PIPELINE_NAME_MAX_LENGTH,
  STAGE_NAME_MAX_LENGTH,
} from './constants'

const DEFAULT_PIPELINE_IDENTIFIER = 'agent_default_pipeline'
const DEFAULT_PIPELINE_NAME = 'Funil da do Agente'
const DEFAULT_STAGE_PRESETS = [
  { name: 'Entrada', color: '#E0F2FE' },
  { name: 'Atendimento Humano', color: '#FCE7F3' },
  { name: 'Qualificado', color: '#FEF3C7' },
]

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
  const [pipelinesLoading, setPipelinesLoading] = useState(true)
  const [boardLoading, setBoardLoading] = useState(false)

  const [pipelineDialogOpen, setPipelineDialogOpen] = useState(false)
  const [pipelineForm, setPipelineForm] = useState<PipelineFormState>(createInitialPipelineForm())
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null)
  const [pipelineFormLoading, setPipelineFormLoading] = useState(false)

  const [cardDialogOpen, setCardDialogOpen] = useState(false)
  const [cardForm, setCardForm] = useState<CardFormState>(createInitialCardForm())
  const [editingCard, setEditingCard] = useState<DealCard | null>(null)
  const [cardStageId, setCardStageId] = useState<string | null>(null)
  const [isRefreshCoolingDown, setIsRefreshCoolingDown] = useState(false)
  const refreshCooldownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearRefreshCooldown = useCallback(() => {
    if (refreshCooldownTimeoutRef.current) {
      clearTimeout(refreshCooldownTimeoutRef.current)
      refreshCooldownTimeoutRef.current = null
    }
    setIsRefreshCoolingDown(false)
  }, [])

  const closePipelineDialog = useCallback(() => {
    setPipelineDialogOpen(false)
    setEditingPipeline(null)
    setPipelineForm(createInitialPipelineForm())
    setPipelineFormLoading(false)
  }, [])

  const loadBoard = useCallback(async (pipelineId: string) => {
    setBoardLoading(true)
    const [{ data: stageData, error: stageError }, { data: cardData, error: cardError }] = await Promise.all([
      supabasebrowser
        .from('stage')
        .select('id, name, position, pipeline_id, color')
        .eq('pipeline_id', pipelineId)
        .order('position', { ascending: true }),
      supabasebrowser
        .from('card')
        .select('id, contact, position, stage_id, pipeline_id')
        .eq('pipeline_id', pipelineId)
        .order('position', { ascending: true }),
    ])

    if (stageError || cardError) {
      console.error(stageError || cardError)
      toast.error('Erro ao carregar as oportunidades do funil.')
      setBoardLoading(false)
      return
    }

    const normalizedStages = (stageData ?? []).map((stage) => ({
      ...stage,
      color: normalizeStageColor(stage.color),
    }))

    setStages(normalizedStages)
    setCards(cardData ?? [])
    setBoardLoading(false)
  }, [])

  const handleManualRefresh = useCallback(() => {
    if (!selectedPipelineId) {
      toast.error('Selecione um funil para atualizar.')
      return
    }

    setIsRefreshCoolingDown(true)
    if (refreshCooldownTimeoutRef.current) {
      clearTimeout(refreshCooldownTimeoutRef.current)
    }
    refreshCooldownTimeoutRef.current = setTimeout(() => {
      setIsRefreshCoolingDown(false)
      refreshCooldownTimeoutRef.current = null
    }, 10_000)

    void loadBoard(selectedPipelineId)
  }, [loadBoard, selectedPipelineId])

  const closeCardDialog = useCallback(() => {
    setCardDialogOpen(false)
    setEditingCard(null)
    setCardStageId(null)
    setCardForm(createInitialCardForm())
  }, [])

  const openCreatePipelineDialog = useCallback(() => {
    if (pipelines.length >= MAX_PIPELINES_PER_COMPANY) {
      toast.error('Você atingiu o limite de funis para esta empresa.')
      return
    }
    setEditingPipeline(null)
    setPipelineForm(createInitialPipelineForm())
    setPipelineFormLoading(false)
    setPipelineDialogOpen(true)
  }, [pipelines])

  const openEditPipelineDialog = useCallback(async (pipeline: Pipeline) => {
    if (pipeline.identifier === DEFAULT_PIPELINE_IDENTIFIER) {
      toast.error('O funil padrão não pode ser editado.')
      return
    }

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
      .select('id, name, position, color')
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
      color: normalizeStageColor(stage.color),
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
    setPipelineForm((prev) => {
      if (prev.stages.length >= MAX_STAGES_PER_PIPELINE) {
        toast.error('Cada funil pode ter no máximo 10 estágios.')
        return prev
      }

      return {
        ...prev,
        stages: reindexStages([...prev.stages, createEmptyStage(prev.stages.length)]),
      }
    })
  }, [])

  const updatePipelineStageName = useCallback((index: number, name: string) => {
    setPipelineForm((prev) => {
      const nextStages = prev.stages.map((stage, stageIndex) =>
        stageIndex === index ? { ...stage, name } : stage
      )
      return { ...prev, stages: nextStages }
    })
  }, [])

  const updatePipelineStageColor = useCallback((index: number, color: string) => {
    setPipelineForm((prev) => {
      const nextStages = prev.stages.map((stage, stageIndex) =>
        stageIndex === index ? { ...stage, color: normalizeStageColor(color) } : stage
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

  const syncDefaultPipelineStages = useCallback(async (pipelineId: string) => {
    const { data: existingStages, error } = await supabasebrowser
      .from('stage')
      .select('id, name, position, color')
      .eq('pipeline_id', pipelineId)
      .order('position', { ascending: true })

    if (error) throw error

    const remainingStages = [...(existingStages ?? [])]
    const updates: { id: string; name: string; position: number; color: string }[] = []
    const inserts: {
      name: string
      position: number
      pipeline_id: string
      color: string
    }[] = []

    DEFAULT_STAGE_PRESETS.forEach(({ name: stageName, color }, index) => {
      const normalizedColor = normalizeStageColor(color)
      const matchIndex = remainingStages.findIndex((stage) => stage.name === stageName)
      if (matchIndex >= 0) {
        const matchedStage = remainingStages.splice(matchIndex, 1)[0]
        const matchedColor = normalizeStageColor(matchedStage.color)
        if (
          matchedStage.name !== stageName ||
          matchedStage.position !== index ||
          matchedColor !== normalizedColor
        ) {
          updates.push({
            id: matchedStage.id,
            name: stageName,
            position: index,
            color: normalizedColor,
          })
        }
      } else {
        inserts.push({
          name: stageName,
          position: index,
          pipeline_id: pipelineId,
          color: normalizedColor,
        })
      }
    })

    for (const stage of updates) {
      const { error: updateError } = await supabasebrowser
        .from('stage')
        .update({ name: stage.name, position: stage.position, color: stage.color })
        .eq('id', stage.id)
      if (updateError) throw updateError
    }

    if (inserts.length) {
      const { error: insertError } = await supabasebrowser.from('stage').insert(inserts)
      if (insertError) throw insertError
    }

    if (remainingStages.length) {
      const { error: deleteError } = await supabasebrowser
        .from('stage')
        .delete()
        .in(
          'id',
          remainingStages.map((stage) => stage.id)
        )
      if (deleteError) throw deleteError
    }
  }, [])

  const ensureDefaultPipeline = useCallback(
    async (companyId: number) => {
      try {
        const { data: existingDefault, error: existingDefaultError } = await supabasebrowser
          .from('pipeline')
          .select('id, name')
          .eq('company_id', companyId)
          .eq('identifier', DEFAULT_PIPELINE_IDENTIFIER)
          .maybeSingle()

        if (existingDefaultError) throw existingDefaultError

        if (existingDefault?.id) {
          if (existingDefault.name !== DEFAULT_PIPELINE_NAME) {
            const { error: updateNameError } = await supabasebrowser
              .from('pipeline')
              .update({ name: DEFAULT_PIPELINE_NAME })
              .eq('id', existingDefault.id)
            if (updateNameError) throw updateNameError
          }

          await syncDefaultPipelineStages(existingDefault.id)
          return existingDefault.id
        }

        const { data: legacyDefault, error: legacyDefaultError } = await supabasebrowser
          .from('pipeline')
          .select('id')
          .eq('company_id', companyId)
          .eq('name', DEFAULT_PIPELINE_NAME)
          .maybeSingle()

        if (legacyDefaultError) throw legacyDefaultError

        let pipelineId = legacyDefault?.id ?? null

        if (pipelineId) {
          const { error: attachIdentifierError } = await supabasebrowser
            .from('pipeline')
            .update({ identifier: DEFAULT_PIPELINE_IDENTIFIER, name: DEFAULT_PIPELINE_NAME })
            .eq('id', pipelineId)
          if (attachIdentifierError) throw attachIdentifierError
        } else {
          const { data: createdPipeline, error: createError } = await supabasebrowser
            .from('pipeline')
            .insert({
              company_id: companyId,
              name: DEFAULT_PIPELINE_NAME,
              description: null,
              identifier: DEFAULT_PIPELINE_IDENTIFIER,
            })
            .select('id')
            .single()

          if (createError) throw createError
          pipelineId = createdPipeline?.id ?? null
        }

        if (!pipelineId) {
          throw new Error('Funil padrão inválido.')
        }

        await syncDefaultPipelineStages(pipelineId)
        return pipelineId
      } catch (error) {
        console.error(error)
        toast.error('Não foi possível garantir o funil padrão da empresa.')
        return null
      }
    },
    [syncDefaultPipelineStages]
  )

  const loadPipelines = useCallback(
    async (companyId: number) => {
      setPipelinesLoading(true)

      try {
        const defaultPipelineId = await ensureDefaultPipeline(companyId)

        const { data, error } = await supabasebrowser
          .from('pipeline')
          .select('id, name, description, company_id, identifier')
          .eq('company_id', companyId)
          .order('created_at', { ascending: true })

        if (error) {
          console.error(error)
          toast.error('Erro ao carregar os funis.')
          return
        }

        const sortedPipelines = [...(data ?? [])].sort((a, b) => {
          if (a.identifier === DEFAULT_PIPELINE_IDENTIFIER && b.identifier !== DEFAULT_PIPELINE_IDENTIFIER) return -1
          if (b.identifier === DEFAULT_PIPELINE_IDENTIFIER && a.identifier !== DEFAULT_PIPELINE_IDENTIFIER) return 1
          return a.name.localeCompare(b.name)
        })

        setPipelines(sortedPipelines)

        setSelectedPipelineId((current) => {
          if (current && sortedPipelines.some((pipeline) => pipeline.id === current)) {
            return current
          }

          if (
            defaultPipelineId &&
            sortedPipelines.some((pipeline) => pipeline.id === defaultPipelineId)
          ) {
            return defaultPipelineId
          }

          const defaultPipeline = sortedPipelines.find(
            (pipeline) => pipeline.identifier === DEFAULT_PIPELINE_IDENTIFIER
          )
          return defaultPipeline?.id ?? sortedPipelines[0]?.id ?? null
        })

        if (!sortedPipelines.length) {
          setStages([])
          setCards([])
        }
      } finally {
        setPipelinesLoading(false)
      }
    },
    [ensureDefaultPipeline]
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

  useEffect(() => {
    clearRefreshCooldown()
  }, [clearRefreshCooldown, selectedPipelineId])

  useEffect(() => {
    return () => {
      clearRefreshCooldown()
    }
  }, [clearRefreshCooldown])

  useEffect(() => {
    if (!selectedPipelineId) {
      return
    }

    const intervalId = setInterval(() => {
      void loadBoard(selectedPipelineId)
    }, 5 * 60 * 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [loadBoard, selectedPipelineId])

  const selectedPipeline = useMemo(
    () => pipelines.find((pipeline) => pipeline.id === selectedPipelineId) ?? null,
    [pipelines, selectedPipelineId]
  )

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

      if (editingPipeline?.identifier === DEFAULT_PIPELINE_IDENTIFIER) {
        toast.error('O funil padrão não pode ser editado.')
        return
      }

      const name = pipelineForm.name.trim()
      if (!name) {
        toast.error('Informe um nome para o funil.')
        return
      }

      if (name.length > PIPELINE_NAME_MAX_LENGTH) {
        toast.error('O nome do funil excede o limite de 60 caracteres.')
        return
      }

      const description = pipelineForm.description.trim()
      if (description.length > PIPELINE_DESCRIPTION_MAX_LENGTH) {
        toast.error('A descrição do funil deve ter no máximo 240 caracteres.')
        return
      }

      const trimmedStages = pipelineForm.stages.map((stage) => ({
        ...stage,
        name: stage.name.trim(),
        color: normalizeStageColor(stage.color),
      }))

      if (!trimmedStages.length) {
        toast.error('Adicione pelo menos um estágio ao funil.')
        return
      }

      if (trimmedStages.some((stage) => !stage.name)) {
        toast.error('Informe o nome de todos os estágios.')
        return
      }

      if (trimmedStages.length > MAX_STAGES_PER_PIPELINE) {
        toast.error('Cada funil pode ter no máximo 10 estágios.')
        return
      }

      if (trimmedStages.some((stage) => stage.name.length > STAGE_NAME_MAX_LENGTH)) {
        toast.error('Os nomes dos estágios devem ter até 40 caracteres.')
        return
      }

      if (!editingPipeline && pipelines.length >= MAX_PIPELINES_PER_COMPANY) {
        toast.error('Você atingiu o limite de funis para esta empresa.')
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
              description: description || null,
            })
            .eq('id', editingPipeline.id)

          if (error) throw error
        } else {
          const { data, error } = await supabasebrowser
            .from('pipeline')
            .insert({
              name,
              description: description || null,
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
              color: stage.color,
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
              color: stage.color,
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
      pipelines,
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

      if (pipeline.identifier === DEFAULT_PIPELINE_IDENTIFIER) {
        toast.error('O funil padrão não pode ser excluído.')
        return
      }

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
        contact: card.contact,
      })
    } else {
      setEditingCard(null)
      setCardForm(createInitialCardForm())
    }
    setCardDialogOpen(true)
  }, [])

  const handleSelectCardStage = useCallback((stageId: string) => {
    setCardStageId(stageId)
  }, [])

  const handleCardSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!selectedPipelineId || !cardStageId) {
        toast.error('Selecione um estágio válido.')
        return
      }

      const contact = cardForm.contact.trim()
      if (!contact) {
        toast.error('Informe o contato da oportunidade.')
        return
      }

      if (contact.length > CARD_CONTACT_MAX_LENGTH) {
        toast.error('O contato deve ter até 120 caracteres.')
        return
      }

      const payload = {
        contact,
      }

      try {
        if (editingCard) {
          const isChangingStage = editingCard.stage_id !== cardStageId
          const destinationCards = getStageCards(cards, cardStageId).filter(
            (card) => card.id !== editingCard.id
          )
          const nextPosition = isChangingStage
            ? destinationCards.length
            : editingCard.position

          const { error } = await supabasebrowser
            .from('card')
            .update({
              ...payload,
              stage_id: cardStageId,
              position: nextPosition,
            })
            .eq('id', editingCard.id)
          if (error) throw error

          if (isChangingStage) {
            const sourceCards = getStageCards(cards, editingCard.stage_id).filter(
              (card) => card.id !== editingCard.id
            )

            const reindexResponses = await Promise.all(
              sourceCards.map((card, index) =>
                supabasebrowser
                  .from('card')
                  .update({ position: index })
                  .eq('id', card.id)
              )
            )

            const reindexError = reindexResponses.find(({ error }) => error)?.error
            if (reindexError) throw reindexError
          }
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
      if (!window.confirm(`Deseja remover a oportunidade "${card.contact}"?`)) {
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

  const handleTransferCard = useCallback(
    async (card: DealCard, targetPipelineId: string) => {
      if (card.pipeline_id === targetPipelineId) {
        toast.error('A oportunidade já está neste funil.')
        return
      }

      const targetPipeline = pipelines.find((pipeline) => pipeline.id === targetPipelineId)

      try {
        const { data: stageData, error: stageError } = await supabasebrowser
          .from('stage')
          .select('id')
          .eq('pipeline_id', targetPipelineId)
          .order('position', { ascending: true })
          .limit(1)

        if (stageError) throw stageError

        const targetStage = stageData?.[0]
        if (!targetStage) {
          toast.error('O funil selecionado não possui estágios configurados.')
          return
        }

        const { data: targetStageCards, error: targetStageCardsError } = await supabasebrowser
          .from('card')
          .select('id')
          .eq('stage_id', targetStage.id)

        if (targetStageCardsError) throw targetStageCardsError

        const nextPosition = targetStageCards?.length ?? 0

        const { error: updateError } = await supabasebrowser
          .from('card')
          .update({
            pipeline_id: targetPipelineId,
            stage_id: targetStage.id,
            position: nextPosition,
          })
          .eq('id', card.id)

        if (updateError) throw updateError

        const sourceCards = getStageCards(cards, card.stage_id).filter(
          (stageCard) => stageCard.id !== card.id
        )

        if (sourceCards.length) {
          const reindexResponses = await Promise.all(
            sourceCards.map((stageCard, index) =>
              supabasebrowser.from('card').update({ position: index }).eq('id', stageCard.id)
            )
          )

          const reindexError = reindexResponses.find(({ error }) => error)?.error
          if (reindexError) throw reindexError
        }

        toast.success(
          `Oportunidade transferida${
            targetPipeline ? ` para "${targetPipeline.name}"` : ''
          }.`
        )

        if (selectedPipelineId) {
          void loadBoard(selectedPipelineId)
        }
      } catch (error) {
        console.error(error)
        toast.error('Não foi possível transferir a oportunidade.')
      }
    },
    [cards, loadBoard, pipelines, selectedPipelineId]
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
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={handleManualRefresh}
            disabled={!selectedPipelineId || boardLoading || isRefreshCoolingDown}
          >
            {boardLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
            <span className="sr-only">Atualizar funil</span>
          </Button>
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
                {selectedPipeline ? (
                  <>
                    <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />
                    {selectedPipeline.identifier === DEFAULT_PIPELINE_IDENTIFIER ? (
                      <DropdownMenu.Item
                        disabled
                        className="flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-400"
                      >
                        Funil padrão fixo
                      </DropdownMenu.Item>
                    ) : (
                      <>
                        <DropdownMenu.Item
                          className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none transition hover:bg-slate-100 focus:bg-slate-100"
                          onSelect={() => {
                            if (selectedPipeline) {
                              void openEditPipelineDialog(selectedPipeline)
                            }
                          }}
                        >
                          Editar funil
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive outline-none transition hover:bg-destructive/10 focus:bg-destructive/10"
                          onSelect={() => {
                            if (selectedPipeline) {
                              void handleDeletePipeline(selectedPipeline.id)
                            }
                          }}
                        >
                          Excluir funil
                        </DropdownMenu.Item>
                      </>
                    )}
                  </>
                ) : null}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {pipelinesLoading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-gray-500">Carregando funis...</p>
        </div>
      ) : pipelines.length ? (
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

          <div className="-mx-2 overflow-x-auto pb-6">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex gap-4 px-2 snap-x snap-mandatory md:snap-none">
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
                    onTransferCard={handleTransferCard}
                    pipelines={pipelines}
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
        onUpdateStageColor={updatePipelineStageColor}
        onAddStage={addPipelineStage}
        onRemoveStage={removePipelineStage}
        onChangeField={handlePipelineFieldChange}
      />

      <CardDialog
        open={cardDialogOpen}
        editingCard={editingCard}
        form={cardForm}
        stages={stages}
        selectedStageId={cardStageId}
        onClose={closeCardDialog}
        onSubmit={handleCardSubmit}
        onChangeField={handleCardFieldChange}
        onSelectStage={handleSelectCardStage}
      />
    </div>
  )
}
