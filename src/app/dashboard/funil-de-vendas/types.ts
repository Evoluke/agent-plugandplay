export type Company = {
  id: number
  company_name: string | null
}

export type Pipeline = {
  id: string
  name: string
  description: string | null
  company_id: number
  identifier: string | null
}

export const DEFAULT_STAGE_COLOR = '#F8FAFC'

export type Stage = {
  id: string
  name: string
  position: number
  pipeline_id: string
  color: string
}

export type DealCard = {
  id: string
  contact: string
  position: number
  stage_id: string
  pipeline_id: string
}

export type PipelineStageForm = {
  id?: string
  name: string
  position: number
  color: string
}

export type PipelineFormState = {
  name: string
  description: string
  stages: PipelineStageForm[]
  removedStageIds: string[]
}

export type CardFormState = {
  contact: string
}
