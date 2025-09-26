import {
  CardFormState,
  DEFAULT_STAGE_COLOR,
  PipelineFormState,
  PipelineStageForm,
} from './types'

export const createEmptyStage = (position: number): PipelineStageForm => ({
  name: '',
  position,
  color: DEFAULT_STAGE_COLOR,
})

export const reindexStages = (stages: PipelineStageForm[]): PipelineStageForm[] =>
  stages.map((stage, index) => ({ ...stage, position: index }))

export const createInitialPipelineForm = (): PipelineFormState => ({
  name: '',
  description: '',
  stages: [createEmptyStage(0)],
  removedStageIds: [],
})

export const createInitialCardForm = (): CardFormState => ({
  title: '',
  companyName: '',
  owner: '',
  tag: '',
  status: '',
  mrr: '',
  messagesCount: '',
  lastMessageAt: '',
  nextActionAt: '',
})

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value)
}

export function formatShortDate(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

export function toInputDate(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
}

export function fromInputDate(value: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}
