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

export type Stage = {
  id: string
  name: string
  position: number
  pipeline_id: string
  color: string | null
}

export type DealCard = {
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
